import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, dogsTable, sitterListingsTable, bookingsTable, messagesTable } from '../db/schema';
import { getMessages } from '../handlers/get_messages';
import { eq } from 'drizzle-orm';

describe('getMessages', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create test data
  const createTestData = async () => {
    // Create users
    const [owner, sitter] = await db.insert(usersTable)
      .values([
        {
          email: 'owner@test.com',
          password_hash: 'hash123',
          first_name: 'John',
          last_name: 'Owner',
          role: 'owner',
          phone: '1234567890',
          location: 'Test City',
          bio: 'Dog owner'
        },
        {
          email: 'sitter@test.com',
          password_hash: 'hash456',
          first_name: 'Jane',
          last_name: 'Sitter',
          role: 'sitter',
          phone: '0987654321',
          location: 'Test City',
          bio: 'Professional sitter'
        }
      ])
      .returning()
      .execute();

    // Create dog
    const [dog] = await db.insert(dogsTable)
      .values({
        owner_id: owner.id,
        name: 'Buddy',
        breed: 'Golden Retriever',
        age: 3,
        size: 'large',
        weight: '30.5',
        temperament: ['friendly', 'playful'],
        medical_notes: 'None',
        special_instructions: 'Loves treats'
      })
      .returning()
      .execute();

    // Create sitter listing
    const [listing] = await db.insert(sitterListingsTable)
      .values({
        sitter_id: sitter.id,
        title: 'Experienced Dog Sitter',
        description: 'I love taking care of dogs',
        services_offered: ['pet_sitting', 'dog_walking'],
        price_per_hour: '25.00',
        price_per_day: '100.00',
        max_dogs: 2,
        accepts_sizes: ['small', 'medium', 'large'],
        location: 'Test City',
        radius_km: '10.00',
        experience_years: 5,
        has_yard: true,
        has_insurance: true,
        emergency_contact: '5551234567'
      })
      .returning()
      .execute();

    // Create booking
    const [booking] = await db.insert(bookingsTable)
      .values({
        owner_id: owner.id,
        sitter_id: sitter.id,
        dog_id: dog.id,
        listing_id: listing.id,
        service_type: 'pet_sitting',
        start_date: new Date('2024-01-15T09:00:00Z'),
        end_date: new Date('2024-01-15T17:00:00Z'),
        total_hours: '8.00',
        total_days: 1,
        total_price: '200.00',
        status: 'accepted',
        special_requests: 'Please walk twice'
      })
      .returning()
      .execute();

    return { owner, sitter, dog, listing, booking };
  };

  it('should return messages for a booking in chronological order', async () => {
    const { owner, sitter, booking } = await createTestData();

    // Create messages with different timestamps
    const message1 = await db.insert(messagesTable)
      .values({
        booking_id: booking.id,
        sender_id: owner.id,
        receiver_id: sitter.id,
        content: 'Hi, I have a question about the booking',
        is_read: false
      })
      .returning()
      .execute();

    // Wait a moment to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const message2 = await db.insert(messagesTable)
      .values({
        booking_id: booking.id,
        sender_id: sitter.id,
        receiver_id: owner.id,
        content: 'Sure, what would you like to know?',
        is_read: false
      })
      .returning()
      .execute();

    // Wait again for different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    const message3 = await db.insert(messagesTable)
      .values({
        booking_id: booking.id,
        sender_id: owner.id,
        receiver_id: sitter.id,
        content: 'What time should I drop off my dog?',
        is_read: true
      })
      .returning()
      .execute();

    const result = await getMessages(booking.id);

    expect(result).toHaveLength(3);

    // Verify chronological order
    expect(result[0].content).toEqual('Hi, I have a question about the booking');
    expect(result[1].content).toEqual('Sure, what would you like to know?');
    expect(result[2].content).toEqual('What time should I drop off my dog?');

    // Verify all message properties
    expect(result[0].booking_id).toEqual(booking.id);
    expect(result[0].sender_id).toEqual(owner.id);
    expect(result[0].receiver_id).toEqual(sitter.id);
    expect(result[0].is_read).toEqual(false);
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].id).toBeDefined();

    // Verify timestamps are in ascending order
    expect(result[0].created_at.getTime()).toBeLessThan(result[1].created_at.getTime());
    expect(result[1].created_at.getTime()).toBeLessThan(result[2].created_at.getTime());
  });

  it('should return empty array for booking with no messages', async () => {
    const { booking } = await createTestData();

    const result = await getMessages(booking.id);

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should only return messages for the specified booking', async () => {
    const { owner, sitter, dog, listing, booking: booking1 } = await createTestData();

    // Create a second booking using the same users and resources
    const [booking2] = await db.insert(bookingsTable)
      .values({
        owner_id: owner.id,
        sitter_id: sitter.id,
        dog_id: dog.id,
        listing_id: listing.id,
        service_type: 'dog_walking',
        start_date: new Date('2024-01-16T09:00:00Z'),
        end_date: new Date('2024-01-16T10:00:00Z'),
        total_hours: '1.00',
        total_days: null,
        total_price: '25.00',
        status: 'pending'
      })
      .returning()
      .execute();

    // Create messages for different bookings
    await db.insert(messagesTable)
      .values([
        {
          booking_id: booking1.id,
          sender_id: owner.id,
          receiver_id: sitter.id,
          content: 'Message for booking 1',
          is_read: false
        },
        {
          booking_id: booking2.id,
          sender_id: sitter.id,
          receiver_id: owner.id,
          content: 'Message for booking 2',
          is_read: false
        }
      ])
      .execute();

    const result1 = await getMessages(booking1.id);
    const result2 = await getMessages(booking2.id);

    expect(result1).toHaveLength(1);
    expect(result1[0].content).toEqual('Message for booking 1');
    expect(result1[0].booking_id).toEqual(booking1.id);

    expect(result2).toHaveLength(1);
    expect(result2[0].content).toEqual('Message for booking 2');
    expect(result2[0].booking_id).toEqual(booking2.id);
  });

  it('should handle booking that does not exist', async () => {
    const nonExistentBookingId = 99999;

    const result = await getMessages(nonExistentBookingId);

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should include both read and unread messages', async () => {
    const { owner, sitter, booking } = await createTestData();

    await db.insert(messagesTable)
      .values([
        {
          booking_id: booking.id,
          sender_id: owner.id,
          receiver_id: sitter.id,
          content: 'Unread message',
          is_read: false
        },
        {
          booking_id: booking.id,
          sender_id: sitter.id,
          receiver_id: owner.id,
          content: 'Read message',
          is_read: true
        }
      ])
      .execute();

    const result = await getMessages(booking.id);

    expect(result).toHaveLength(2);
    
    const unreadMessage = result.find(m => m.content === 'Unread message');
    const readMessage = result.find(m => m.content === 'Read message');

    expect(unreadMessage?.is_read).toBe(false);
    expect(readMessage?.is_read).toBe(true);
  });

  it('should verify messages are saved correctly in database', async () => {
    const { owner, sitter, booking } = await createTestData();

    await db.insert(messagesTable)
      .values({
        booking_id: booking.id,
        sender_id: owner.id,
        receiver_id: sitter.id,
        content: 'Test database message',
        is_read: false
      })
      .execute();

    // Verify the message exists in database directly
    const dbMessages = await db.select()
      .from(messagesTable)
      .where(eq(messagesTable.booking_id, booking.id))
      .execute();

    expect(dbMessages).toHaveLength(1);
    expect(dbMessages[0].content).toEqual('Test database message');

    // Verify handler returns the same data
    const handlerResult = await getMessages(booking.id);

    expect(handlerResult).toHaveLength(1);
    expect(handlerResult[0].content).toEqual('Test database message');
    expect(handlerResult[0].id).toEqual(dbMessages[0].id);
  });
});