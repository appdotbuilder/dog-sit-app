import { db } from '../db';
import { bookingsTable } from '../db/schema';
import { type UpdateBookingStatusInput, type Booking } from '../schema';
import { eq } from 'drizzle-orm';

export const updateBookingStatus = async (input: UpdateBookingStatusInput): Promise<Booking> => {
  try {
    // Check if booking exists first
    const existingBooking = await db.select()
      .from(bookingsTable)
      .where(eq(bookingsTable.id, input.id))
      .execute();

    if (existingBooking.length === 0) {
      throw new Error(`Booking with id ${input.id} not found`);
    }

    // Update booking status and notes
    const updateData: any = {
      status: input.status,
      updated_at: new Date()
    };

    // Add notes if provided
    if (input.notes !== undefined) {
      updateData.notes = input.notes;
    }

    // Update the booking record
    const result = await db.update(bookingsTable)
      .set(updateData)
      .where(eq(bookingsTable.id, input.id))
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const booking = result[0];
    return {
      ...booking,
      total_hours: booking.total_hours ? parseFloat(booking.total_hours) : null,
      total_price: parseFloat(booking.total_price)
    };
  } catch (error) {
    console.error('Booking status update failed:', error);
    throw error;
  }
};