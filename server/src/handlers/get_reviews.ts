import { db } from '../db';
import { reviewsTable, usersTable } from '../db/schema';
import { type Review } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getReviews = async (userId: number): Promise<Review[]> => {
  try {
    // Join reviews with reviewer information and filter by reviewee_id
    const results = await db.select({
      reviews: reviewsTable,
      reviewer: {
        id: usersTable.id,
        first_name: usersTable.first_name,
        last_name: usersTable.last_name,
        profile_image_url: usersTable.profile_image_url
      }
    })
    .from(reviewsTable)
    .innerJoin(usersTable, eq(reviewsTable.reviewer_id, usersTable.id))
    .where(eq(reviewsTable.reviewee_id, userId))
    .orderBy(desc(reviewsTable.created_at))
    .execute();

    // Transform results to match Review type
    return results.map(result => ({
      ...result.reviews,
      // Add reviewer information for display purposes (not part of base Review type)
      reviewer: result.reviewer
    })) as Review[];
  } catch (error) {
    console.error('Failed to get reviews:', error);
    throw error;
  }
};