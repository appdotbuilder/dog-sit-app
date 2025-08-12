import { type CreateMessageInput, type Message } from '../schema';

export const createMessage = async (input: CreateMessageInput): Promise<Message> => {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is creating a new message in the booking conversation and persisting it in the database.
    // Should validate that the sender has permission to send messages in this booking conversation.
    return Promise.resolve({
        id: 0, // Placeholder ID
        booking_id: input.booking_id,
        sender_id: input.sender_id,
        receiver_id: input.receiver_id,
        content: input.content,
        is_read: false,
        created_at: new Date()
    } as Message);
};