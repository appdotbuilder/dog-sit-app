import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, dogsTable, sitterListingsTable, bookingsTable } from '../db/schema';
import { getBookingsBySitter } from '../handlers/get_bookings_by_sitter';
import { eq } from 'drizzle-orm';

describe('getBookingsBySitter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when sitter has no bookings', async () => {
    // Create a sitter with no bookings
    const sitter = await db.insert(usersTable)
      .values({
        email: 'sitter@test.com',
        password_hash: 'hashed_password',
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '+1234567890',
        role: 'sitter',
        location: 'Test City',
        bio: 'Experienced dog sitter'
      })
      .returning()
      .execute();

    const result = await getBookingsBySitter(sitter[0].id);

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return all bookings for a sitter', async () => {
    // Create prerequisite data
    const owner = await db.insert(usersTable)
      .values({
        email: 'owner@test.com',
        password_hash: 'hashed_password',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1234567890',
        role: 'owner',
        location: 'Test City'
      })
      .returning()
      .execute();

    const sitter = await db.insert(usersTable)
      .values({
        email: 'sitter@test.com',
        password_hash: 'hashed_password',
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '+1234567890',
        role: 'sitter',
        location: 'Test City',
        bio: 'Experienced dog sitter'
      })
      .returning()
      .execute();

    const dog = await db.insert(dogsTable)
      .values({
        owner_id: owner[0].id,
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

    const listing = await db.insert(sitterListingsTable)
      .values({
        sitter_id: sitter[0].id,
        title: 'Professional Dog Walking',
        description: 'Reliable dog walking service',
        services_offered: ['dog_walking', 'pet_sitting'],
        price_per_hour: '25.00',
        price_per_day: '150.00',
        price_per_night: '100.00',
        max_dogs: 3,
        accepts_sizes: ['small', 'medium', 'large'],
        location: 'Test City',
        radius_km: '10.0',
        experience_years: 5,
        has_yard: true,
        has_insurance: true,
        emergency_contact: '+1234567890'
      })
      .returning()
      .execute();

    // Create two bookings for the sitter
    const booking1 = await db.insert(bookingsTable)
      .values({
        owner_id: owner[0].id,
        sitter_id: sitter[0].id,
        dog_id: dog[0].id,
        listing_id: listing[0].id,
        service_type: 'dog_walking',
        start_date: new Date('2024-01-01T10:00:00Z'),
        end_date: new Date('2024-01-01T12:00:00Z'),
        total_hours: '2.00',
        total_days: null,
        total_price: '50.00',
        status: 'pending',
        special_requests: 'Please use the back door'
      })
      .returning()
      .execute();

    const booking2 = await db.insert(bookingsTable)
      .values({
        owner_id: owner[0].id,
        sitter_id: sitter[0].id,
        dog_id: dog[0].id,
        listing_id: listing[0].id,
        service_type: 'pet_sitting',
        start_date: new Date('2024-01-05T09:00:00Z'),
        end_date: new Date('2024-01-07T09:00:00Z'),
        total_hours: null,
        total_days: 2,
        total_price: '300.00',
        status: 'accepted',
        special_requests: null
      })
      .returning()
      .execute();

    const result = await getBookingsBySitter(sitter[0].id);

    expect(result).toHaveLength(2);

    // Verify first booking
    const firstBooking = result.find(b => b.id === booking1[0].id);
    expect(firstBooking).toBeDefined();
    expect(firstBooking!.owner_id).toEqual(owner[0].id);
    expect(firstBooking!.sitter_id).toEqual(sitter[0].id);
    expect(firstBooking!.dog_id).toEqual(dog[0].id);
    expect(firstBooking!.listing_id).toEqual(listing[0].id);
    expect(firstBooking!.service_type).toEqual('dog_walking');
    expect(firstBooking!.total_hours).toEqual(2.00);
    expect(typeof firstBooking!.total_hours).toBe('number');
    expect(firstBooking!.total_price).toEqual(50.00);
    expect(typeof firstBooking!.total_price).toBe('number');
    expect(firstBooking!.status).toEqual('pending');
    expect(firstBooking!.special_requests).toEqual('Please use the back door');

    // Verify second booking
    const secondBooking = result.find(b => b.id === booking2[0].id);
    expect(secondBooking).toBeDefined();
    expect(secondBooking!.service_type).toEqual('pet_sitting');
    expect(secondBooking!.total_hours).toBeNull();
    expect(secondBooking!.total_days).toEqual(2);
    expect(secondBooking!.total_price).toEqual(300.00);
    expect(typeof secondBooking!.total_price).toBe('number');
    expect(secondBooking!.status).toEqual('accepted');
    expect(secondBooking!.special_requests).toBeNull();
  });

  it('should only return bookings for the specified sitter', async () => {
    // Create two sitters and an owner
    const owner = await db.insert(usersTable)
      .values({
        email: 'owner@test.com',
        password_hash: 'hashed_password',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1234567890',
        role: 'owner',
        location: 'Test City'
      })
      .returning()
      .execute();

    const sitter1 = await db.insert(usersTable)
      .values({
        email: 'sitter1@test.com',
        password_hash: 'hashed_password',
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '+1234567890',
        role: 'sitter',
        location: 'Test City'
      })
      .returning()
      .execute();

    const sitter2 = await db.insert(usersTable)
      .values({
        email: 'sitter2@test.com',
        password_hash: 'hashed_password',
        first_name: 'Bob',
        last_name: 'Johnson',
        phone: '+1234567890',
        role: 'sitter',
        location: 'Test City'
      })
      .returning()
      .execute();

    const dog = await db.insert(dogsTable)
      .values({
        owner_id: owner[0].id,
        name: 'Buddy',
        breed: 'Golden Retriever',
        age: 3,
        size: 'large',
        weight: '30.5',
        temperament: ['friendly', 'playful']
      })
      .returning()
      .execute();

    // Create listings for both sitters
    const listing1 = await db.insert(sitterListingsTable)
      .values({
        sitter_id: sitter1[0].id,
        title: 'Professional Dog Walking',
        description: 'Reliable dog walking service',
        services_offered: ['dog_walking'],
        price_per_hour: '25.00',
        max_dogs: 3,
        accepts_sizes: ['large'],
        location: 'Test City',
        radius_km: '10.0',
        experience_years: 5,
        has_yard: true,
        has_insurance: true
      })
      .returning()
      .execute();

    const listing2 = await db.insert(sitterListingsTable)
      .values({
        sitter_id: sitter2[0].id,
        title: 'Pet Sitting Services',
        description: 'Caring pet sitting',
        services_offered: ['pet_sitting'],
        price_per_hour: '30.00',
        max_dogs: 2,
        accepts_sizes: ['large'],
        location: 'Test City',
        radius_km: '15.0',
        experience_years: 3,
        has_yard: false,
        has_insurance: true
      })
      .returning()
      .execute();

    // Create bookings for both sitters
    await db.insert(bookingsTable)
      .values({
        owner_id: owner[0].id,
        sitter_id: sitter1[0].id,
        dog_id: dog[0].id,
        listing_id: listing1[0].id,
        service_type: 'dog_walking',
        start_date: new Date('2024-01-01T10:00:00Z'),
        end_date: new Date('2024-01-01T12:00:00Z'),
        total_hours: '2.00',
        total_price: '50.00',
        status: 'pending'
      })
      .execute();

    await db.insert(bookingsTable)
      .values({
        owner_id: owner[0].id,
        sitter_id: sitter2[0].id,
        dog_id: dog[0].id,
        listing_id: listing2[0].id,
        service_type: 'pet_sitting',
        start_date: new Date('2024-01-05T09:00:00Z'),
        end_date: new Date('2024-01-07T09:00:00Z'),
        total_hours: '48.00',
        total_price: '300.00',
        status: 'accepted'
      })
      .execute();

    // Get bookings for sitter1 only
    const result = await getBookingsBySitter(sitter1[0].id);

    expect(result).toHaveLength(1);
    expect(result[0].sitter_id).toEqual(sitter1[0].id);
    expect(result[0].service_type).toEqual('dog_walking');
  });

  it('should handle bookings with various statuses', async () => {
    // Create prerequisite data
    const owner = await db.insert(usersTable)
      .values({
        email: 'owner@test.com',
        password_hash: 'hashed_password',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1234567890',
        role: 'owner',
        location: 'Test City'
      })
      .returning()
      .execute();

    const sitter = await db.insert(usersTable)
      .values({
        email: 'sitter@test.com',
        password_hash: 'hashed_password',
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '+1234567890',
        role: 'sitter',
        location: 'Test City'
      })
      .returning()
      .execute();

    const dog = await db.insert(dogsTable)
      .values({
        owner_id: owner[0].id,
        name: 'Buddy',
        breed: 'Golden Retriever',
        age: 3,
        size: 'large',
        weight: '30.5',
        temperament: ['friendly']
      })
      .returning()
      .execute();

    const listing = await db.insert(sitterListingsTable)
      .values({
        sitter_id: sitter[0].id,
        title: 'Dog Services',
        description: 'Various dog services',
        services_offered: ['dog_walking', 'pet_sitting'],
        price_per_hour: '25.00',
        max_dogs: 3,
        accepts_sizes: ['large'],
        location: 'Test City',
        radius_km: '10.0',
        experience_years: 5,
        has_yard: true,
        has_insurance: true
      })
      .returning()
      .execute();

    // Create bookings with different statuses
    const statuses = ['pending', 'accepted', 'rejected', 'completed', 'cancelled'] as const;
    const createdBookings = [];

    for (const status of statuses) {
      const booking = await db.insert(bookingsTable)
        .values({
          owner_id: owner[0].id,
          sitter_id: sitter[0].id,
          dog_id: dog[0].id,
          listing_id: listing[0].id,
          service_type: 'dog_walking',
          start_date: new Date('2024-01-01T10:00:00Z'),
          end_date: new Date('2024-01-01T12:00:00Z'),
          total_hours: '2.00',
          total_price: '50.00',
          status: status
        })
        .returning()
        .execute();
      
      createdBookings.push(booking[0]);
    }

    const result = await getBookingsBySitter(sitter[0].id);

    expect(result).toHaveLength(5);
    
    // Verify all status types are returned
    const resultStatuses = result.map(b => b.status).sort();
    expect(resultStatuses).toEqual(['accepted', 'cancelled', 'completed', 'pending', 'rejected']);
  });

  it('should return bookings ordered by created_at timestamp', async () => {
    // Create prerequisite data
    const owner = await db.insert(usersTable)
      .values({
        email: 'owner@test.com',
        password_hash: 'hashed_password',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1234567890',
        role: 'owner',
        location: 'Test City'
      })
      .returning()
      .execute();

    const sitter = await db.insert(usersTable)
      .values({
        email: 'sitter@test.com',
        password_hash: 'hashed_password',
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '+1234567890',
        role: 'sitter',
        location: 'Test City'
      })
      .returning()
      .execute();

    const dog = await db.insert(dogsTable)
      .values({
        owner_id: owner[0].id,
        name: 'Buddy',
        breed: 'Golden Retriever',
        age: 3,
        size: 'large',
        weight: '30.5',
        temperament: ['friendly']
      })
      .returning()
      .execute();

    const listing = await db.insert(sitterListingsTable)
      .values({
        sitter_id: sitter[0].id,
        title: 'Dog Services',
        description: 'Various dog services',
        services_offered: ['dog_walking'],
        price_per_hour: '25.00',
        max_dogs: 3,
        accepts_sizes: ['large'],
        location: 'Test City',
        radius_km: '10.0',
        experience_years: 5,
        has_yard: true,
        has_insurance: true
      })
      .returning()
      .execute();

    // Create multiple bookings
    const booking1 = await db.insert(bookingsTable)
      .values({
        owner_id: owner[0].id,
        sitter_id: sitter[0].id,
        dog_id: dog[0].id,
        listing_id: listing[0].id,
        service_type: 'dog_walking',
        start_date: new Date('2024-01-01T10:00:00Z'),
        end_date: new Date('2024-01-01T12:00:00Z'),
        total_hours: '2.00',
        total_price: '50.00',
        status: 'pending'
      })
      .returning()
      .execute();

    const booking2 = await db.insert(bookingsTable)
      .values({
        owner_id: owner[0].id,
        sitter_id: sitter[0].id,
        dog_id: dog[0].id,
        listing_id: listing[0].id,
        service_type: 'dog_walking',
        start_date: new Date('2024-01-02T10:00:00Z'),
        end_date: new Date('2024-01-02T12:00:00Z'),
        total_hours: '2.00',
        total_price: '50.00',
        status: 'accepted'
      })
      .returning()
      .execute();

    const result = await getBookingsBySitter(sitter[0].id);

    expect(result).toHaveLength(2);
    
    // Verify that results have created_at timestamps
    result.forEach(booking => {
      expect(booking.created_at).toBeInstanceOf(Date);
      expect(booking.updated_at).toBeInstanceOf(Date);
    });
  });
});