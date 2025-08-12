import { type MarkMessageReadInput, type Message } from '../schema';

export const markMessageRead = async (input: MarkMessageReadInput): Promise<Message> => {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is marking a message as read in the database.
    // Should validate that the user has permission to mark this message as read (is the receiver).
    return Promise.resolve({
        id: input.id,
        booking_id: 1, // Placeholder
        sender_id: 1, // Placeholder
        receiver_id: 2, // Placeholder
        content: 'Message content',
        is_read: true,
        created_at: new Date()
    } as Message);
};