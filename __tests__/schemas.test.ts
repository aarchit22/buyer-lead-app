import { buyerSchema } from '../src/lib/schemas';

describe('buyerSchema validation', () => {
  const validBuyerData = {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '9876543210',
    city: 'Chandigarh',
    propertyType: 'Apartment',
    bhk: 'Two',
    purpose: 'Buy',
    budgetMin: '5000000',
    budgetMax: '7000000',
    timeline: 'ThreeToSixMonths',
    source: 'Website',
    status: 'New',
    notes: 'Looking for a nice 2BHK apartment',
    tags: 'urgent,verified'
  };

  test('should validate a complete buyer object', () => {
    const result = buyerSchema.safeParse(validBuyerData);
    if (!result.success) {
      console.log('Validation errors:', JSON.stringify(result.error.flatten(), null, 2));
    }
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fullName).toBe('John Doe');
      expect(result.data.budgetMin).toBe(5000000);
      expect(result.data.budgetMax).toBe(7000000);
    }
  });

  test('should require fullName with minimum length', () => {
    const invalidData = { ...validBuyerData, fullName: 'J' };
    const result = buyerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.fullName).toBeDefined();
    }
  });

  test('should validate phone number format', () => {
    const invalidData = { ...validBuyerData, phone: '123' };
    const result = buyerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.phone).toBeDefined();
    }
  });

  test('should validate email format when provided', () => {
    const invalidData = { ...validBuyerData, email: 'invalid-email' };
    const result = buyerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined();
    }
  });

  test('should allow empty email', () => {
    const { email, ...dataWithoutEmail } = validBuyerData;
    const result = buyerSchema.safeParse(dataWithoutEmail);
    expect(result.success).toBe(true);
  });

  test('should validate budget ordering', () => {
    const invalidData = { 
      ...validBuyerData, 
      budgetMin: '8000000', 
      budgetMax: '5000000' 
    };
    const result = buyerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.budgetMax).toBeDefined();
    }
  });

  test('should require BHK for Apartment property type', () => {
    const { bhk, ...invalidData } = { ...validBuyerData, propertyType: 'Apartment' };
    const result = buyerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.bhk).toBeDefined();
    }
  });

  test('should not require BHK for Office property type', () => {
    const { bhk, ...validData } = { 
      ...validBuyerData, 
      propertyType: 'Office' 
    };
    const result = buyerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  test('should validate enum values', () => {
    const invalidData = { ...validBuyerData, city: 'InvalidCity' };
    const result = buyerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.city).toBeDefined();
    }
  });

  test('should limit notes length', () => {
    const longNotes = 'a'.repeat(1001);
    const invalidData = { ...validBuyerData, notes: longNotes };
    const result = buyerSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.notes).toBeDefined();
    }
  });
});
