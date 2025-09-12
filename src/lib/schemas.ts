import { z } from 'zod';
import { City, PropertyType, Bhk, Purpose, Timeline, Source } from '@prisma/client';

// This schema defines the validation rules for creating a buyer lead.
// It will be used for both client-side and server-side validation.

export const buyerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(80, "Full name cannot exceed 80 characters"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal('')),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number cannot exceed 15 digits").regex(/^\d+$/, "Phone number must only contain digits"),
  
  // Enums from the Prisma schema
  city: z.nativeEnum(City),
  propertyType: z.nativeEnum(PropertyType),
  bhk: z.nativeEnum(Bhk).optional(),
  purpose: z.nativeEnum(Purpose),
  timeline: z.nativeEnum(Timeline),
  source: z.nativeEnum(Source),

  budgetMin: z.coerce.number().int().positive().optional(),
  budgetMax: z.coerce.number().int().positive().optional(),
  
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
  tags: z.string().transform(val => val.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)).optional(),

}).refine(data => {
  // Conditional validation: 'bhk' is required if propertyType is Apartment or Villa
  if ((data.propertyType === 'Apartment' || data.propertyType === 'Villa') && !data.bhk) {
    return false;
  }
  return true;
}, {
  message: "BHK is required for Apartments and Villas",
  path: ["bhk"], // Specify which field the error belongs to
}).refine(data => {
  // Conditional validation: budgetMax must be >= budgetMin if both are provided
  if (data.budgetMin && data.budgetMax) {
    return data.budgetMax >= data.budgetMin;
  }
  return true;
}, {
  message: "Maximum budget must be greater than or equal to the minimum budget",
  path: ["budgetMax"],
});
