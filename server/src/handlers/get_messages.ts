import { db } from '../db';
import { messagesTable } from '../db/schema';
import { type Message } from '../schema';
import { eq, asc } from 'drizzle-orm';

export const getMessages = async (bookingId: number): Promise<Message[]> => {
  try {
    const results = await db.select()
      .from(messagesTable)
      .where(eq(messagesTable.booking_id, bookingId))
      .orderBy(asc(messagesTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    throw error;
  }
};