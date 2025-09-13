import { z } from 'zod';
import { City, PropertyType, Purpose, Timeline, Source, Status, Bhk } from '@prisma/client';

// Separate schema for CSV import with only required fields
export const csvImportSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(80, 'Full name too long'),
  phone: z.string().regex(/^\d{10,15}$/, 'Phone must be 10-15 digits'),
  city: z.nativeEnum(City),
  propertyType: z.nativeEnum(PropertyType),
  purpose: z.nativeEnum(Purpose),
  budgetMin: z.number().positive().optional().nullable(),
  budgetMax: z.number().positive().optional().nullable(),
  timeline: z.nativeEnum(Timeline),
  source: z.nativeEnum(Source),
  status: z.nativeEnum(Status),
  // Optional fields for CSV import
  email: z.string().email().optional().nullable().or(z.literal('')),
  bhk: z.nativeEnum(Bhk).optional().nullable().or(z.literal('')),
  notes: z.string().max(1000, 'Notes too long').optional().nullable().or(z.literal('')),
  tags: z.array(z.string()).optional().nullable(),
}).refine((data) => {
  // Only validate budget ordering if both are provided
  if (data.budgetMin && data.budgetMax) {
    return data.budgetMax >= data.budgetMin;
  }
  return true;
}, {
  message: 'Budget maximum must be greater than or equal to budget minimum',
  path: ['budgetMax'],
});

export type CSVImportData = z.infer<typeof csvImportSchema>;
