import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, dogsTable, sitterListingsTable, bookingsTable } from '../db/schema';
import { type CreateBookingInput } from '../schema';
import { createBooking } from '../handlers/create_booking';
import { eq } from 'drizzle-orm';

describe('createBooking', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Test data setup
  let ownerId: number;
  let sitterId: number;
  let dogId: number;
  let listingId: number;

  const setupTestData = async () => {
    // Create owner
    const ownerResult = await db.insert(usersTable)
      .values({
        email: 'owner@test.com',
        password_hash: 'hashed_password',
        first_name: 'Dog',
        last_name: 'Owner',
        role: 'owner'
      })
      .returning()
      .execute();
    ownerId = ownerResult[0].id;

    // Create sitter
    const sitterResult = await db.insert(usersTable)
      .values({
        email: 'sitter@test.com',
        password_hash: 'hashed_password',
        first_name: 'Dog',
        last_name: 'Sitter',
        role: 'sitter'
      })
      .returning()
      .execute();
    sitterId = sitterResult[0].id;

    // Create dog
    const dogResult = await db.insert(dogsTable)
      .values({
        owner_id: ownerId,
        name: 'Buddy',
        age: 3,
        size: 'medium',
        temperament: ['friendly', 'playful']
      })
      .returning()
      .execute();
    dogId = dogResult[0].id;

    // Create sitter listing
    const listingResult = await db.insert(sitterListingsTable)
      .values({
        sitter_id: sitterId,
        title: 'Professional Dog Care',
        description: 'Experienced dog sitter with yard',
        services_offered: ['dog_walking', 'pet_sitting', 'daycare', 'overnight_care'],
        price_per_hour: '25.00',
        price_per_day: '150.00',
        price_per_night: '100.00',
        max_dogs: 3,
        accepts_sizes: ['small', 'medium', 'large'],
        location: 'Toronto',
        radius_km: '10.00',
        experience_years: 5,
        has_yard: true,
        has_insurance: true
      })
      .returning()
      .execute();
    listingId = listingResult[0].id;
  };

  it('should create a booking with hourly pricing for dog walking', async () => {
    await setupTestData();

    const startDate = new Date('2024-01-15T09:00:00Z');
    const endDate = new Date('2024-01-15T11:00:00Z'); // 2 hours

    const input: CreateBookingInput = {
      owner_id: ownerId,
      sitter_id: sitterId,
      dog_id: dogId,
      listing_id: listingId,
      service_type: 'dog_walking',
      start_date: startDate,
      end_date: endDate,
      special_requests: 'Please use the blue leash'
    };

    const result = await createBooking(input);

    // Basic field validation
    expect(result.owner_id).toEqual(ownerId);
    expect(result.sitter_id).toEqual(sitterId);
    expect(result.dog_id).toEqual(dogId);
    expect(result.listing_id).toEqual(listingId);
    expect(result.service_type).toEqual('dog_walking');
    expect(result.start_date).toEqual(startDate);
    expect(result.end_date).toEqual(endDate);
    expect(result.special_requests).toEqual('Please use the blue leash');
    expect(result.status).toEqual('pending');
    expect(result.notes).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Pricing calculation validation
    expect(result.total_hours).toEqual(2);
    expect(result.total_days).toBeNull();
    expect(result.total_price).toEqual(50); // 2 hours * $25/hour
    expect(typeof result.total_price).toEqual('number');
  });

  it('should create a booking with daily pricing for daycare', async () => {
    await setupTestData();

    const startDate = new Date('2024-01-15T08:00:00Z');
    const endDate = new Date('2024-01-16T18:00:00Z'); // 34 hours, 2 days

    const input: CreateBookingInput = {
      owner_id: ownerId,
      sitter_id: sitterId,
      dog_id: dogId,
      listing_id: listingId,
      service_type: 'daycare',
      start_date: startDate,
      end_date: endDate,
      special_requests: null
    };

    const result = await createBooking(input);

    expect(result.service_type).toEqual('daycare');
    expect(result.total_hours).toBeNull();
    expect(result.total_days).toEqual(2);
    expect(result.total_price).toEqual(300); // 2 days * $150/day
  });

  it('should create a booking with night pricing for overnight care', async () => {
    await setupTestData();

    const startDate = new Date('2024-01-15T20:00:00Z');
    const endDate = new Date('2024-01-17T08:00:00Z'); // 36 hours, 2 days

    const input: CreateBookingInput = {
      owner_id: ownerId,
      sitter_id: sitterId,
      dog_id: dogId,
      listing_id: listingId,
      service_type: 'overnight_care',
      start_date: startDate,
      end_date: endDate,
      special_requests: 'Dog needs medication at bedtime'
    };

    const result = await createBooking(input);

    expect(result.service_type).toEqual('overnight_care');
    expect(result.total_hours).toBeNull();
    expect(result.total_days).toEqual(2);
    expect(result.total_price).toEqual(200); // 2 nights * $100/night
    expect(result.special_requests).toEqual('Dog needs medication at bedtime');
  });

  it('should use hourly pricing for short pet sitting sessions', async () => {
    await setupTestData();

    const startDate = new Date('2024-01-15T14:00:00Z');
    const endDate = new Date('2024-01-15T18:00:00Z'); // 4 hours (≤ 24 hours)

    const input: CreateBookingInput = {
      owner_id: ownerId,
      sitter_id: sitterId,
      dog_id: dogId,
      listing_id: listingId,
      service_type: 'pet_sitting',
      start_date: startDate,
      end_date: endDate,
      special_requests: null
    };

    const result = await createBooking(input);

    expect(result.service_type).toEqual('pet_sitting');
    expect(result.total_hours).toEqual(4);
    expect(result.total_days).toBeNull();
    expect(result.total_price).toEqual(100); // 4 hours * $25/hour
  });

  it('should use daily pricing for long pet sitting sessions', async () => {
    await setupTestData();

    const startDate = new Date('2024-01-15T08:00:00Z');
    const endDate = new Date('2024-01-17T08:00:00Z'); // 48 hours (> 24 hours)

    const input: CreateBookingInput = {
      owner_id: ownerId,
      sitter_id: sitterId,
      dog_id: dogId,
      listing_id: listingId,
      service_type: 'pet_sitting',
      start_date: startDate,
      end_date: endDate,
      special_requests: null
    };

    const result = await createBooking(input);

    expect(result.service_type).toEqual('pet_sitting');
    expect(result.total_hours).toBeNull();
    expect(result.total_days).toEqual(2);
    expect(result.total_price).toEqual(300); // 2 days * $150/day
  });

  it('should save booking to database', async () => {
    await setupTestData();

    const startDate = new Date('2024-01-15T09:00:00Z');
    const endDate = new Date('2024-01-15T11:00:00Z');

    const input: CreateBookingInput = {
      owner_id: ownerId,
      sitter_id: sitterId,
      dog_id: dogId,
      listing_id: listingId,
      service_type: 'dog_walking',
      start_date: startDate,
      end_date: endDate,
      special_requests: 'Test request'
    };

    const result = await createBooking(input);

    // Query database to verify booking was saved
    const bookings = await db.select()
      .from(bookingsTable)
      .where(eq(bookingsTable.id, result.id))
      .execute();

    expect(bookings).toHaveLength(1);
    const savedBooking = bookings[0];
    expect(savedBooking.owner_id).toEqual(ownerId);
    expect(savedBooking.sitter_id).toEqual(sitterId);
    expect(savedBooking.dog_id).toEqual(dogId);
    expect(savedBooking.listing_id).toEqual(listingId);
    expect(savedBooking.service_type).toEqual('dog_walking');
    expect(savedBooking.status).toEqual('pending');
    expect(savedBooking.special_requests).toEqual('Test request');
    expect(parseFloat(savedBooking.total_price)).toEqual(50);
  });

  it('should throw error when owner does not exist', async () => {
    await setupTestData();

    const input: CreateBookingInput = {
      owner_id: 99999, // Non-existent owner
      sitter_id: sitterId,
      dog_id: dogId,
      listing_id: listingId,
      service_type: 'dog_walking',
      start_date: new Date('2024-01-15T09:00:00Z'),
      end_date: new Date('2024-01-15T11:00:00Z'),
      special_requests: null
    };

    expect(createBooking(input)).rejects.toThrow(/owner not found/i);
  });

  it('should throw error when sitter does not exist', async () => {
    await setupTestData();

    const input: CreateBookingInput = {
      owner_id: ownerId,
      sitter_id: 99999, // Non-existent sitter
      dog_id: dogId,
      listing_id: listingId,
      service_type: 'dog_walking',
      start_date: new Date('2024-01-15T09:00:00Z'),
      end_date: new Date('2024-01-15T11:00:00Z'),
      special_requests: null
    };

    expect(createBooking(input)).rejects.toThrow(/sitter not found/i);
  });

  it('should throw error when dog does not exist', async () => {
    await setupTestData();

    const input: CreateBookingInput = {
      owner_id: ownerId,
      sitter_id: sitterId,
      dog_id: 99999, // Non-existent dog
      listing_id: listingId,
      service_type: 'dog_walking',
      start_date: new Date('2024-01-15T09:00:00Z'),
      end_date: new Date('2024-01-15T11:00:00Z'),
      special_requests: null
    };

    expect(createBooking(input)).rejects.toThrow(/dog not found/i);
  });

  it('should throw error when listing does not exist', async () => {
    await setupTestData();

    const input: CreateBookingInput = {
      owner_id: ownerId,
      sitter_id: sitterId,
      dog_id: dogId,
      listing_id: 99999, // Non-existent listing
      service_type: 'dog_walking',
      start_date: new Date('2024-01-15T09:00:00Z'),
      end_date: new Date('2024-01-15T11:00:00Z'),
      special_requests: null
    };

    expect(createBooking(input)).rejects.toThrow(/listing not found/i);
  });

  it('should throw error when dog does not belong to owner', async () => {
    await setupTestData();

    // Create another owner
    const anotherOwnerResult = await db.insert(usersTable)
      .values({
        email: 'another@owner.com',
        password_hash: 'hashed_password',
        first_name: 'Another',
        last_name: 'Owner',
        role: 'owner'
      })
      .returning()
      .execute();

    const input: CreateBookingInput = {
      owner_id: anotherOwnerResult[0].id, // Different owner
      sitter_id: sitterId,
      dog_id: dogId, // Dog belongs to original owner
      listing_id: listingId,
      service_type: 'dog_walking',
      start_date: new Date('2024-01-15T09:00:00Z'),
      end_date: new Date('2024-01-15T11:00:00Z'),
      special_requests: null
    };

    expect(createBooking(input)).rejects.toThrow(/dog does not belong to the specified owner/i);
  });

  it('should throw error when listing does not belong to sitter', async () => {
    await setupTestData();

    // Create another sitter
    const anotherSitterResult = await db.insert(usersTable)
      .values({
        email: 'another@sitter.com',
        password_hash: 'hashed_password',
        first_name: 'Another',
        last_name: 'Sitter',
        role: 'sitter'
      })
      .returning()
      .execute();

    const input: CreateBookingInput = {
      owner_id: ownerId,
      sitter_id: anotherSitterResult[0].id, // Different sitter
      dog_id: dogId,
      listing_id: listingId, // Listing belongs to original sitter
      service_type: 'dog_walking',
      start_date: new Date('2024-01-15T09:00:00Z'),
      end_date: new Date('2024-01-15T11:00:00Z'),
      special_requests: null
    };

    expect(createBooking(input)).rejects.toThrow(/listing does not belong to the specified sitter/i);
  });

  it('should fallback to hourly pricing when daily rate not available for daycare', async () => {
    await setupTestData();

    // Create listing without daily pricing
    const noDailyPriceListingResult = await db.insert(sitterListingsTable)
      .values({
        sitter_id: sitterId,
        title: 'Hourly Only Care',
        description: 'Only hourly rates available',
        services_offered: ['daycare'],
        price_per_hour: '20.00',
        price_per_day: null, // No daily rate
        price_per_night: null,
        max_dogs: 2,
        accepts_sizes: ['small', 'medium'],
        location: 'Toronto',
        radius_km: '5.00',
        experience_years: 2,
        has_yard: false,
        has_insurance: true
      })
      .returning()
      .execute();

    const startDate = new Date('2024-01-15T08:00:00Z');
    const endDate = new Date('2024-01-16T18:00:00Z'); // 34 hours

    const input: CreateBookingInput = {
      owner_id: ownerId,
      sitter_id: sitterId,
      dog_id: dogId,
      listing_id: noDailyPriceListingResult[0].id,
      service_type: 'daycare',
      start_date: startDate,
      end_date: endDate,
      special_requests: null
    };

    const result = await createBooking(input);

    // Should fallback to hourly pricing
    expect(result.total_hours).toEqual(34);
    expect(result.total_days).toBeNull();
    expect(result.total_price).toEqual(680); // 34 hours * $20/hour
  });
});