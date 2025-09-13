// Constants derived from Prisma enums in prisma/schema.prisma
export const cities = [
  'Chandigarh',
  'Mohali',
  'Zirakpur',
  'Panchkula',
  'Other',
] as const;

export const propertyTypes = [
  'Apartment',
  'Villa',
  'Plot',
  'Office',
  'Retail',
] as const;

export const bhkOptions = [
  'Studio',
  'One',
  'Two',
  'Three',
  'Four',
] as const;

export const purposes = [
  'Buy',
  'Rent',
] as const;

export const timelines = [
  'Immediate',
  'ThreeToSixMonths',
  'MoreThanSixMonths',
  'Exploring',
] as const;

export const sources = [
  'Website',
  'Referral',
  'WalkIn',
  'Call',
  'Other',
] as const;

export const statuses = [
  'New',
  'Qualified',
  'Contacted',
  'Visited',
  'Negotiation',
  'Converted',
  'Dropped',
] as const;

export type City = (typeof cities)[number];
export type PropertyType = (typeof propertyTypes)[number];
export type Bhk = (typeof bhkOptions)[number];
export type Purpose = (typeof purposes)[number];
export type Timeline = (typeof timelines)[number];
export type Source = (typeof sources)[number];
export type Status = (typeof statuses)[number];
