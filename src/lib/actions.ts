'use server';

import { buyerSchema } from './schemas';
import { csvImportSchema } from './csv-schema';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionUser, createSession } from './auth';
import { rateLimit, getRateLimitKey } from './rate-limit';

// Prisma client singleton to avoid exhausting connections in dev (Next.js HMR)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// TYPE for createBuyer
export type CreateBuyerFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

// TYPE for login
type LoginFormState = {
  error?: string;
};

// getUserIdFromSession now lives in auth.ts via getSessionUser()
async function getUserIdFromSession(): Promise<string | null> {
  const user = await getSessionUser();
  return user?.username ?? null;
}

async function getClientIP(): Promise<string> {
  const headersList = await headers();
  return headersList.get('x-forwarded-for') || 
         headersList.get('x-real-ip') || 
         'unknown';
}

// ------------------- LOGIN ACTION -------------------
// This now has the correct signature for useActionState
export async function login(
  previousState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const username = formData.get('username');
  const password = formData.get('password');

  if (
    username === process.env.DEMO_USER &&
    password === process.env.DEMO_PASSWORD
  ) {
    // Create the token payload
  const user = { username: 'admin' }; // In a real app, this would be a user ID
  const token = createSession(user);

    // Set the session cookie
    (await cookies()).set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    // Redirect to the buyers page on successful login
    redirect('/buyers');
  }

  // If login fails, return an error message
  return { error: 'Invalid username or password' };
}

// ------------------- CREATE BUYER ACTION -------------------
export async function createBuyer(
  previousState: CreateBuyerFormState,
  formData: FormData
): Promise<CreateBuyerFormState> {
  const ownerId = await getUserIdFromSession();
  if (!ownerId) {
    return {
      success: false,
      message: 'Authentication error. Please log in again.',
    };
  }

  // Rate limiting: 10 creates per hour per user
  const clientIP = await getClientIP();
  const rateLimitKey = getRateLimitKey(ownerId, 'create_buyer', clientIP);
  const rateCheck = rateLimit(rateLimitKey, { maxRequests: 10, windowMs: 60 * 60 * 1000 });
  
  if (!rateCheck.allowed) {
    return {
      success: false,
      message: `Too many requests. Please try again in ${Math.ceil((rateCheck.resetTime - Date.now()) / 60000)} minutes.`,
    };
  }

  const validatedFields = buyerSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check your inputs.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const validatedData = validatedFields.data;
    const tagsValue = validatedData.tags;

    const budgetMin = validatedData.budgetMin ? Number(validatedData.budgetMin) : null;
    const budgetMax = validatedData.budgetMax ? Number(validatedData.budgetMax) : null;

    console.log('createBuyer: attempt', { ownerId, email: validatedData.email, phone: validatedData.phone });

    // Process tags
    let processedTags: string[] = [];
    const tagsAsUnknown = tagsValue as unknown;
    if (typeof tagsAsUnknown === 'string' && tagsAsUnknown.length > 0) {
      processedTags = tagsAsUnknown.split(',').map((t: string) => t.trim()).filter(Boolean);
    } else if (Array.isArray(tagsAsUnknown)) {
      processedTags = tagsAsUnknown;
    }

    // Simpler sequential writes to avoid transaction timeout (P2028)
    const newBuyer = await prisma.buyer.create({
      data: {
        fullName: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone,
        city: validatedData.city,
        propertyType: validatedData.propertyType,
        bhk: validatedData.bhk,
        purpose: validatedData.purpose,
        timeline: validatedData.timeline,
        source: validatedData.source,
        status: validatedData.status || 'New',
        notes: validatedData.notes,
        budgetMin,
        budgetMax,
        tags: processedTags,
        ownerId,
      },
    });
    await prisma.buyerHistory.create({
      data: {
        buyerId: newBuyer.id,
        changedBy: ownerId,
        diff: { initial_creation: newBuyer },
      },
    });

    revalidatePath('/buyers');
  } catch (error: unknown) {
    console.error('Create buyer failed:', error);
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2002') {
      return {
        success: false,
        message: 'A record with this unique field already exists (likely email).',
        errors: { email: ['Email already in use'] },
      };
    }
    if (prismaError.code === 'P2028') {
      return {
        success: false,
        message: 'Database was busy. Please retry in a moment (timeout).',
      };
    }
    return {
      success: false,
      message: 'An unexpected error occurred. Could not create buyer.',
    };
  }

  // On success, redirect to the main list page
  redirect('/buyers');
}

// ------------------- UPDATE BUYER ACTION -------------------
export type UpdateBuyerFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  concurrencyError?: boolean;
  notFound?: boolean;
  unauthorized?: boolean;
};

export async function updateBuyer(
  previousState: UpdateBuyerFormState,
  formData: FormData
): Promise<UpdateBuyerFormState> {
  const ownerId = await getUserIdFromSession();
  if (!ownerId) {
    return { success: false, message: 'Authentication error. Please log in again.' };
  }

  // Rate limiting: 20 updates per hour per user
  const clientIP = await getClientIP();
  const rateLimitKey = getRateLimitKey(ownerId, 'update_buyer', clientIP);
  const rateCheck = rateLimit(rateLimitKey, { maxRequests: 20, windowMs: 60 * 60 * 1000 });
  
  if (!rateCheck.allowed) {
    return {
      success: false,
      message: `Too many requests. Please try again in ${Math.ceil((rateCheck.resetTime - Date.now()) / 60000)} minutes.`,
    };
  }

  const id = formData.get('id') as string | undefined;
  const clientUpdatedAt = formData.get('updatedAt') as string | undefined; // ISO timestamp from hidden input
  if (!id || !clientUpdatedAt) {
    return { success: false, message: 'Missing record identity or timestamp.' };
  }

  // Re-validate fields using buyerSchema; reuse buyerSchema but allow absence of some values? For now we expect full form submit
  const validated = buyerSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validated.success) {
    return {
      success: false,
      message: 'Validation failed. Please check your inputs.',
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const validatedUpdateData = validated.data;
  const tagsUpdateValue = validatedUpdateData.tags;
  const budgetMin = validatedUpdateData.budgetMin ? Number(validatedUpdateData.budgetMin) : null;
  const budgetMax = validatedUpdateData.budgetMax ? Number(validatedUpdateData.budgetMax) : null;

  // Process tags for update
  let newTags: string[] = [];
  const tagsAsUnknown = tagsUpdateValue as unknown;
  if (typeof tagsAsUnknown === 'string' && tagsAsUnknown.length > 0) {
    newTags = tagsAsUnknown.split(',').map((t: string) => t.trim()).filter(Boolean);
  } else if (Array.isArray(tagsAsUnknown)) {
    newTags = tagsAsUnknown;
  }

  try {
    const existing = await prisma.buyer.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, message: 'Record not found.', notFound: true };
    }
    if (existing.ownerId !== ownerId) {
      return { success: false, message: 'You are not allowed to modify this record.', unauthorized: true };
    }
    const existingTs = existing.updatedAt.getTime();
    const clientTs = Date.parse(clientUpdatedAt);
    
    // DEBUG: Log exact values to understand mismatch
    console.log('updateBuyer concurrency check:', {
      existingUpdatedAt: existing.updatedAt.toISOString(),
      clientUpdatedAt,
      existingTs,
      clientTs,
      difference: existingTs - clientTs,
      match: existingTs === clientTs
    });
    
    if (isNaN(clientTs)) {
      console.warn('updateBuyer: client provided invalid updatedAt', { clientUpdatedAt });
      return { success: false, message: 'Stale form. Please refresh.', concurrencyError: true };
    }
    if (existingTs !== clientTs) {
      console.error('updateBuyer: Concurrency check failed', {
        existingTs,
        clientTs,
        existingISO: existing.updatedAt.toISOString(),
        clientString: clientUpdatedAt
      });
      return { success: false, message: 'Record was modified by someone else. Reload and re-apply changes.', concurrencyError: true };
    }

    const updated = await prisma.buyer.update({
      where: { id },
      data: {
        fullName: validatedUpdateData.fullName,
        email: validatedUpdateData.email,
        phone: validatedUpdateData.phone,
        city: validatedUpdateData.city,
        propertyType: validatedUpdateData.propertyType,
        bhk: validatedUpdateData.bhk,
        purpose: validatedUpdateData.purpose,
        timeline: validatedUpdateData.timeline,
        source: validatedUpdateData.source,
        status: validatedUpdateData.status,
        notes: validatedUpdateData.notes,
        budgetMin,
        budgetMax,
        tags: newTags,
      },
    });

    // Create diff object for history tracking
    const diff: Record<string, unknown> = {};
    const fieldsToCompare = [
      'fullName','email','phone','city','propertyType','bhk','purpose','budgetMin','budgetMax','timeline','source','status','notes'
    ];
    for (const f of fieldsToCompare) {
      const oldValue = (existing as Record<string, unknown>)[f];
      const newValue = (updated as Record<string, unknown>)[f];
      if (oldValue !== newValue) {
        diff[f] = { from: oldValue, to: newValue };
      }
    }
    if (JSON.stringify(existing.tags) !== JSON.stringify(updated.tags)) {
      diff['tags'] = { from: existing.tags, to: updated.tags };
    }

    if (Object.keys(diff).length > 0) {
      await prisma.buyerHistory.create({
        data: {
          buyerId: id,
          changedBy: ownerId,
          diff: diff as object,
        },
      });
    }

    revalidatePath('/buyers');
    revalidatePath(`/buyers/${id}`);
    return { success: true, message: 'Buyer updated successfully.' };
  } catch (error: unknown) {
    console.error('Update buyer failed:', error);
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2002') {
      return { success: false, message: 'Unique field conflict (email).', errors: { email: ['Email already in use'] } };
    }
    if (prismaError.code === 'P2028') {
      return { success: false, message: 'Database busy, please retry shortly.' };
    }
  return { success: false, message: 'Unexpected error updating buyer.' };
  }
}

// ------------------- CSV IMPORT ACTION -------------------
export type CSVImportResult = {
  success: boolean;
  message: string;
  totalRows: number;
  validRows: number;
  errors: Array<{ row: number; message: string; data?: string | Record<string, unknown> }>;
};

export async function importBuyersCSV(formData: FormData): Promise<CSVImportResult> {
  const ownerId = await getUserIdFromSession();
  if (!ownerId) {
    return { success: false, message: 'Authentication required', totalRows: 0, validRows: 0, errors: [] };
  }

  const file = formData.get('csvFile') as File;
  if (!file || !file.name.endsWith('.csv')) {
    return { success: false, message: 'Please upload a valid CSV file', totalRows: 0, validRows: 0, errors: [] };
  }

  try {
    const fileContent = await file.text();
    const lines = fileContent.split('\n').map(line => line.trim()).filter(Boolean);
    
    if (lines.length === 0) {
      return { success: false, message: 'Empty CSV file', totalRows: 0, validRows: 0, errors: [] };
    }

    if (lines.length > 201) { // 200 data rows + 1 header
      return { success: false, message: 'CSV file too large. Maximum 200 rows allowed.', totalRows: lines.length - 1, validRows: 0, errors: [] };
    }

    // Parse header
    const headerLine = lines[0];
    const requiredHeaders = ['fullName', 'phone', 'city', 'propertyType', 'purpose', 'budgetMin', 'budgetMax', 'timeline', 'source', 'status'];
    const headers = headerLine.split(',').map(h => h.replace(/^"|"$/g, '').trim());
    
    // Validate only required headers are present
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return { 
        success: false, 
        message: `Missing required headers: ${missingHeaders.join(', ')}. Required: ${requiredHeaders.join(', ')}`, 
        totalRows: lines.length - 1, 
        validRows: 0, 
        errors: [] 
      };
    }

    const errors: Array<{ row: number; message: string; data?: string | Record<string, unknown> }> = [];
    const validBuyers: Record<string, unknown>[] = [];

    // Process data rows
    for (let i = 1; i < lines.length; i++) {
      const rowNum = i + 1; // 1-indexed for user display
      const line = lines[i];
      
      try {
        // Parse CSV row (simple implementation)
        const values = line.split(',').map(v => v.replace(/^"|"$/g, '').trim());
        const rowData: Record<string, unknown> = {};
        
        headers.forEach((header, index) => {
          const value = values[index] || '';
          if (header === 'tags') {
            rowData[header] = value ? value.split(';').map(t => t.trim()).filter(Boolean) : [];
          } else if (header === 'budgetMin' || header === 'budgetMax') {
            rowData[header] = value ? Number(value) : null;
          } else if (header === 'email' || header === 'bhk' || header === 'notes') {
            // Optional fields - empty string becomes null
            rowData[header] = value || null;
          } else {
            rowData[header] = value;
          }
        });

        // Validate using csvImportSchema instead of buyerSchema
        const validated = csvImportSchema.safeParse(rowData);
        if (!validated.success) {
          const fieldErrors = Object.entries(validated.error.flatten().fieldErrors)
            .map(([field, errors]) => `${field}: ${errors?.join(', ')}`)
            .join('; ');
          errors.push({ row: rowNum, message: `Validation failed: ${fieldErrors}`, data: rowData });
          continue;
        }

        const validatedCsvData = validated.data;
        const csvTags = validatedCsvData.tags;
        
        // Process CSV tags
        let processedCsvTags: string[] = [];
        const csvTagsAsUnknown = csvTags as unknown;
        if (Array.isArray(csvTagsAsUnknown)) {
          processedCsvTags = csvTagsAsUnknown;
        } else if (typeof csvTagsAsUnknown === 'string' && csvTagsAsUnknown.trim()) {
          processedCsvTags = csvTagsAsUnknown.split(',').map((t: string) => t.trim()).filter(Boolean);
        }

        const validBuyer = {
          fullName: validatedCsvData.fullName,
          email: validatedCsvData.email,
          phone: validatedCsvData.phone,
          city: validatedCsvData.city,
          propertyType: validatedCsvData.propertyType,
          bhk: validatedCsvData.bhk,
          purpose: validatedCsvData.purpose,
          timeline: validatedCsvData.timeline,
          source: validatedCsvData.source,
          status: validatedCsvData.status || 'New',
          notes: validatedCsvData.notes,
          budgetMin: validatedCsvData.budgetMin ? Number(validatedCsvData.budgetMin) : null,
          budgetMax: validatedCsvData.budgetMax ? Number(validatedCsvData.budgetMax) : null,
          tags: processedCsvTags,
          ownerId,
        };

        validBuyers.push(validBuyer);
      } catch (parseError) {
        errors.push({ row: rowNum, message: `Parse error: ${parseError}`, data: line });
      }
    }

    // Import valid buyers sequentially (no transaction to avoid timeout)
    if (validBuyers.length > 0) {
      try {
        for (const buyerData of validBuyers) {
          const buyer = await prisma.buyer.create({ 
            data: buyerData as never
          });
          // Create history entry
          await prisma.buyerHistory.create({
            data: {
              buyerId: buyer.id,
              changedBy: ownerId,
              diff: { csv_import: buyer },
            },
          });
        }
      } catch (createError: unknown) {
        console.error('Error creating buyers:', createError);
        const errorMessage = createError instanceof Error ? createError.message : 'Unknown error';
        return {
          success: false,
          message: `Failed to import buyers: ${errorMessage}`,
          totalRows: lines.length - 1,
          validRows: 0,
          errors: []
        };
      }

      revalidatePath('/buyers');
    }

    return {
      success: true,
      message: `Import completed. ${validBuyers.length} of ${lines.length - 1} rows imported successfully.`,
      totalRows: lines.length - 1,
      validRows: validBuyers.length,
      errors,
    };
  } catch (error: unknown) {
    console.error('CSV import failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { 
      success: false, 
      message: `Import failed: ${errorMessage}`, 
      totalRows: 0, 
      validRows: 0, 
      errors: [] 
    };
  }
}

