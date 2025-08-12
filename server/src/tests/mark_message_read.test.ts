import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, dogsTable, sitterListingsTable, bookingsTable, messagesTable } from '../db/schema';
import { type MarkMessageReadInput } from '../schema';
import { markMessageRead } from '../handlers/mark_message_read';
import { eq } from 'drizzle-orm';

describe('markMessageRead', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should mark a message as read', async () => {
    // Create prerequisite data
    const [owner] = await db.insert(usersTable).values({
      email: 'owner@test.com',
      password_hash: 'hash',
      first_name: 'Owner',
      last_name: 'User',
      role: 'owner'
    }).returning().execute();

    const [sitter] = await db.insert(usersTable).values({
      email: 'sitter@test.com',
      password_hash: 'hash',
      first_name: 'Sitter',
      last_name: 'User',
      role: 'sitter'
    }).returning().execute();

    const [dog] = await db.insert(dogsTable).values({
      owner_id: owner.id,
      name: 'Test Dog',
      age: 3,
      size: 'medium',
      temperament: ['friendly']
    }).returning().execute();

    const [listing] = await db.insert(sitterListingsTable).values({
      sitter_id: sitter.id,
      title: 'Test Listing',
      description: 'A test listing',
      services_offered: ['dog_walking'],
      price_per_hour: '25.00',
      max_dogs: 2,
      accepts_sizes: ['medium'],
      location: 'Test City',
      radius_km: '10.00',
      experience_years: 3,
      has_yard: true,
      has_insurance: false
    }).returning().execute();

    const [booking] = await db.insert(bookingsTable).values({
      owner_id: owner.id,
      sitter_id: sitter.id,
      dog_id: dog.id,
      listing_id: listing.id,
      service_type: 'dog_walking',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-01'),
      total_price: '25.00'
    }).returning().execute();

    const [message] = await db.insert(messagesTable).values({
      booking_id: booking.id,
      sender_id: owner.id,
      receiver_id: sitter.id,
      content: 'Hello, can you walk my dog tomorrow?',
      is_read: false
    }).returning().execute();

    const input: MarkMessageReadInput = {
      id: message.id
    };

    const result = await markMessageRead(input);

    // Verify the response
    expect(result.id).toEqual(message.id);
    expect(result.booking_id).toEqual(booking.id);
    expect(result.sender_id).toEqual(owner.id);
    expect(result.receiver_id).toEqual(sitter.id);
    expect(result.content).toEqual('Hello, can you walk my dog tomorrow?');
    expect(result.is_read).toBe(true);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update message in database', async () => {
    // Create prerequisite data
    const [owner] = await db.insert(usersTable).values({
      email: 'owner@test.com',
      password_hash: 'hash',
      first_name: 'Owner',
      last_name: 'User',
      role: 'owner'
    }).returning().execute();

    const [sitter] = await db.insert(usersTable).values({
      email: 'sitter@test.com',
      password_hash: 'hash',
      first_name: 'Sitter',
      last_name: 'User',
      role: 'sitter'
    }).returning().execute();

    const [dog] = await db.insert(dogsTable).values({
      owner_id: owner.id,
      name: 'Test Dog',
      age: 3,
      size: 'medium',
      temperament: ['friendly']
    }).returning().execute();

    const [listing] = await db.insert(sitterListingsTable).values({
      sitter_id: sitter.id,
      title: 'Test Listing',
      description: 'A test listing',
      services_offered: ['dog_walking'],
      price_per_hour: '25.00',
      max_dogs: 2,
      accepts_sizes: ['medium'],
      location: 'Test City',
      radius_km: '10.00',
      experience_years: 3,
      has_yard: true,
      has_insurance: false
    }).returning().execute();

    const [booking] = await db.insert(bookingsTable).values({
      owner_id: owner.id,
      sitter_id: sitter.id,
      dog_id: dog.id,
      listing_id: listing.id,
      service_type: 'dog_walking',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-01'),
      total_price: '25.00'
    }).returning().execute();

    const [message] = await db.insert(messagesTable).values({
      booking_id: booking.id,
      sender_id: owner.id,
      receiver_id: sitter.id,
      content: 'Test message content',
      is_read: false
    }).returning().execute();

    const input: MarkMessageReadInput = {
      id: message.id
    };

    await markMessageRead(input);

    // Verify the database was updated
    const messages = await db.select()
      .from(messagesTable)
      .where(eq(messagesTable.id, message.id))
      .execute();

    expect(messages).toHaveLength(1);
    expect(messages[0].is_read).toBe(true);
    expect(messages[0].content).toEqual('Test message content');
    expect(messages[0].booking_id).toEqual(booking.id);
    expect(messages[0].sender_id).toEqual(owner.id);
    expect(messages[0].receiver_id).toEqual(sitter.id);
  });

  it('should throw error for non-existent message', async () => {
    const input: MarkMessageReadInput = {
      id: 999
    };

    expect(markMessageRead(input)).rejects.toThrow(/Message with id 999 not found/);
  });

  it('should handle already read message', async () => {
    // Create prerequisite data
    const [owner] = await db.insert(usersTable).values({
      email: 'owner@test.com',
      password_hash: 'hash',
      first_name: 'Owner',
      last_name: 'User',
      role: 'owner'
    }).returning().execute();

    const [sitter] = await db.insert(usersTable).values({
      email: 'sitter@test.com',
      password_hash: 'hash',
      first_name: 'Sitter',
      last_name: 'User',
      role: 'sitter'
    }).returning().execute();

    const [dog] = await db.insert(dogsTable).values({
      owner_id: owner.id,
      name: 'Test Dog',
      age: 3,
      size: 'medium',
      temperament: ['friendly']
    }).returning().execute();

    const [listing] = await db.insert(sitterListingsTable).values({
      sitter_id: sitter.id,
      title: 'Test Listing',
      description: 'A test listing',
      services_offered: ['dog_walking'],
      price_per_hour: '25.00',
      max_dogs: 2,
      accepts_sizes: ['medium'],
      location: 'Test City',
      radius_km: '10.00',
      experience_years: 3,
      has_yard: true,
      has_insurance: false
    }).returning().execute();

    const [booking] = await db.insert(bookingsTable).values({
      owner_id: owner.id,
      sitter_id: sitter.id,
      dog_id: dog.id,
      listing_id: listing.id,
      service_type: 'dog_walking',
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-01-01'),
      total_price: '25.00'
    }).returning().execute();

    // Create message that is already read
    const [message] = await db.insert(messagesTable).values({
      booking_id: booking.id,
      sender_id: owner.id,
      receiver_id: sitter.id,
      content: 'Already read message',
      is_read: true
    }).returning().execute();

    const input: MarkMessageReadInput = {
      id: message.id
    };

    const result = await markMessageRead(input);

    // Should still return the message successfully
    expect(result.id).toEqual(message.id);
    expect(result.is_read).toBe(true);
    expect(result.content).toEqual('Already read message');

    // Verify database state remains consistent
    const messages = await db.select()
      .from(messagesTable)
      .where(eq(messagesTable.id, message.id))
      .execute();

    expect(messages).toHaveLength(1);
    expect(messages[0].is_read).toBe(true);
  });

  it('should preserve all message data when marking as read', async () => {
    // Create prerequisite data with specific details
    const [owner] = await db.insert(usersTable).values({
      email: 'owner@example.com',
      password_hash: 'secure_hash',
      first_name: 'John',
      last_name: 'Doe',
      role: 'owner'
    }).returning().execute();

    const [sitter] = await db.insert(usersTable).values({
      email: 'sitter@example.com',
      password_hash: 'secure_hash',
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'sitter'
    }).returning().execute();

    const [dog] = await db.insert(dogsTable).values({
      owner_id: owner.id,
      name: 'Buddy',
      breed: 'Golden Retriever',
      age: 5,
      size: 'large',
      temperament: ['friendly', 'playful']
    }).returning().execute();

    const [listing] = await db.insert(sitterListingsTable).values({
      sitter_id: sitter.id,
      title: 'Professional Dog Walking',
      description: 'Experienced dog walker with 5 years experience',
      services_offered: ['dog_walking', 'pet_sitting'],
      price_per_hour: '30.00',
      max_dogs: 3,
      accepts_sizes: ['medium', 'large'],
      location: 'Downtown',
      radius_km: '15.00',
      experience_years: 5,
      has_yard: true,
      has_insurance: true
    }).returning().execute();

    const [booking] = await db.insert(bookingsTable).values({
      owner_id: owner.id,
      sitter_id: sitter.id,
      dog_id: dog.id,
      listing_id: listing.id,
      service_type: 'dog_walking',
      start_date: new Date('2024-02-15'),
      end_date: new Date('2024-02-15'),
      total_price: '30.00'
    }).returning().execute();

    const originalCreatedAt = new Date('2024-01-10T10:30:00Z');
    
    const [message] = await db.insert(messagesTable).values({
      booking_id: booking.id,
      sender_id: owner.id,
      receiver_id: sitter.id,
      content: 'Hi Jane, can you walk Buddy on February 15th at 2 PM? He loves long walks in the park.',
      is_read: false,
      created_at: originalCreatedAt
    }).returning().execute();

    const input: MarkMessageReadInput = {
      id: message.id
    };

    const result = await markMessageRead(input);

    // Verify all original data is preserved
    expect(result.id).toEqual(message.id);
    expect(result.booking_id).toEqual(booking.id);
    expect(result.sender_id).toEqual(owner.id);
    expect(result.receiver_id).toEqual(sitter.id);
    expect(result.content).toEqual('Hi Jane, can you walk Buddy on February 15th at 2 PM? He loves long walks in the park.');
    expect(result.is_read).toBe(true);
    expect(result.created_at).toEqual(originalCreatedAt);
  });
});