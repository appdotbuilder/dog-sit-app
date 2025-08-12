import { db } from '../db';
import { bookingsTable, usersTable, dogsTable, sitterListingsTable } from '../db/schema';
import { type Booking } from '../schema';
import { eq } from 'drizzle-orm';

export const getBookingsBySitter = async (sitterId: number): Promise<Booking[]> => {
  try {
    const results = await db.select()
      .from(bookingsTable)
      .innerJoin(usersTable, eq(bookingsTable.owner_id, usersTable.id))
      .innerJoin(dogsTable, eq(bookingsTable.dog_id, dogsTable.id))
      .innerJoin(sitterListingsTable, eq(bookingsTable.listing_id, sitterListingsTable.id))
      .where(eq(bookingsTable.sitter_id, sitterId))
      .execute();

    // Convert joined results back to Booking format with numeric conversions
    return results.map(result => {
      const booking = result.bookings;
      return {
        ...booking,
        total_hours: booking.total_hours ? parseFloat(booking.total_hours) : null,
        total_price: parseFloat(booking.total_price)
      };
    });
  } catch (error) {
    console.error('Failed to fetch bookings by sitter:', error);
    throw error;
  }
};