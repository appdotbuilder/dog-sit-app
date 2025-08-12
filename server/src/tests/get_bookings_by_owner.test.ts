import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, dogsTable, sitterListingsTable, bookingsTable } from '../db/schema';
import { getBookingsByOwner } from '../handlers/get_bookings_by_owner';

// Test data setup
const createTestUser = async (role: 'owner' | 'sitter' | 'both' = 'owner') => {
  const result = await db.insert(usersTable)
    .values({
      email: `test-${role}-${Date.now()}@example.com`,
      password_hash: 'hashed_password',
      first_name: 'Test',
      last_name: 'User',
      role: role,
      phone: null,
      profile_image_url: null,
      location: null,
      bio: null
    })
    .returning()
    .execute();
  
  return result[0];
};

const createTestDog = async (ownerId: number) => {
  const result = await db.insert(dogsTable)
    .values({
      owner_id: ownerId,
      name: 'Test Dog',
      breed: 'Golden Retriever',
      age: 3,
      size: 'medium',
      weight: '25.5',
      temperament: ['friendly', 'playful'],
      medical_notes: null,
      special_instructions: null,
      profile_image_url: null,
      is_active: true
    })
    .returning()
    .execute();
  
  return result[0];
};

const createTestSitterListing = async (sitterId: number) => {
  const result = await db.insert(sitterListingsTable)
    .values({
      sitter_id: sitterId,
      title: 'Professional Dog Sitter',
      description: 'Experienced and reliable dog sitter.',
      services_offered: ['dog_walking', 'pet_sitting'],
      price_per_hour: '25.00',
      price_per_day: '150.00',
      price_per_night: '75.00',
      max_dogs: 3,
      accepts_sizes: ['small', 'medium', 'large'],
      location: 'Test City',
      radius_km: '10.0',
      experience_years: 5,
      has_yard: true,
      has_insurance: true,
      emergency_contact: '555-0123',
      is_active: true
    })
    .returning()
    .execute();
  
  return result[0];
};

const createTestBooking = async (ownerId: number, sitterId: number, dogId: number, listingId: number) => {
  const result = await db.insert(bookingsTable)
    .values({
      owner_id: ownerId,
      sitter_id: sitterId,
      dog_id: dogId,
      listing_id: listingId,
      service_type: 'dog_walking',
      start_date: new Date('2024-01-15T09:00:00Z'),
      end_date: new Date('2024-01-15T10:00:00Z'),
      total_hours: '1.0',
      total_days: null,
      total_price: '25.00',
      status: 'pending',
      special_requests: 'Please be gentle with my dog',
      notes: null
    })
    .returning()
    .execute();
  
  return result[0];
};

describe('getBookingsByOwner', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return bookings for a specific owner', async () => {
    // Create test data
    const owner = await createTestUser('owner');
    const sitter = await createTestUser('sitter');
    const dog = await createTestDog(owner.id);
    const listing = await createTestSitterListing(sitter.id);
    const booking = await createTestBooking(owner.id, sitter.id, dog.id, listing.id);

    const results = await getBookingsByOwner(owner.id);

    expect(results).toHaveLength(1);
    expect(results[0].id).toEqual(booking.id);
    expect(results[0].owner_id).toEqual(owner.id);
    expect(results[0].sitter_id).toEqual(sitter.id);
    expect(results[0].dog_id).toEqual(dog.id);
    expect(results[0].listing_id).toEqual(listing.id);
    expect(results[0].service_type).toEqual('dog_walking');
    expect(results[0].start_date).toBeInstanceOf(Date);
    expect(results[0].end_date).toBeInstanceOf(Date);
    expect(results[0].total_hours).toEqual(1.0);
    expect(typeof results[0].total_hours).toBe('number');
    expect(results[0].total_days).toBeNull();
    expect(results[0].total_price).toEqual(25.0);
    expect(typeof results[0].total_price).toBe('number');
    expect(results[0].status).toEqual('pending');
    expect(results[0].special_requests).toEqual('Please be gentle with my dog');
    expect(results[0].notes).toBeNull();
    expect(results[0].created_at).toBeInstanceOf(Date);
    expect(results[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return multiple bookings for the same owner', async () => {
    // Create test data
    const owner = await createTestUser('owner');
    const sitter1 = await createTestUser('sitter');
    const sitter2 = await createTestUser('sitter');
    const dog = await createTestDog(owner.id);
    const listing1 = await createTestSitterListing(sitter1.id);
    const listing2 = await createTestSitterListing(sitter2.id);
    
    // Create two bookings
    await createTestBooking(owner.id, sitter1.id, dog.id, listing1.id);
    await createTestBooking(owner.id, sitter2.id, dog.id, listing2.id);

    const results = await getBookingsByOwner(owner.id);

    expect(results).toHaveLength(2);
    expect(results[0].owner_id).toEqual(owner.id);
    expect(results[1].owner_id).toEqual(owner.id);
    
    // Verify different sitters
    const sitterIds = results.map(b => b.sitter_id).sort();
    expect(sitterIds).toEqual([sitter1.id, sitter2.id].sort());
  });

  it('should return empty array when owner has no bookings', async () => {
    // Create owner but no bookings
    const owner = await createTestUser('owner');

    const results = await getBookingsByOwner(owner.id);

    expect(results).toHaveLength(0);
    expect(Array.isArray(results)).toBe(true);
  });

  it('should return empty array for non-existent owner', async () => {
    const results = await getBookingsByOwner(99999);

    expect(results).toHaveLength(0);
    expect(Array.isArray(results)).toBe(true);
  });

  it('should not return bookings from other owners', async () => {
    // Create two owners with their own bookings
    const owner1 = await createTestUser('owner');
    const owner2 = await createTestUser('owner');
    const sitter = await createTestUser('sitter');
    const dog1 = await createTestDog(owner1.id);
    const dog2 = await createTestDog(owner2.id);
    const listing = await createTestSitterListing(sitter.id);
    
    // Create bookings for both owners
    await createTestBooking(owner1.id, sitter.id, dog1.id, listing.id);
    await createTestBooking(owner2.id, sitter.id, dog2.id, listing.id);

    const results1 = await getBookingsByOwner(owner1.id);
    const results2 = await getBookingsByOwner(owner2.id);

    expect(results1).toHaveLength(1);
    expect(results2).toHaveLength(1);
    expect(results1[0].owner_id).toEqual(owner1.id);
    expect(results2[0].owner_id).toEqual(owner2.id);
    expect(results1[0].dog_id).toEqual(dog1.id);
    expect(results2[0].dog_id).toEqual(dog2.id);
  });

  it('should handle bookings with null total_hours correctly', async () => {
    // Create test data
    const owner = await createTestUser('owner');
    const sitter = await createTestUser('sitter');
    const dog = await createTestDog(owner.id);
    const listing = await createTestSitterListing(sitter.id);
    
    // Create booking with null total_hours (day-based service)
    await db.insert(bookingsTable)
      .values({
        owner_id: owner.id,
        sitter_id: sitter.id,
        dog_id: dog.id,
        listing_id: listing.id,
        service_type: 'overnight_care',
        start_date: new Date('2024-01-15T18:00:00Z'),
        end_date: new Date('2024-01-16T08:00:00Z'),
        total_hours: null,
        total_days: 1,
        total_price: '75.00',
        status: 'accepted',
        special_requests: null,
        notes: null
      })
      .returning()
      .execute();

    const results = await getBookingsByOwner(owner.id);

    expect(results).toHaveLength(1);
    expect(results[0].total_hours).toBeNull();
    expect(results[0].total_days).toEqual(1);
    expect(results[0].total_price).toEqual(75.0);
    expect(typeof results[0].total_price).toBe('number');
  });

  it('should handle different booking statuses correctly', async () => {
    // Create test data
    const owner = await createTestUser('owner');
    const sitter = await createTestUser('sitter');
    const dog = await createTestDog(owner.id);
    const listing = await createTestSitterListing(sitter.id);
    
    // Create bookings with different statuses
    const statuses = ['pending', 'accepted', 'rejected', 'completed', 'cancelled'] as const;
    for (const status of statuses) {
      await db.insert(bookingsTable)
        .values({
          owner_id: owner.id,
          sitter_id: sitter.id,
          dog_id: dog.id,
          listing_id: listing.id,
          service_type: 'pet_sitting',
          start_date: new Date('2024-01-15T09:00:00Z'),
          end_date: new Date('2024-01-15T17:00:00Z'),
          total_hours: '8.0',
          total_days: null,
          total_price: '200.00',
          status: status,
          special_requests: null,
          notes: null
        })
        .execute();
    }

    const results = await getBookingsByOwner(owner.id);

    expect(results).toHaveLength(5);
    const returnedStatuses = results.map(b => b.status).sort();
    expect(returnedStatuses).toEqual([...statuses].sort());
  });
});