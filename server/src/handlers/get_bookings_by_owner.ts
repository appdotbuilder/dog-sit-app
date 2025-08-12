import { db } from '../db';
import { bookingsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type Booking } from '../schema';

export const getBookingsByOwner = async (ownerId: number): Promise<Booking[]> => {
  try {
    const results = await db.select()
      .from(bookingsTable)
      .where(eq(bookingsTable.owner_id, ownerId))
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(booking => ({
      ...booking,
      total_hours: booking.total_hours ? parseFloat(booking.total_hours) : null,
      total_price: parseFloat(booking.total_price)
    }));
  } catch (error) {
    console.error('Failed to fetch bookings by owner:', error);
    throw error;
  }
};