import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, sitterListingsTable } from '../db/schema';
import { type SearchSittersInput } from '../schema';
import { searchSitters } from '../handlers/search_sitters';

describe('searchSitters', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Create test users first
  let sitter1Id: number;
  let sitter2Id: number;
  let sitter3Id: number;

  beforeEach(async () => {
    // Create test sitters
    const sitters = await db.insert(usersTable)
      .values([
        {
          email: 'sitter1@example.com',
          password_hash: 'hash1',
          first_name: 'John',
          last_name: 'Doe',
          role: 'sitter'
        },
        {
          email: 'sitter2@example.com',
          password_hash: 'hash2',
          first_name: 'Jane',
          last_name: 'Smith',
          role: 'sitter'
        },
        {
          email: 'sitter3@example.com',
          password_hash: 'hash3',
          first_name: 'Bob',
          last_name: 'Wilson',
          role: 'sitter'
        }
      ])
      .returning()
      .execute();

    sitter1Id = sitters[0].id;
    sitter2Id = sitters[1].id;
    sitter3Id = sitters[2].id;

    // Create test sitter listings
    await db.insert(sitterListingsTable)
      .values([
        {
          sitter_id: sitter1Id,
          title: 'Professional Dog Walker',
          description: 'Experienced dog walker in downtown area',
          services_offered: ['dog_walking', 'pet_sitting'],
          price_per_hour: '25.00',
          price_per_day: '150.00',
          max_dogs: 3,
          accepts_sizes: ['small', 'medium'],
          location: 'Downtown',
          radius_km: '10.00',
          experience_years: 5,
          has_yard: true,
          has_insurance: true,
          is_active: true
        },
        {
          sitter_id: sitter2Id,
          title: 'Affordable Pet Care',
          description: 'Budget-friendly pet sitting services',
          services_offered: ['pet_sitting', 'daycare'],
          price_per_hour: '15.00',
          price_per_day: '80.00',
          max_dogs: 2,
          accepts_sizes: ['small'],
          location: 'Suburbs',
          radius_km: '5.00',
          experience_years: 2,
          has_yard: false,
          has_insurance: false,
          is_active: true
        },
        {
          sitter_id: sitter3Id,
          title: 'Premium Pet Services',
          description: 'High-end pet care with grooming',
          services_offered: ['grooming', 'overnight_care'],
          price_per_hour: '40.00',
          price_per_night: '100.00',
          max_dogs: 1,
          accepts_sizes: ['large', 'extra_large'],
          location: 'Downtown',
          radius_km: '15.00',
          experience_years: 10,
          has_yard: true,
          has_insurance: true,
          is_active: false // Inactive listing
        }
      ])
      .execute();
  });

  it('should return all active listings when no filters provided', async () => {
    const input: SearchSittersInput = {};
    const results = await searchSitters(input);

    expect(results).toHaveLength(2); // Only active listings
    expect(results.every(listing => listing.is_active)).toBe(true);
    
    // Verify numeric conversions
    results.forEach(listing => {
      expect(typeof listing.price_per_hour).toBe('number');
      expect(typeof listing.radius_km).toBe('number');
      if (listing.price_per_day) {
        expect(typeof listing.price_per_day).toBe('number');
      }
      if (listing.price_per_night) {
        expect(typeof listing.price_per_night).toBe('number');
      }
    });
  });

  it('should filter by location', async () => {
    const input: SearchSittersInput = {
      location: 'Downtown'
    };
    const results = await searchSitters(input);

    expect(results).toHaveLength(1);
    expect(results[0].location).toBe('Downtown');
    expect(results[0].title).toBe('Professional Dog Walker');
  });

  it('should filter by service type', async () => {
    const input: SearchSittersInput = {
      service_type: 'dog_walking'
    };
    const results = await searchSitters(input);

    expect(results).toHaveLength(1);
    expect(results[0].services_offered).toContain('dog_walking');
    expect(results[0].title).toBe('Professional Dog Walker');
  });

  it('should filter by dog size', async () => {
    const input: SearchSittersInput = {
      dog_size: 'small'
    };
    const results = await searchSitters(input);

    expect(results).toHaveLength(2);
    results.forEach(listing => {
      expect(listing.accepts_sizes).toContain('small');
    });
  });

  it('should filter by maximum price per hour', async () => {
    const input: SearchSittersInput = {
      max_price_per_hour: 20
    };
    const results = await searchSitters(input);

    expect(results).toHaveLength(1);
    expect(results[0].price_per_hour).toBeLessThanOrEqual(20);
    expect(results[0].title).toBe('Affordable Pet Care');
  });

  it('should filter by yard requirement', async () => {
    const input: SearchSittersInput = {
      has_yard: true
    };
    const results = await searchSitters(input);

    expect(results).toHaveLength(1);
    expect(results[0].has_yard).toBe(true);
    expect(results[0].title).toBe('Professional Dog Walker');
  });

  it('should filter by insurance requirement', async () => {
    const input: SearchSittersInput = {
      has_insurance: true
    };
    const results = await searchSitters(input);

    expect(results).toHaveLength(1);
    expect(results[0].has_insurance).toBe(true);
    expect(results[0].title).toBe('Professional Dog Walker');
  });

  it('should filter by minimum experience years', async () => {
    const input: SearchSittersInput = {
      min_experience_years: 3
    };
    const results = await searchSitters(input);

    expect(results).toHaveLength(1);
    expect(results[0].experience_years).toBeGreaterThanOrEqual(3);
    expect(results[0].title).toBe('Professional Dog Walker');
  });

  it('should filter by radius requirement', async () => {
    const input: SearchSittersInput = {
      radius_km: 8
    };
    const results = await searchSitters(input);

    expect(results).toHaveLength(1);
    expect(results[0].radius_km).toBeGreaterThanOrEqual(8);
    expect(results[0].title).toBe('Professional Dog Walker');
  });

  it('should handle multiple filters correctly', async () => {
    const input: SearchSittersInput = {
      location: 'Downtown',
      service_type: 'dog_walking',
      dog_size: 'medium',
      max_price_per_hour: 30,
      has_yard: true,
      has_insurance: true
    };
    const results = await searchSitters(input);

    expect(results).toHaveLength(1);
    const listing = results[0];
    expect(listing.location).toBe('Downtown');
    expect(listing.services_offered).toContain('dog_walking');
    expect(listing.accepts_sizes).toContain('medium');
    expect(listing.price_per_hour).toBeLessThanOrEqual(30);
    expect(listing.has_yard).toBe(true);
    expect(listing.has_insurance).toBe(true);
  });

  it('should return empty array when no listings match filters', async () => {
    const input: SearchSittersInput = {
      location: 'NonexistentLocation'
    };
    const results = await searchSitters(input);

    expect(results).toHaveLength(0);
  });

  it('should handle edge case with zero experience requirement', async () => {
    const input: SearchSittersInput = {
      min_experience_years: 0
    };
    const results = await searchSitters(input);

    expect(results).toHaveLength(2); // All active listings have >= 0 experience
    results.forEach(listing => {
      expect(listing.experience_years).toBeGreaterThanOrEqual(0);
    });
  });

  it('should filter out inactive listings', async () => {
    // Search for high-end services that would match the inactive listing
    const input: SearchSittersInput = {
      service_type: 'grooming',
      dog_size: 'large'
    };
    const results = await searchSitters(input);

    expect(results).toHaveLength(0); // The matching listing is inactive
  });

  it('should handle filtering by service not offered by any active listing', async () => {
    const input: SearchSittersInput = {
      service_type: 'overnight_care'
    };
    const results = await searchSitters(input);

    expect(results).toHaveLength(0); // Only inactive listing offers this service
  });

  it('should correctly convert all numeric fields', async () => {
    const results = await searchSitters({});

    expect(results.length).toBeGreaterThan(0);
    
    results.forEach(listing => {
      // Test required numeric fields
      expect(typeof listing.price_per_hour).toBe('number');
      expect(typeof listing.radius_km).toBe('number');
      expect(listing.price_per_hour).toBeGreaterThan(0);
      expect(listing.radius_km).toBeGreaterThan(0);
      
      // Test optional numeric fields
      if (listing.price_per_day !== null) {
        expect(typeof listing.price_per_day).toBe('number');
        expect(listing.price_per_day).toBeGreaterThan(0);
      }
      
      if (listing.price_per_night !== null) {
        expect(typeof listing.price_per_night).toBe('number');
        expect(listing.price_per_night).toBeGreaterThan(0);
      }
    });
  });
});