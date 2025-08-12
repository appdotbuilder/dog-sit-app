import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, dogsTable, sitterListingsTable, bookingsTable, reviewsTable } from '../db/schema';
import { getReviews } from '../handlers/get_reviews';

describe('getReviews', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when user has no reviews', async () => {
    // Create a user with no reviews
    const users = await db.insert(usersTable).values({
      email: 'test@example.com',
      password_hash: 'hashedpassword',
      first_name: 'Test',
      last_name: 'User',
      role: 'sitter'
    }).returning().execute();

    const result = await getReviews(users[0].id);

    expect(result).toEqual([]);
  });

  it('should return reviews received by user with reviewer information', async () => {
    // Create reviewer and reviewee users
    const users = await db.insert(usersTable).values([
      {
        email: 'reviewer@example.com',
        password_hash: 'hashedpassword',
        first_name: 'John',
        last_name: 'Reviewer',
        role: 'owner',
        profile_image_url: 'http://example.com/profile.jpg'
      },
      {
        email: 'reviewee@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Jane',
        last_name: 'Sitter',
        role: 'sitter'
      }
    ]).returning().execute();

    const reviewer = users[0];
    const reviewee = users[1];

    // Create prerequisite data for booking
    const dogs = await db.insert(dogsTable).values({
      owner_id: reviewer.id,
      name: 'Buddy',
      age: 3,
      size: 'medium',
      temperament: ['friendly', 'playful']
    }).returning().execute();

    const listings = await db.insert(sitterListingsTable).values({
      sitter_id: reviewee.id,
      title: 'Dog Walking Service',
      description: 'Professional dog walking',
      services_offered: ['dog_walking'],
      price_per_hour: '25.00',
      max_dogs: 3,
      accepts_sizes: ['small', 'medium', 'large'],
      location: 'New York',
      radius_km: '10.00',
      experience_years: 5,
      has_yard: true,
      has_insurance: true
    }).returning().execute();

    const bookings = await db.insert(bookingsTable).values({
      owner_id: reviewer.id,
      sitter_id: reviewee.id,
      dog_id: dogs[0].id,
      listing_id: listings[0].id,
      service_type: 'dog_walking',
      start_date: new Date('2023-12-01T10:00:00Z'),
      end_date: new Date('2023-12-01T12:00:00Z'),
      total_price: '50.00'
    }).returning().execute();

    // Create review
    const reviews = await db.insert(reviewsTable).values({
      booking_id: bookings[0].id,
      reviewer_id: reviewer.id,
      reviewee_id: reviewee.id,
      rating: 5,
      comment: 'Excellent service, very reliable!'
    }).returning().execute();

    const result = await getReviews(reviewee.id);

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual(reviews[0].id);
    expect(result[0].reviewer_id).toEqual(reviewer.id);
    expect(result[0].reviewee_id).toEqual(reviewee.id);
    expect(result[0].rating).toEqual(5);
    expect(result[0].comment).toEqual('Excellent service, very reliable!');
    expect(result[0].created_at).toBeInstanceOf(Date);

    // Verify reviewer information is included
    expect((result[0] as any).reviewer).toBeDefined();
    expect((result[0] as any).reviewer.first_name).toEqual('John');
    expect((result[0] as any).reviewer.last_name).toEqual('Reviewer');
    expect((result[0] as any).reviewer.profile_image_url).toEqual('http://example.com/profile.jpg');
  });

  it('should return multiple reviews ordered by creation date (newest first)', async () => {
    // Create users
    const users = await db.insert(usersTable).values([
      {
        email: 'reviewer1@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Alice',
        last_name: 'Owner1',
        role: 'owner'
      },
      {
        email: 'reviewer2@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Bob',
        last_name: 'Owner2',
        role: 'owner'
      },
      {
        email: 'reviewee@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Carol',
        last_name: 'Sitter',
        role: 'sitter'
      }
    ]).returning().execute();

    const reviewer1 = users[0];
    const reviewer2 = users[1];
    const reviewee = users[2];

    // Create prerequisite data
    const dogs = await db.insert(dogsTable).values([
      {
        owner_id: reviewer1.id,
        name: 'Dog1',
        age: 2,
        size: 'small',
        temperament: ['calm']
      },
      {
        owner_id: reviewer2.id,
        name: 'Dog2',
        age: 4,
        size: 'large',
        temperament: ['energetic']
      }
    ]).returning().execute();

    const listings = await db.insert(sitterListingsTable).values({
      sitter_id: reviewee.id,
      title: 'Pet Sitting Service',
      description: 'Comprehensive pet care',
      services_offered: ['pet_sitting'],
      price_per_hour: '30.00',
      max_dogs: 5,
      accepts_sizes: ['small', 'medium', 'large'],
      location: 'Los Angeles',
      radius_km: '15.00',
      experience_years: 3,
      has_yard: false,
      has_insurance: true
    }).returning().execute();

    const bookings = await db.insert(bookingsTable).values([
      {
        owner_id: reviewer1.id,
        sitter_id: reviewee.id,
        dog_id: dogs[0].id,
        listing_id: listings[0].id,
        service_type: 'pet_sitting',
        start_date: new Date('2023-11-01T09:00:00Z'),
        end_date: new Date('2023-11-01T17:00:00Z'),
        total_price: '240.00'
      },
      {
        owner_id: reviewer2.id,
        sitter_id: reviewee.id,
        dog_id: dogs[1].id,
        listing_id: listings[0].id,
        service_type: 'pet_sitting',
        start_date: new Date('2023-12-01T09:00:00Z'),
        end_date: new Date('2023-12-01T17:00:00Z'),
        total_price: '240.00'
      }
    ]).returning().execute();

    // Create reviews with different creation dates
    const olderDate = new Date('2023-11-15T10:00:00Z');
    const newerDate = new Date('2023-12-15T10:00:00Z');

    await db.insert(reviewsTable).values([
      {
        booking_id: bookings[0].id,
        reviewer_id: reviewer1.id,
        reviewee_id: reviewee.id,
        rating: 4,
        comment: 'Good service',
        created_at: olderDate
      },
      {
        booking_id: bookings[1].id,
        reviewer_id: reviewer2.id,
        reviewee_id: reviewee.id,
        rating: 5,
        comment: 'Outstanding care!',
        created_at: newerDate
      }
    ]).execute();

    const result = await getReviews(reviewee.id);

    expect(result).toHaveLength(2);
    
    // Should be ordered by creation date (newest first)
    expect(result[0].comment).toEqual('Outstanding care!');
    expect(result[0].rating).toEqual(5);
    expect((result[0] as any).reviewer.first_name).toEqual('Bob');
    
    expect(result[1].comment).toEqual('Good service');
    expect(result[1].rating).toEqual(4);
    expect((result[1] as any).reviewer.first_name).toEqual('Alice');

    // Verify dates are properly ordered (newer first)
    expect(result[0].created_at > result[1].created_at).toBe(true);
  });

  it('should only return reviews for the specified user', async () => {
    // Create multiple users
    const users = await db.insert(usersTable).values([
      {
        email: 'reviewer@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Reviewer',
        last_name: 'User',
        role: 'owner'
      },
      {
        email: 'sitter1@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Sitter',
        last_name: 'One',
        role: 'sitter'
      },
      {
        email: 'sitter2@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Sitter',
        last_name: 'Two',
        role: 'sitter'
      }
    ]).returning().execute();

    const reviewer = users[0];
    const sitter1 = users[1];
    const sitter2 = users[2];

    // Create prerequisite data
    const dogs = await db.insert(dogsTable).values({
      owner_id: reviewer.id,
      name: 'Test Dog',
      age: 3,
      size: 'medium',
      temperament: ['friendly']
    }).returning().execute();

    const listings = await db.insert(sitterListingsTable).values([
      {
        sitter_id: sitter1.id,
        title: 'Service 1',
        description: 'First service',
        services_offered: ['dog_walking'],
        price_per_hour: '20.00',
        max_dogs: 2,
        accepts_sizes: ['medium'],
        location: 'City1',
        radius_km: '5.00',
        experience_years: 2,
        has_yard: false,
        has_insurance: true
      },
      {
        sitter_id: sitter2.id,
        title: 'Service 2',
        description: 'Second service',
        services_offered: ['pet_sitting'],
        price_per_hour: '25.00',
        max_dogs: 3,
        accepts_sizes: ['medium'],
        location: 'City2',
        radius_km: '8.00',
        experience_years: 4,
        has_yard: true,
        has_insurance: false
      }
    ]).returning().execute();

    const bookings = await db.insert(bookingsTable).values([
      {
        owner_id: reviewer.id,
        sitter_id: sitter1.id,
        dog_id: dogs[0].id,
        listing_id: listings[0].id,
        service_type: 'dog_walking',
        start_date: new Date('2023-11-01T10:00:00Z'),
        end_date: new Date('2023-11-01T12:00:00Z'),
        total_price: '40.00'
      },
      {
        owner_id: reviewer.id,
        sitter_id: sitter2.id,
        dog_id: dogs[0].id,
        listing_id: listings[1].id,
        service_type: 'pet_sitting',
        start_date: new Date('2023-12-01T09:00:00Z'),
        end_date: new Date('2023-12-01T17:00:00Z'),
        total_price: '200.00'
      }
    ]).returning().execute();

    // Create reviews for both sitters
    await db.insert(reviewsTable).values([
      {
        booking_id: bookings[0].id,
        reviewer_id: reviewer.id,
        reviewee_id: sitter1.id,
        rating: 4,
        comment: 'Review for sitter 1'
      },
      {
        booking_id: bookings[1].id,
        reviewer_id: reviewer.id,
        reviewee_id: sitter2.id,
        rating: 5,
        comment: 'Review for sitter 2'
      }
    ]).execute();

    // Get reviews for sitter1 only
    const sitter1Reviews = await getReviews(sitter1.id);
    expect(sitter1Reviews).toHaveLength(1);
    expect(sitter1Reviews[0].reviewee_id).toEqual(sitter1.id);
    expect(sitter1Reviews[0].comment).toEqual('Review for sitter 1');

    // Get reviews for sitter2 only
    const sitter2Reviews = await getReviews(sitter2.id);
    expect(sitter2Reviews).toHaveLength(1);
    expect(sitter2Reviews[0].reviewee_id).toEqual(sitter2.id);
    expect(sitter2Reviews[0].comment).toEqual('Review for sitter 2');
  });

  it('should handle reviews with null comments', async () => {
    // Create users
    const users = await db.insert(usersTable).values([
      {
        email: 'reviewer@example.com',
        password_hash: 'hashedpassword',
        first_name: 'John',
        last_name: 'Reviewer',
        role: 'owner'
      },
      {
        email: 'reviewee@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Jane',
        last_name: 'Sitter',
        role: 'sitter'
      }
    ]).returning().execute();

    const reviewer = users[0];
    const reviewee = users[1];

    // Create prerequisite data
    const dogs = await db.insert(dogsTable).values({
      owner_id: reviewer.id,
      name: 'Test Dog',
      age: 2,
      size: 'small',
      temperament: ['calm']
    }).returning().execute();

    const listings = await db.insert(sitterListingsTable).values({
      sitter_id: reviewee.id,
      title: 'Basic Service',
      description: 'Simple pet care',
      services_offered: ['daycare'],
      price_per_hour: '15.00',
      max_dogs: 1,
      accepts_sizes: ['small'],
      location: 'Town',
      radius_km: '3.00',
      experience_years: 1,
      has_yard: false,
      has_insurance: false
    }).returning().execute();

    const bookings = await db.insert(bookingsTable).values({
      owner_id: reviewer.id,
      sitter_id: reviewee.id,
      dog_id: dogs[0].id,
      listing_id: listings[0].id,
      service_type: 'daycare',
      start_date: new Date('2023-10-01T08:00:00Z'),
      end_date: new Date('2023-10-01T18:00:00Z'),
      total_price: '150.00'
    }).returning().execute();

    // Create review with null comment
    await db.insert(reviewsTable).values({
      booking_id: bookings[0].id,
      reviewer_id: reviewer.id,
      reviewee_id: reviewee.id,
      rating: 3,
      comment: null
    }).execute();

    const result = await getReviews(reviewee.id);

    expect(result).toHaveLength(1);
    expect(result[0].rating).toEqual(3);
    expect(result[0].comment).toBeNull();
  });
});