import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, dogsTable, sitterListingsTable, bookingsTable, messagesTable } from '../db/schema';
import { type CreateMessageInput } from '../schema';
import { createMessage } from '../handlers/create_message';
import { eq } from 'drizzle-orm';

describe('createMessage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let ownerId: number;
  let sitterId: number;
  let dogId: number;
  let listingId: number;
  let bookingId: number;

  beforeEach(async () => {
    // Create test owner
    const ownerResult = await db.insert(usersTable)
      .values({
        email: 'owner@test.com',
        password_hash: 'hashed_password',
        first_name: 'John',
        last_name: 'Doe',
        phone: '123-456-7890',
        role: 'owner',
        location: 'New York, NY',
        bio: 'Dog lover'
      })
      .returning()
      .execute();
    ownerId = ownerResult[0].id;

    // Create test sitter
    const sitterResult = await db.insert(usersTable)
      .values({
        email: 'sitter@test.com',
        password_hash: 'hashed_password',
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '098-765-4321',
        role: 'sitter',
        location: 'Brooklyn, NY',
        bio: 'Professional dog sitter'
      })
      .returning()
      .execute();
    sitterId = sitterResult[0].id;

    // Create test dog
    const dogResult = await db.insert(dogsTable)
      .values({
        owner_id: ownerId,
        name: 'Buddy',
        breed: 'Golden Retriever',
        age: 3,
        size: 'large',
        weight: '30.5',
        temperament: ['friendly', 'playful'],
        medical_notes: null,
        special_instructions: null
      })
      .returning()
      .execute();
    dogId = dogResult[0].id;

    // Create test sitter listing
    const listingResult = await db.insert(sitterListingsTable)
      .values({
        sitter_id: sitterId,
        title: 'Professional Dog Care',
        description: 'Experienced dog sitter',
        services_offered: ['pet_sitting', 'dog_walking'],
        price_per_hour: '25.00',
        price_per_day: '150.00',
        price_per_night: null,
        max_dogs: 3,
        accepts_sizes: ['small', 'medium', 'large'],
        location: 'Brooklyn, NY',
        radius_km: '10.00',
        experience_years: 5,
        has_yard: true,
        has_insurance: true,
        emergency_contact: '555-0123'
      })
      .returning()
      .execute();
    listingId = listingResult[0].id;

    // Create test booking
    const bookingResult = await db.insert(bookingsTable)
      .values({
        owner_id: ownerId,
        sitter_id: sitterId,
        dog_id: dogId,
        listing_id: listingId,
        service_type: 'pet_sitting',
        start_date: new Date('2024-03-01T10:00:00Z'),
        end_date: new Date('2024-03-01T16:00:00Z'),
        total_hours: '6.00',
        total_days: null,
        total_price: '150.00',
        status: 'accepted',
        special_requests: null
      })
      .returning()
      .execute();
    bookingId = bookingResult[0].id;
  });

  it('should create a message from owner to sitter', async () => {
    const testInput: CreateMessageInput = {
      booking_id: bookingId,
      sender_id: ownerId,
      receiver_id: sitterId,
      content: 'Hi, just wanted to confirm the time for tomorrow'
    };

    const result = await createMessage(testInput);

    expect(result.booking_id).toEqual(bookingId);
    expect(result.sender_id).toEqual(ownerId);
    expect(result.receiver_id).toEqual(sitterId);
    expect(result.content).toEqual('Hi, just wanted to confirm the time for tomorrow');
    expect(result.is_read).toBe(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a message from sitter to owner', async () => {
    const testInput: CreateMessageInput = {
      booking_id: bookingId,
      sender_id: sitterId,
      receiver_id: ownerId,
      content: 'Yes, I will be there at 10 AM as scheduled'
    };

    const result = await createMessage(testInput);

    expect(result.booking_id).toEqual(bookingId);
    expect(result.sender_id).toEqual(sitterId);
    expect(result.receiver_id).toEqual(ownerId);
    expect(result.content).toEqual('Yes, I will be there at 10 AM as scheduled');
    expect(result.is_read).toBe(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save message to database', async () => {
    const testInput: CreateMessageInput = {
      booking_id: bookingId,
      sender_id: ownerId,
      receiver_id: sitterId,
      content: 'Database persistence test message'
    };

    const result = await createMessage(testInput);

    // Query the database to verify the message was saved
    const messages = await db.select()
      .from(messagesTable)
      .where(eq(messagesTable.id, result.id))
      .execute();

    expect(messages).toHaveLength(1);
    expect(messages[0].booking_id).toEqual(bookingId);
    expect(messages[0].sender_id).toEqual(ownerId);
    expect(messages[0].receiver_id).toEqual(sitterId);
    expect(messages[0].content).toEqual('Database persistence test message');
    expect(messages[0].is_read).toBe(false);
    expect(messages[0].created_at).toBeInstanceOf(Date);
  });

  it('should reject message when booking does not exist', async () => {
    const testInput: CreateMessageInput = {
      booking_id: 99999, // Non-existent booking ID
      sender_id: ownerId,
      receiver_id: sitterId,
      content: 'This should fail'
    };

    await expect(createMessage(testInput)).rejects.toThrow(/booking not found/i);
  });

  it('should reject message when sender is not part of booking', async () => {
    // Create an unauthorized user
    const unauthorizedUserResult = await db.insert(usersTable)
      .values({
        email: 'unauthorized@test.com',
        password_hash: 'hashed_password',
        first_name: 'Unauthorized',
        last_name: 'User',
        role: 'owner'
      })
      .returning()
      .execute();

    const testInput: CreateMessageInput = {
      booking_id: bookingId,
      sender_id: unauthorizedUserResult[0].id,
      receiver_id: sitterId,
      content: 'This should be rejected'
    };

    await expect(createMessage(testInput)).rejects.toThrow(/not authorized to send messages/i);
  });

  it('should reject message when receiver is not the other party in booking', async () => {
    // Create another user who is not part of the booking
    const otherUserResult = await db.insert(usersTable)
      .values({
        email: 'other@test.com',
        password_hash: 'hashed_password',
        first_name: 'Other',
        last_name: 'User',
        role: 'sitter'
      })
      .returning()
      .execute();

    const testInput: CreateMessageInput = {
      booking_id: bookingId,
      sender_id: ownerId,
      receiver_id: otherUserResult[0].id, // Wrong receiver
      content: 'This should be rejected'
    };

    await expect(createMessage(testInput)).rejects.toThrow(/invalid receiver/i);
  });

  it('should allow multiple messages in same conversation', async () => {
    const message1: CreateMessageInput = {
      booking_id: bookingId,
      sender_id: ownerId,
      receiver_id: sitterId,
      content: 'First message'
    };

    const message2: CreateMessageInput = {
      booking_id: bookingId,
      sender_id: sitterId,
      receiver_id: ownerId,
      content: 'Reply message'
    };

    const result1 = await createMessage(message1);
    const result2 = await createMessage(message2);

    expect(result1.id).toBeDefined();
    expect(result2.id).toBeDefined();
    expect(result1.id).not.toEqual(result2.id);

    // Verify both messages exist in database
    const messages = await db.select()
      .from(messagesTable)
      .where(eq(messagesTable.booking_id, bookingId))
      .execute();

    expect(messages).toHaveLength(2);
    expect(messages.map(m => m.content)).toContain('First message');
    expect(messages.map(m => m.content)).toContain('Reply message');
  });
});