import { 
  serial, 
  text, 
  pgTable, 
  timestamp, 
  numeric, 
  integer,
  boolean,
  pgEnum,
  jsonb
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['owner', 'sitter', 'both']);
export const dogSizeEnum = pgEnum('dog_size', ['small', 'medium', 'large', 'extra_large']);
export const dogTemperamentEnum = pgEnum('dog_temperament', ['calm', 'playful', 'energetic', 'aggressive', 'anxious', 'friendly']);
export const serviceTypeEnum = pgEnum('service_type', ['dog_walking', 'pet_sitting', 'daycare', 'overnight_care', 'grooming']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'accepted', 'rejected', 'completed', 'cancelled']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  phone: text('phone'),
  profile_image_url: text('profile_image_url'),
  role: userRoleEnum('role').notNull(),
  location: text('location'),
  bio: text('bio'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Dogs table
export const dogsTable = pgTable('dogs', {
  id: serial('id').primaryKey(),
  owner_id: integer('owner_id').notNull().references(() => usersTable.id),
  name: text('name').notNull(),
  breed: text('breed'),
  age: integer('age').notNull(),
  size: dogSizeEnum('size').notNull(),
  weight: numeric('weight', { precision: 5, scale: 2 }),
  temperament: jsonb('temperament').notNull().$type<string[]>(), // Array of temperament values
  medical_notes: text('medical_notes'),
  special_instructions: text('special_instructions'),
  profile_image_url: text('profile_image_url'),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Sitter listings table
export const sitterListingsTable = pgTable('sitter_listings', {
  id: serial('id').primaryKey(),
  sitter_id: integer('sitter_id').notNull().references(() => usersTable.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  services_offered: jsonb('services_offered').notNull().$type<string[]>(), // Array of service types
  price_per_hour: numeric('price_per_hour', { precision: 8, scale: 2 }).notNull(),
  price_per_day: numeric('price_per_day', { precision: 8, scale: 2 }),
  price_per_night: numeric('price_per_night', { precision: 8, scale: 2 }),
  max_dogs: integer('max_dogs').notNull(),
  accepts_sizes: jsonb('accepts_sizes').notNull().$type<string[]>(), // Array of dog sizes
  location: text('location').notNull(),
  radius_km: numeric('radius_km', { precision: 5, scale: 2 }).notNull(),
  experience_years: integer('experience_years').notNull(),
  has_yard: boolean('has_yard').default(false).notNull(),
  has_insurance: boolean('has_insurance').default(false).notNull(),
  emergency_contact: text('emergency_contact'),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Bookings table
export const bookingsTable = pgTable('bookings', {
  id: serial('id').primaryKey(),
  owner_id: integer('owner_id').notNull().references(() => usersTable.id),
  sitter_id: integer('sitter_id').notNull().references(() => usersTable.id),
  dog_id: integer('dog_id').notNull().references(() => dogsTable.id),
  listing_id: integer('listing_id').notNull().references(() => sitterListingsTable.id),
  service_type: serviceTypeEnum('service_type').notNull(),
  start_date: timestamp('start_date').notNull(),
  end_date: timestamp('end_date').notNull(),
  total_hours: numeric('total_hours', { precision: 8, scale: 2 }),
  total_days: integer('total_days'),
  total_price: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  status: bookingStatusEnum('status').default('pending').notNull(),
  special_requests: text('special_requests'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Messages table
export const messagesTable = pgTable('messages', {
  id: serial('id').primaryKey(),
  booking_id: integer('booking_id').notNull().references(() => bookingsTable.id),
  sender_id: integer('sender_id').notNull().references(() => usersTable.id),
  receiver_id: integer('receiver_id').notNull().references(() => usersTable.id),
  content: text('content').notNull(),
  is_read: boolean('is_read').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Reviews table
export const reviewsTable = pgTable('reviews', {
  id: serial('id').primaryKey(),
  booking_id: integer('booking_id').notNull().references(() => bookingsTable.id),
  reviewer_id: integer('reviewer_id').notNull().references(() => usersTable.id),
  reviewee_id: integer('reviewee_id').notNull().references(() => usersTable.id),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  dogs: many(dogsTable),
  sitterListings: many(sitterListingsTable),
  ownedBookings: many(bookingsTable, { relationName: 'owner' }),
  sittingBookings: many(bookingsTable, { relationName: 'sitter' }),
  sentMessages: many(messagesTable, { relationName: 'sender' }),
  receivedMessages: many(messagesTable, { relationName: 'receiver' }),
  givenReviews: many(reviewsTable, { relationName: 'reviewer' }),
  receivedReviews: many(reviewsTable, { relationName: 'reviewee' })
}));

export const dogsRelations = relations(dogsTable, ({ one, many }) => ({
  owner: one(usersTable, {
    fields: [dogsTable.owner_id],
    references: [usersTable.id]
  }),
  bookings: many(bookingsTable)
}));

export const sitterListingsRelations = relations(sitterListingsTable, ({ one, many }) => ({
  sitter: one(usersTable, {
    fields: [sitterListingsTable.sitter_id],
    references: [usersTable.id]
  }),
  bookings: many(bookingsTable)
}));

export const bookingsRelations = relations(bookingsTable, ({ one, many }) => ({
  owner: one(usersTable, {
    fields: [bookingsTable.owner_id],
    references: [usersTable.id],
    relationName: 'owner'
  }),
  sitter: one(usersTable, {
    fields: [bookingsTable.sitter_id],
    references: [usersTable.id],
    relationName: 'sitter'
  }),
  dog: one(dogsTable, {
    fields: [bookingsTable.dog_id],
    references: [dogsTable.id]
  }),
  listing: one(sitterListingsTable, {
    fields: [bookingsTable.listing_id],
    references: [sitterListingsTable.id]
  }),
  messages: many(messagesTable),
  reviews: many(reviewsTable)
}));

export const messagesRelations = relations(messagesTable, ({ one }) => ({
  booking: one(bookingsTable, {
    fields: [messagesTable.booking_id],
    references: [bookingsTable.id]
  }),
  sender: one(usersTable, {
    fields: [messagesTable.sender_id],
    references: [usersTable.id],
    relationName: 'sender'
  }),
  receiver: one(usersTable, {
    fields: [messagesTable.receiver_id],
    references: [usersTable.id],
    relationName: 'receiver'
  })
}));

export const reviewsRelations = relations(reviewsTable, ({ one }) => ({
  booking: one(bookingsTable, {
    fields: [reviewsTable.booking_id],
    references: [bookingsTable.id]
  }),
  reviewer: one(usersTable, {
    fields: [reviewsTable.reviewer_id],
    references: [usersTable.id],
    relationName: 'reviewer'
  }),
  reviewee: one(usersTable, {
    fields: [reviewsTable.reviewee_id],
    references: [usersTable.id],
    relationName: 'reviewee'
  })
}));

// Export all tables for proper query building
export const tables = {
  users: usersTable,
  dogs: dogsTable,
  sitterListings: sitterListingsTable,
  bookings: bookingsTable,
  messages: messagesTable,
  reviews: reviewsTable
};

// TypeScript types for database operations
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export type Dog = typeof dogsTable.$inferSelect;
export type NewDog = typeof dogsTable.$inferInsert;

export type SitterListing = typeof sitterListingsTable.$inferSelect;
export type NewSitterListing = typeof sitterListingsTable.$inferInsert;

export type Booking = typeof bookingsTable.$inferSelect;
export type NewBooking = typeof bookingsTable.$inferInsert;

export type Message = typeof messagesTable.$inferSelect;
export type NewMessage = typeof messagesTable.$inferInsert;

export type Review = typeof reviewsTable.$inferSelect;
export type NewReview = typeof reviewsTable.$inferInsert;