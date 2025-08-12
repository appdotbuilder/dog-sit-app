import { db } from '../db';
import { messagesTable } from '../db/schema';
import { type MarkMessageReadInput, type Message } from '../schema';
import { eq } from 'drizzle-orm';

export const markMessageRead = async (input: MarkMessageReadInput): Promise<Message> => {
  try {
    // Update the message to mark it as read
    const result = await db.update(messagesTable)
      .set({
        is_read: true
      })
      .where(eq(messagesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Message with id ${input.id} not found`);
    }

    const message = result[0];
    return {
      ...message,
      created_at: message.created_at
    };
  } catch (error) {
    console.error('Mark message read failed:', error);
    throw error;
  }
};