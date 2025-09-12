// app/actions.ts
'use server';

import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';


import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { buyerSchema } from './schemas';

export async function login(formData: FormData) {
  const username = formData.get('username');
  const password = formData.get('password');

  // 1. Check if the credentials are valid
  if (
    username === process.env.DEMO_USER &&
    password === process.env.DEMO_PASSWORD
  ) {
    // 2. Create the JWT token
    const user = { username: 'admin' };
    const token = sign(user, process.env.JWT_SECRET!, { expiresIn: '1h' });

    // 3. Set the cookie
  (await cookies()).set('session', token, {
      httpOnly: true, // Prevents client-side JS from accessing the cookie
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    // 4. Redirect to the main page
    redirect('/buyers');
  }

  // If login fails
  return { error: 'Invalid username or password' };
}

const prisma = new PrismaClient();

// Define a type for our server action's return value
export type FormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export async function createBuyer(prevState: FormState, formData: FormData): Promise<FormState> {
  // 1. Validate the form data using our Zod schema
  const validatedFields = buyerSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    console.error("Validation failed:", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      message: "Validation failed. Please check the form for errors.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const data = validatedFields.data;

  try {
    // 2. Use a transaction to create both the buyer and the history entry
    await prisma.$transaction(async (tx) => {
      const newBuyer = await tx.buyer.create({
        data: {
          ...data,
          // For now, hardcode the ownerId as per the simple auth setup
          ownerId: 'admin-user-id', 
          // Prisma will handle optional fields that are not provided
          bhk: data.bhk,
          budgetMin: data.budgetMin,
          budgetMax: data.budgetMax,
          notes: data.notes,
          tags: data.tags || [],
        },
      });

      await tx.buyerHistory.create({
        data: {
          buyerId: newBuyer.id,
          changedBy: 'admin-user-id', // Hardcode for now
          diff: { created: newBuyer }, // Store the initial object as the 'diff'
        },
      });
    });

  } catch (error) {
    console.error("Database error:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Could not create buyer.",
    };
  }

  // 3. Revalidate the cache for the buyers list page and redirect
  revalidatePath('/buyers');
  redirect('/buyers');

  // This part is technically unreachable due to the redirect, but good for type safety
  return {
    success: true,
    message: "Successfully created buyer lead.",
  };
}
