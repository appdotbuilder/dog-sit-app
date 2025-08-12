import { db } from '../db';
import { messagesTable, bookingsTable } from '../db/schema';
import { type CreateMessageInput, type Message } from '../schema';
import { eq, or, and } from 'drizzle-orm';

export const createMessage = async (input: CreateMessageInput): Promise<Message> => {
  try {
    // First, validate that the booking exists and the sender is authorized to message in this booking
    const booking = await db.select()
      .from(bookingsTable)
      .where(eq(bookingsTable.id, input.booking_id))
      .execute();

    if (booking.length === 0) {
      throw new Error('Booking not found');
    }

    const bookingRecord = booking[0];

    // Validate that the sender is either the owner or the sitter of the booking
    if (input.sender_id !== bookingRecord.owner_id && input.sender_id !== bookingRecord.sitter_id) {
      throw new Error('Sender is not authorized to send messages in this booking conversation');
    }

    // Validate that the receiver is the other party in the booking
    const validReceiverId = input.sender_id === bookingRecord.owner_id 
      ? bookingRecord.sitter_id 
      : bookingRecord.owner_id;
    
    if (input.receiver_id !== validReceiverId) {
      throw new Error('Invalid receiver for this booking conversation');
    }

    // Insert the message
    const result = await db.insert(messagesTable)
      .values({
        booking_id: input.booking_id,
        sender_id: input.sender_id,
        receiver_id: input.receiver_id,
        content: input.content,
        is_read: false
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Message creation failed:', error);
    throw error;
  }
};