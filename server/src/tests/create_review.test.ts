import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, dogsTable, sitterListingsTable, bookingsTable, reviewsTable } from '../db/schema';
import { type CreateReviewInput } from '../schema';
import { createReview } from '../handlers/create_review';
import { eq, and } from 'drizzle-orm';

// Test data setup helpers
const createTestUser = async (email: string, role: 'owner' | 'sitter' | 'both' = 'both') => {
  const result = await db.insert(usersTable)
    .values({
      email,
      password_hash: 'hashed_password',
      first_name: 'Test',
      last_name: 'User',
      role,
      phone: null,
      location: null,
      bio: null,
      profile_image_url: null
    })
    .returning()
    .execute();
  return result[0];
};

const createTestDog = async (ownerId: number) => {
  const result = await db.insert(dogsTable)
    .values({
      owner_id: ownerId,
      name: 'Test Dog',
      breed: 'Golden Retriever',
      age: 3,
      size: 'medium',
      weight: '25.5',
      temperament: ['friendly', 'playful'],
      medical_notes: null,
      special_instructions: null,
      profile_image_url: null
    })
    .returning()
    .execute();
  return result[0];
};

const createTestSitterListing = async (sitterId: number) => {
  const result = await db.insert(sitterListingsTable)
    .values({
      sitter_id: sitterId,
      title: 'Professional Dog Care',
      description: 'Experienced dog sitter with years of experience',
      services_offered: ['pet_sitting', 'dog_walking'],
      price_per_hour: '25.00',
      price_per_day: '150.00',
      price_per_night: null,
      max_dogs: 3,
      accepts_sizes: ['small', 'medium', 'large'],
      location: 'Downtown',
      radius_km: '10.0',
      experience_years: 5,
      has_yard: true,
      has_insurance: true,
      emergency_contact: null
    })
    .returning()
    .execute();
  return result[0];
};

const createTestBooking = async (
  ownerId: number, 
  sitterId: number, 
  dogId: number, 
  listingId: number,
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled' = 'completed'
) => {
  const startDate = new Date('2024-01-15');
  const endDate = new Date('2024-01-16');
  
  const result = await db.insert(bookingsTable)
    .values({
      owner_id: ownerId,
      sitter_id: sitterId,
      dog_id: dogId,
      listing_id: listingId,
      service_type: 'pet_sitting',
      start_date: startDate,
      end_date: endDate,
      total_hours: null,
      total_days: 1,
      total_price: '150.00',
      status,
      special_requests: null,
      notes: null
    })
    .returning()
    .execute();
  return result[0];
};

// Test input template
const baseTestInput: CreateReviewInput = {
  booking_id: 0, // Will be set in tests
  reviewer_id: 0, // Will be set in tests
  reviewee_id: 0, // Will be set in tests
  rating: 5,
  comment: 'Excellent service, very reliable!'
};

describe('createReview', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a review when owner reviews sitter', async () => {
    // Setup test data
    const owner = await createTestUser('owner@test.com', 'owner');
    const sitter = await createTestUser('sitter@test.com', 'sitter');
    const dog = await createTestDog(owner.id);
    const listing = await createTestSitterListing(sitter.id);
    const booking = await createTestBooking(owner.id, sitter.id, dog.id, listing.id);

    const testInput: CreateReviewInput = {
      ...baseTestInput,
      booking_id: booking.id,
      reviewer_id: owner.id,
      reviewee_id: sitter.id
    };

    const result = await createReview(testInput);

    // Verify the review was created correctly
    expect(result.id).toBeDefined();
    expect(result.booking_id).toEqual(booking.id);
    expect(result.reviewer_id).toEqual(owner.id);
    expect(result.reviewee_id).toEqual(sitter.id);
    expect(result.rating).toEqual(5);
    expect(result.comment).toEqual('Excellent service, very reliable!');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a review when sitter reviews owner', async () => {
    // Setup test data
    const owner = await createTestUser('owner@test.com', 'owner');
    const sitter = await createTestUser('sitter@test.com', 'sitter');
    const dog = await createTestDog(owner.id);
    const listing = await createTestSitterListing(sitter.id);
    const booking = await createTestBooking(owner.id, sitter.id, dog.id, listing.id);

    const testInput: CreateReviewInput = {
      ...baseTestInput,
      booking_id: booking.id,
      reviewer_id: sitter.id,
      reviewee_id: owner.id,
      rating: 4,
      comment: 'Great dog owner, clear instructions!'
    };

    const result = await createReview(testInput);

    expect(result.reviewer_id).toEqual(sitter.id);
    expect(result.reviewee_id).toEqual(owner.id);
    expect(result.rating).toEqual(4);
    expect(result.comment).toEqual('Great dog owner, clear instructions!');
  });

  it('should save review to database', async () => {
    // Setup test data
    const owner = await createTestUser('owner@test.com', 'owner');
    const sitter = await createTestUser('sitter@test.com', 'sitter');
    const dog = await createTestDog(owner.id);
    const listing = await createTestSitterListing(sitter.id);
    const booking = await createTestBooking(owner.id, sitter.id, dog.id, listing.id);

    const testInput: CreateReviewInput = {
      ...baseTestInput,
      booking_id: booking.id,
      reviewer_id: owner.id,
      reviewee_id: sitter.id
    };

    const result = await createReview(testInput);

    // Verify review exists in database
    const reviews = await db.select()
      .from(reviewsTable)
      .where(eq(reviewsTable.id, result.id))
      .execute();

    expect(reviews).toHaveLength(1);
    expect(reviews[0].booking_id).toEqual(booking.id);
    expect(reviews[0].reviewer_id).toEqual(owner.id);
    expect(reviews[0].reviewee_id).toEqual(sitter.id);
    expect(reviews[0].rating).toEqual(5);
    expect(reviews[0].comment).toEqual('Excellent service, very reliable!');
    expect(reviews[0].created_at).toBeInstanceOf(Date);
  });

  it('should create review with null comment', async () => {
    // Setup test data
    const owner = await createTestUser('owner@test.com', 'owner');
    const sitter = await createTestUser('sitter@test.com', 'sitter');
    const dog = await createTestDog(owner.id);
    const listing = await createTestSitterListing(sitter.id);
    const booking = await createTestBooking(owner.id, sitter.id, dog.id, listing.id);

    const testInput: CreateReviewInput = {
      booking_id: booking.id,
      reviewer_id: owner.id,
      reviewee_id: sitter.id,
      rating: 3,
      comment: null
    };

    const result = await createReview(testInput);

    expect(result.rating).toEqual(3);
    expect(result.comment).toBeNull();
  });

  it('should throw error for non-existent booking', async () => {
    // Setup minimal data
    const owner = await createTestUser('owner@test.com', 'owner');
    const sitter = await createTestUser('sitter@test.com', 'sitter');

    const testInput: CreateReviewInput = {
      ...baseTestInput,
      booking_id: 99999, // Non-existent booking
      reviewer_id: owner.id,
      reviewee_id: sitter.id
    };

    await expect(createReview(testInput)).rejects.toThrow(/booking not found/i);
  });

  it('should throw error for non-completed booking', async () => {
    // Setup test data with pending booking
    const owner = await createTestUser('owner@test.com', 'owner');
    const sitter = await createTestUser('sitter@test.com', 'sitter');
    const dog = await createTestDog(owner.id);
    const listing = await createTestSitterListing(sitter.id);
    const booking = await createTestBooking(owner.id, sitter.id, dog.id, listing.id, 'pending');

    const testInput: CreateReviewInput = {
      ...baseTestInput,
      booking_id: booking.id,
      reviewer_id: owner.id,
      reviewee_id: sitter.id
    };

    await expect(createReview(testInput)).rejects.toThrow(/only review completed bookings/i);
  });

  it('should throw error when reviewer is not booking participant', async () => {
    // Setup test data
    const owner = await createTestUser('owner@test.com', 'owner');
    const sitter = await createTestUser('sitter@test.com', 'sitter');
    const outsider = await createTestUser('outsider@test.com', 'both');
    const dog = await createTestDog(owner.id);
    const listing = await createTestSitterListing(sitter.id);
    const booking = await createTestBooking(owner.id, sitter.id, dog.id, listing.id);

    const testInput: CreateReviewInput = {
      ...baseTestInput,
      booking_id: booking.id,
      reviewer_id: outsider.id, // Not a participant
      reviewee_id: sitter.id
    };

    await expect(createReview(testInput)).rejects.toThrow(/only booking participants can leave reviews/i);
  });

  it('should throw error for invalid reviewee', async () => {
    // Setup test data
    const owner = await createTestUser('owner@test.com', 'owner');
    const sitter = await createTestUser('sitter@test.com', 'sitter');
    const outsider = await createTestUser('outsider@test.com', 'both');
    const dog = await createTestDog(owner.id);
    const listing = await createTestSitterListing(sitter.id);
    const booking = await createTestBooking(owner.id, sitter.id, dog.id, listing.id);

    const testInput: CreateReviewInput = {
      ...baseTestInput,
      booking_id: booking.id,
      reviewer_id: owner.id,
      reviewee_id: outsider.id // Should be sitter.id
    };

    await expect(createReview(testInput)).rejects.toThrow(/invalid reviewee for this booking/i);
  });

  it('should throw error for non-existent reviewer', async () => {
    // Setup test data
    const owner = await createTestUser('owner@test.com', 'owner');
    const sitter = await createTestUser('sitter@test.com', 'sitter');
    const dog = await createTestDog(owner.id);
    const listing = await createTestSitterListing(sitter.id);
    const booking = await createTestBooking(owner.id, sitter.id, dog.id, listing.id);

    const testInput: CreateReviewInput = {
      ...baseTestInput,
      booking_id: booking.id,
      reviewer_id: 99999, // Non-existent user
      reviewee_id: sitter.id
    };

    await expect(createReview(testInput)).rejects.toThrow(/reviewer not found/i);
  });

  it('should throw error for non-existent reviewee', async () => {
    // Setup test data
    const owner = await createTestUser('owner@test.com', 'owner');
    const sitter = await createTestUser('sitter@test.com', 'sitter');
    const dog = await createTestDog(owner.id);
    const listing = await createTestSitterListing(sitter.id);
    const booking = await createTestBooking(owner.id, sitter.id, dog.id, listing.id);

    const testInput: CreateReviewInput = {
      ...baseTestInput,
      booking_id: booking.id,
      reviewer_id: owner.id,
      reviewee_id: 99999 // Non-existent user
    };

    await expect(createReview(testInput)).rejects.toThrow(/reviewee not found/i);
  });

  it('should throw error for duplicate review', async () => {
    // Setup test data
    const owner = await createTestUser('owner@test.com', 'owner');
    const sitter = await createTestUser('sitter@test.com', 'sitter');
    const dog = await createTestDog(owner.id);
    const listing = await createTestSitterListing(sitter.id);
    const booking = await createTestBooking(owner.id, sitter.id, dog.id, listing.id);

    const testInput: CreateReviewInput = {
      ...baseTestInput,
      booking_id: booking.id,
      reviewer_id: owner.id,
      reviewee_id: sitter.id
    };

    // Create first review
    await createReview(testInput);

    // Attempt to create duplicate review
    await expect(createReview(testInput)).rejects.toThrow(/review already exists for this booking/i);
  });

  it('should allow both participants to review each other for the same booking', async () => {
    // Setup test data
    const owner = await createTestUser('owner@test.com', 'owner');
    const sitter = await createTestUser('sitter@test.com', 'sitter');
    const dog = await createTestDog(owner.id);
    const listing = await createTestSitterListing(sitter.id);
    const booking = await createTestBooking(owner.id, sitter.id, dog.id, listing.id);

    // Owner reviews sitter
    const ownerReviewInput: CreateReviewInput = {
      booking_id: booking.id,
      reviewer_id: owner.id,
      reviewee_id: sitter.id,
      rating: 5,
      comment: 'Great sitter!'
    };

    // Sitter reviews owner
    const sitterReviewInput: CreateReviewInput = {
      booking_id: booking.id,
      reviewer_id: sitter.id,
      reviewee_id: owner.id,
      rating: 4,
      comment: 'Responsible owner!'
    };

    const ownerReview = await createReview(ownerReviewInput);
    const sitterReview = await createReview(sitterReviewInput);

    expect(ownerReview.reviewer_id).toEqual(owner.id);
    expect(ownerReview.reviewee_id).toEqual(sitter.id);
    expect(sitterReview.reviewer_id).toEqual(sitter.id);
    expect(sitterReview.reviewee_id).toEqual(owner.id);

    // Verify both reviews exist in database
    const reviews = await db.select()
      .from(reviewsTable)
      .where(eq(reviewsTable.booking_id, booking.id))
      .execute();

    expect(reviews).toHaveLength(2);
  });

  it('should handle different booking statuses correctly', async () => {
    // Setup test data
    const owner = await createTestUser('owner@test.com', 'owner');
    const sitter = await createTestUser('sitter@test.com', 'sitter');
    const dog = await createTestDog(owner.id);
    const listing = await createTestSitterListing(sitter.id);

    // Test each non-completed status
    const statuses: Array<'pending' | 'accepted' | 'rejected' | 'cancelled'> = [
      'pending', 'accepted', 'rejected', 'cancelled'
    ];

    for (const status of statuses) {
      const booking = await createTestBooking(owner.id, sitter.id, dog.id, listing.id, status);

      const testInput: CreateReviewInput = {
        ...baseTestInput,
        booking_id: booking.id,
        reviewer_id: owner.id,
        reviewee_id: sitter.id
      };

      await expect(createReview(testInput)).rejects.toThrow(/only review completed bookings/i);
    }
  });
});