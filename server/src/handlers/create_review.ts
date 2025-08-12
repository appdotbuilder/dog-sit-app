import { db } from '../db';
import { reviewsTable, bookingsTable, usersTable } from '../db/schema';
import { type CreateReviewInput, type Review } from '../schema';
import { eq, and } from 'drizzle-orm';

export const createReview = async (input: CreateReviewInput): Promise<Review> => {
  try {
    // First, verify that the booking exists and is completed
    const booking = await db.select()
      .from(bookingsTable)
      .where(eq(bookingsTable.id, input.booking_id))
      .execute();

    if (booking.length === 0) {
      throw new Error('Booking not found');
    }

    if (booking[0].status !== 'completed') {
      throw new Error('Can only review completed bookings');
    }

    // First, verify that both reviewer and reviewee exist
    const reviewer = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.reviewer_id))
      .execute();
    
    const reviewee = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.reviewee_id))
      .execute();

    if (reviewer.length === 0) {
      throw new Error('Reviewer not found');
    }
    if (reviewee.length === 0) {
      throw new Error('Reviewee not found');
    }

    // Verify that the reviewer is either the owner or sitter of the booking
    const isOwner = booking[0].owner_id === input.reviewer_id;
    const isSitter = booking[0].sitter_id === input.reviewer_id;
    
    if (!isOwner && !isSitter) {
      throw new Error('Only booking participants can leave reviews');
    }

    // Verify that the reviewee is the other participant
    const expectedRevieweeId = isOwner ? booking[0].sitter_id : booking[0].owner_id;
    if (input.reviewee_id !== expectedRevieweeId) {
      throw new Error('Invalid reviewee for this booking');
    }

    // Check for existing review from the same reviewer for the same booking
    const existingReview = await db.select()
      .from(reviewsTable)
      .where(
        and(
          eq(reviewsTable.booking_id, input.booking_id),
          eq(reviewsTable.reviewer_id, input.reviewer_id)
        )
      )
      .execute();

    if (existingReview.length > 0) {
      throw new Error('Review already exists for this booking');
    }

    // Create the review
    const result = await db.insert(reviewsTable)
      .values({
        booking_id: input.booking_id,
        reviewer_id: input.reviewer_id,
        reviewee_id: input.reviewee_id,
        rating: input.rating,
        comment: input.comment
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Review creation failed:', error);
    throw error;
  }
};