import { z } from 'zod';

// User role enum
export const userRoleSchema = z.enum(['owner', 'sitter', 'both']);
export type UserRole = z.infer<typeof userRoleSchema>;

// User schema
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password_hash: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string().nullable(),
  profile_image_url: z.string().nullable(),
  role: userRoleSchema,
  location: z.string().nullable(),
  bio: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// User input schemas
export const createUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().nullable(),
  role: userRoleSchema,
  location: z.string().nullable(),
  bio: z.string().nullable()
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const updateUserInputSchema = z.object({
  id: z.number(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().nullable().optional(),
  profile_image_url: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  bio: z.string().nullable().optional()
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

// Dog size and temperament enums
export const dogSizeSchema = z.enum(['small', 'medium', 'large', 'extra_large']);
export type DogSize = z.infer<typeof dogSizeSchema>;

export const dogTemperamentSchema = z.enum(['calm', 'playful', 'energetic', 'aggressive', 'anxious', 'friendly']);
export type DogTemperament = z.infer<typeof dogTemperamentSchema>;

// Dog schema
export const dogSchema = z.object({
  id: z.number(),
  owner_id: z.number(),
  name: z.string(),
  breed: z.string().nullable(),
  age: z.number().int(),
  size: dogSizeSchema,
  weight: z.number().nullable(),
  temperament: dogTemperamentSchema.array(),
  medical_notes: z.string().nullable(),
  special_instructions: z.string().nullable(),
  profile_image_url: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Dog = z.infer<typeof dogSchema>;

// Dog input schemas
export const createDogInputSchema = z.object({
  owner_id: z.number(),
  name: z.string().min(1),
  breed: z.string().nullable(),
  age: z.number().int().min(0),
  size: dogSizeSchema,
  weight: z.number().positive().nullable(),
  temperament: dogTemperamentSchema.array(),
  medical_notes: z.string().nullable(),
  special_instructions: z.string().nullable(),
  profile_image_url: z.string().nullable()
});

export type CreateDogInput = z.infer<typeof createDogInputSchema>;

export const updateDogInputSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  breed: z.string().nullable().optional(),
  age: z.number().int().min(0).optional(),
  size: dogSizeSchema.optional(),
  weight: z.number().positive().nullable().optional(),
  temperament: dogTemperamentSchema.array().optional(),
  medical_notes: z.string().nullable().optional(),
  special_instructions: z.string().nullable().optional(),
  profile_image_url: z.string().nullable().optional(),
  is_active: z.boolean().optional()
});

export type UpdateDogInput = z.infer<typeof updateDogInputSchema>;

// Service type enum
export const serviceTypeSchema = z.enum(['dog_walking', 'pet_sitting', 'daycare', 'overnight_care', 'grooming']);
export type ServiceType = z.infer<typeof serviceTypeSchema>;

// Sitter listing schema
export const sitterListingSchema = z.object({
  id: z.number(),
  sitter_id: z.number(),
  title: z.string(),
  description: z.string(),
  services_offered: serviceTypeSchema.array(),
  price_per_hour: z.number(),
  price_per_day: z.number().nullable(),
  price_per_night: z.number().nullable(),
  max_dogs: z.number().int(),
  accepts_sizes: dogSizeSchema.array(),
  location: z.string(),
  radius_km: z.number(),
  experience_years: z.number().int(),
  has_yard: z.boolean(),
  has_insurance: z.boolean(),
  emergency_contact: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type SitterListing = z.infer<typeof sitterListingSchema>;

// Sitter listing input schemas
export const createSitterListingInputSchema = z.object({
  sitter_id: z.number(),
  title: z.string().min(1),
  description: z.string().min(10),
  services_offered: serviceTypeSchema.array().min(1),
  price_per_hour: z.number().positive(),
  price_per_day: z.number().positive().nullable(),
  price_per_night: z.number().positive().nullable(),
  max_dogs: z.number().int().min(1),
  accepts_sizes: dogSizeSchema.array().min(1),
  location: z.string().min(1),
  radius_km: z.number().positive(),
  experience_years: z.number().int().min(0),
  has_yard: z.boolean(),
  has_insurance: z.boolean(),
  emergency_contact: z.string().nullable()
});

export type CreateSitterListingInput = z.infer<typeof createSitterListingInputSchema>;

export const updateSitterListingInputSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  description: z.string().optional(),
  services_offered: serviceTypeSchema.array().optional(),
  price_per_hour: z.number().positive().optional(),
  price_per_day: z.number().positive().nullable().optional(),
  price_per_night: z.number().positive().nullable().optional(),
  max_dogs: z.number().int().min(1).optional(),
  accepts_sizes: dogSizeSchema.array().optional(),
  location: z.string().optional(),
  radius_km: z.number().positive().optional(),
  experience_years: z.number().int().min(0).optional(),
  has_yard: z.boolean().optional(),
  has_insurance: z.boolean().optional(),
  emergency_contact: z.string().nullable().optional(),
  is_active: z.boolean().optional()
});

export type UpdateSitterListingInput = z.infer<typeof updateSitterListingInputSchema>;

// Search filters schema
export const searchSittersInputSchema = z.object({
  location: z.string().optional(),
  radius_km: z.number().positive().optional(),
  service_type: serviceTypeSchema.optional(),
  dog_size: dogSizeSchema.optional(),
  max_price_per_hour: z.number().positive().optional(),
  has_yard: z.boolean().optional(),
  has_insurance: z.boolean().optional(),
  min_experience_years: z.number().int().min(0).optional()
});

export type SearchSittersInput = z.infer<typeof searchSittersInputSchema>;

// Booking status enum
export const bookingStatusSchema = z.enum(['pending', 'accepted', 'rejected', 'completed', 'cancelled']);
export type BookingStatus = z.infer<typeof bookingStatusSchema>;

// Booking schema
export const bookingSchema = z.object({
  id: z.number(),
  owner_id: z.number(),
  sitter_id: z.number(),
  dog_id: z.number(),
  listing_id: z.number(),
  service_type: serviceTypeSchema,
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  total_hours: z.number().nullable(),
  total_days: z.number().nullable(),
  total_price: z.number(),
  status: bookingStatusSchema,
  special_requests: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Booking = z.infer<typeof bookingSchema>;

// Booking input schemas
export const createBookingInputSchema = z.object({
  owner_id: z.number(),
  sitter_id: z.number(),
  dog_id: z.number(),
  listing_id: z.number(),
  service_type: serviceTypeSchema,
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  special_requests: z.string().nullable()
});

export type CreateBookingInput = z.infer<typeof createBookingInputSchema>;

export const updateBookingStatusInputSchema = z.object({
  id: z.number(),
  status: bookingStatusSchema,
  notes: z.string().nullable().optional()
});

export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusInputSchema>;

// Message schema
export const messageSchema = z.object({
  id: z.number(),
  booking_id: z.number(),
  sender_id: z.number(),
  receiver_id: z.number(),
  content: z.string(),
  is_read: z.boolean(),
  created_at: z.coerce.date()
});

export type Message = z.infer<typeof messageSchema>;

// Message input schema
export const createMessageInputSchema = z.object({
  booking_id: z.number(),
  sender_id: z.number(),
  receiver_id: z.number(),
  content: z.string().min(1)
});

export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;

export const markMessageReadInputSchema = z.object({
  id: z.number()
});

export type MarkMessageReadInput = z.infer<typeof markMessageReadInputSchema>;

// Review schema
export const reviewSchema = z.object({
  id: z.number(),
  booking_id: z.number(),
  reviewer_id: z.number(),
  reviewee_id: z.number(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  created_at: z.coerce.date()
});

export type Review = z.infer<typeof reviewSchema>;

// Review input schema
export const createReviewInputSchema = z.object({
  booking_id: z.number(),
  reviewer_id: z.number(),
  reviewee_id: z.number(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable()
});

export type CreateReviewInput = z.infer<typeof createReviewInputSchema>;