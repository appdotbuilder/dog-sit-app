import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, dogsTable, sitterListingsTable, bookingsTable } from '../db/schema';
import { type UpdateBookingStatusInput } from '../schema';
import { updateBookingStatus } from '../handlers/update_booking_status';
import { eq } from 'drizzle-orm';


describe('updateBookingStatus', () => {
  let testUserId1: number;
  let testUserId2: number;
  let testDogId: number;
  let testListingId: number;
  let testBookingId: number;

  beforeEach(async () => {
    await createDB();

    // Create test users
    const hashedPassword = 'hashed_password_123';
    
    const users = await db.insert(usersTable)
      .values([
        {
          email: 'owner@test.com',
          password_hash: hashedPassword,
          first_name: 'John',
          last_name: 'Owner',
          role: 'owner',
          phone: '+1234567890',
          location: 'New York',
          bio: 'Dog owner'
        },
        {
          email: 'sitter@test.com',
          password_hash: hashedPassword,
          first_name: 'Jane',
          last_name: 'Sitter',
          role: 'sitter',
          phone: '+1987654321',
          location: 'New York',
          bio: 'Professional dog sitter'
        }
      ])
      .returning()
      .execute();

    testUserId1 = users[0].id; // owner
    testUserId2 = users[1].id; // sitter

    // Create test dog
    const dogs = await db.insert(dogsTable)
      .values({
        owner_id: testUserId1,
        name: 'Buddy',
        breed: 'Golden Retriever',
        age: 3,
        size: 'medium',
        weight: '25.5',
        temperament: ['friendly', 'playful'],
        medical_notes: 'No known allergies',
        special_instructions: 'Loves belly rubs',
        is_active: true
      })
      .returning()
      .execute();

    testDogId = dogs[0].id;

    // Create test sitter listing
    const listings = await db.insert(sitterListingsTable)
      .values({
        sitter_id: testUserId2,
        title: 'Professional Dog Walker',
        description: 'Experienced dog walker with 5 years of experience',
        services_offered: ['dog_walking', 'pet_sitting'],
        price_per_hour: '20.00',
        price_per_day: '100.00',
        max_dogs: 3,
        accepts_sizes: ['small', 'medium', 'large'],
        location: 'New York',
        radius_km: '10.00',
        experience_years: 5,
        has_yard: true,
        has_insurance: true,
        emergency_contact: '+1555666777',
        is_active: true
      })
      .returning()
      .execute();

    testListingId = listings[0].id;

    // Create test booking
    const bookings = await db.insert(bookingsTable)
      .values({
        owner_id: testUserId1,
        sitter_id: testUserId2,
        dog_id: testDogId,
        listing_id: testListingId,
        service_type: 'dog_walking',
        start_date: new Date('2024-01-01T10:00:00Z'),
        end_date: new Date('2024-01-01T12:00:00Z'),
        total_hours: '2.00',
        total_days: null,
        total_price: '40.00',
        status: 'pending',
        special_requests: 'Please bring water for the dog'
      })
      .returning()
      .execute();

    testBookingId = bookings[0].id;
  });

  afterEach(resetDB);

  it('should update booking status', async () => {
    const input: UpdateBookingStatusInput = {
      id: testBookingId,
      status: 'accepted'
    };

    const result = await updateBookingStatus(input);

    expect(result.id).toBe(testBookingId);
    expect(result.status).toBe('accepted');
    expect(result.owner_id).toBe(testUserId1);
    expect(result.sitter_id).toBe(testUserId2);
    expect(result.dog_id).toBe(testDogId);
    expect(result.listing_id).toBe(testListingId);
    expect(result.service_type).toBe('dog_walking');
    expect(result.total_hours).toBe(2);
    expect(typeof result.total_price).toBe('number');
    expect(result.total_price).toBe(40);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update booking status with notes', async () => {
    const input: UpdateBookingStatusInput = {
      id: testBookingId,
      status: 'rejected',
      notes: 'Schedule conflict - unable to accommodate this booking'
    };

    const result = await updateBookingStatus(input);

    expect(result.id).toBe(testBookingId);
    expect(result.status).toBe('rejected');
    expect(result.notes).toBe('Schedule conflict - unable to accommodate this booking');
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update booking status to completed', async () => {
    const input: UpdateBookingStatusInput = {
      id: testBookingId,
      status: 'completed',
      notes: 'Great walk! Buddy was very well behaved.'
    };

    const result = await updateBookingStatus(input);

    expect(result.status).toBe('completed');
    expect(result.notes).toBe('Great walk! Buddy was very well behaved.');
  });

  it('should update booking status to cancelled', async () => {
    const input: UpdateBookingStatusInput = {
      id: testBookingId,
      status: 'cancelled',
      notes: 'Owner had to cancel due to emergency'
    };

    const result = await updateBookingStatus(input);

    expect(result.status).toBe('cancelled');
    expect(result.notes).toBe('Owner had to cancel due to emergency');
  });

  it('should preserve existing data when updating status', async () => {
    const input: UpdateBookingStatusInput = {
      id: testBookingId,
      status: 'accepted'
    };

    const result = await updateBookingStatus(input);

    // Verify all original data is preserved
    expect(result.service_type).toBe('dog_walking');
    expect(result.start_date).toBeInstanceOf(Date);
    expect(result.end_date).toBeInstanceOf(Date);
    expect(result.total_hours).toBe(2);
    expect(result.total_price).toBe(40);
    expect(result.special_requests).toBe('Please bring water for the dog');
  });

  it('should save status update to database', async () => {
    const input: UpdateBookingStatusInput = {
      id: testBookingId,
      status: 'accepted',
      notes: 'Looking forward to walking Buddy!'
    };

    await updateBookingStatus(input);

    // Verify changes were saved to database
    const savedBooking = await db.select()
      .from(bookingsTable)
      .where(eq(bookingsTable.id, testBookingId))
      .execute();

    expect(savedBooking).toHaveLength(1);
    expect(savedBooking[0].status).toBe('accepted');
    expect(savedBooking[0].notes).toBe('Looking forward to walking Buddy!');
    expect(savedBooking[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle null notes correctly', async () => {
    const input: UpdateBookingStatusInput = {
      id: testBookingId,
      status: 'accepted',
      notes: null
    };

    const result = await updateBookingStatus(input);

    expect(result.status).toBe('accepted');
    expect(result.notes).toBeNull();
  });

  it('should throw error for non-existent booking', async () => {
    const input: UpdateBookingStatusInput = {
      id: 99999,
      status: 'accepted'
    };

    await expect(updateBookingStatus(input)).rejects.toThrow(/Booking with id 99999 not found/i);
  });

  it('should update different status transitions correctly', async () => {
    // Test pending -> accepted
    const acceptInput: UpdateBookingStatusInput = {
      id: testBookingId,
      status: 'accepted'
    };

    let result = await updateBookingStatus(acceptInput);
    expect(result.status).toBe('accepted');

    // Test accepted -> completed
    const completeInput: UpdateBookingStatusInput = {
      id: testBookingId,
      status: 'completed',
      notes: 'Service completed successfully'
    };

    result = await updateBookingStatus(completeInput);
    expect(result.status).toBe('completed');
    expect(result.notes).toBe('Service completed successfully');
  });

  it('should handle numeric conversions correctly', async () => {
    // Create booking with specific numeric values
    const bookings = await db.insert(bookingsTable)
      .values({
        owner_id: testUserId1,
        sitter_id: testUserId2,
        dog_id: testDogId,
        listing_id: testListingId,
        service_type: 'pet_sitting',
        start_date: new Date('2024-01-02T10:00:00Z'),
        end_date: new Date('2024-01-02T18:00:00Z'),
        total_hours: '8.50',
        total_days: 1,
        total_price: '170.00',
        status: 'pending'
      })
      .returning()
      .execute();

    const newBookingId = bookings[0].id;

    const input: UpdateBookingStatusInput = {
      id: newBookingId,
      status: 'accepted'
    };

    const result = await updateBookingStatus(input);

    expect(typeof result.total_hours).toBe('number');
    expect(result.total_hours).toBe(8.5);
    expect(typeof result.total_price).toBe('number');
    expect(result.total_price).toBe(170);
    expect(typeof result.total_days).toBe('number');
    expect(result.total_days).toBe(1);
  });
});