import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, sitterListingsTable } from '../db/schema';
import { type UpdateSitterListingInput, type CreateUserInput } from '../schema';
import { updateSitterListing } from '../handlers/update_sitter_listing';
import { eq } from 'drizzle-orm';


// Test user data
const testUser: CreateUserInput = {
  email: 'sitter@example.com',
  password: 'password123',
  first_name: 'John',
  last_name: 'Doe',
  phone: '+1234567890',
  role: 'sitter',
  location: 'New York',
  bio: 'Professional pet sitter'
};

// Test sitter listing data
const testSitterListing = {
  sitter_id: 1, // Will be set after user creation
  title: 'Dog Walking Service',
  description: 'Professional dog walking in downtown area',
  services_offered: ['dog_walking', 'pet_sitting'],
  price_per_hour: '25.00',
  price_per_day: '150.00',
  price_per_night: '80.00',
  max_dogs: 3,
  accepts_sizes: ['small', 'medium'],
  location: 'Downtown',
  radius_km: '10.00',
  experience_years: 5,
  has_yard: true,
  has_insurance: true,
  emergency_contact: '+1987654321'
};

describe('updateSitterListing', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let userId: number;
  let listingId: number;

  beforeEach(async () => {
    // Create test user
    const userResult = await db.insert(usersTable)
      .values({
        ...testUser,
        password_hash: 'hashed_password_123'
      })
      .returning()
      .execute();
    userId = userResult[0].id;

    // Create test sitter listing
    const listingResult = await db.insert(sitterListingsTable)
      .values({
        ...testSitterListing,
        sitter_id: userId
      })
      .returning()
      .execute();
    listingId = listingResult[0].id;
  });

  it('should update sitter listing with all fields', async () => {
    const updateInput: UpdateSitterListingInput = {
      id: listingId,
      title: 'Updated Dog Care Service',
      description: 'Updated professional dog care in uptown area',
      services_offered: ['pet_sitting', 'daycare', 'grooming'],
      price_per_hour: 30.00,
      price_per_day: 200.00,
      price_per_night: 120.00,
      max_dogs: 5,
      accepts_sizes: ['small', 'medium', 'large'],
      location: 'Uptown',
      radius_km: 15.00,
      experience_years: 8,
      has_yard: false,
      has_insurance: false,
      emergency_contact: '+1555666777',
      is_active: false
    };

    const result = await updateSitterListing(updateInput);

    // Verify all fields were updated correctly
    expect(result.id).toEqual(listingId);
    expect(result.sitter_id).toEqual(userId);
    expect(result.title).toEqual('Updated Dog Care Service');
    expect(result.description).toEqual('Updated professional dog care in uptown area');
    expect(result.services_offered).toEqual(['pet_sitting', 'daycare', 'grooming']);
    expect(result.price_per_hour).toEqual(30.00);
    expect(result.price_per_day).toEqual(200.00);
    expect(result.price_per_night).toEqual(120.00);
    expect(result.max_dogs).toEqual(5);
    expect(result.accepts_sizes).toEqual(['small', 'medium', 'large']);
    expect(result.location).toEqual('Uptown');
    expect(result.radius_km).toEqual(15.00);
    expect(result.experience_years).toEqual(8);
    expect(result.has_yard).toEqual(false);
    expect(result.has_insurance).toEqual(false);
    expect(result.emergency_contact).toEqual('+1555666777');
    expect(result.is_active).toEqual(false);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);

    // Verify numeric types
    expect(typeof result.price_per_hour).toEqual('number');
    expect(typeof result.price_per_day).toEqual('number');
    expect(typeof result.price_per_night).toEqual('number');
    expect(typeof result.radius_km).toEqual('number');
  });

  it('should update only specified fields', async () => {
    const updateInput: UpdateSitterListingInput = {
      id: listingId,
      title: 'Partially Updated Service',
      price_per_hour: 35.00
    };

    const result = await updateSitterListing(updateInput);

    // Verify only specified fields were updated
    expect(result.title).toEqual('Partially Updated Service');
    expect(result.price_per_hour).toEqual(35.00);
    
    // Verify other fields remained unchanged
    expect(result.description).toEqual('Professional dog walking in downtown area');
    expect(result.services_offered).toEqual(['dog_walking', 'pet_sitting']);
    expect(result.price_per_day).toEqual(150.00);
    expect(result.max_dogs).toEqual(3);
    expect(result.location).toEqual('Downtown');
  });

  it('should handle null values correctly', async () => {
    const updateInput: UpdateSitterListingInput = {
      id: listingId,
      price_per_day: null,
      price_per_night: null,
      emergency_contact: null
    };

    const result = await updateSitterListing(updateInput);

    expect(result.price_per_day).toBeNull();
    expect(result.price_per_night).toBeNull();
    expect(result.emergency_contact).toBeNull();
  });

  it('should update listing in database', async () => {
    const updateInput: UpdateSitterListingInput = {
      id: listingId,
      title: 'Database Test Service',
      price_per_hour: 40.00,
      is_active: false
    };

    await updateSitterListing(updateInput);

    // Query database directly to verify update
    const listings = await db.select()
      .from(sitterListingsTable)
      .where(eq(sitterListingsTable.id, listingId))
      .execute();

    expect(listings).toHaveLength(1);
    expect(listings[0].title).toEqual('Database Test Service');
    expect(parseFloat(listings[0].price_per_hour)).toEqual(40.00);
    expect(listings[0].is_active).toEqual(false);
    expect(listings[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent listing', async () => {
    const updateInput: UpdateSitterListingInput = {
      id: 99999,
      title: 'Non-existent Service'
    };

    await expect(updateSitterListing(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should handle boolean field updates correctly', async () => {
    const updateInput: UpdateSitterListingInput = {
      id: listingId,
      has_yard: false,
      has_insurance: false,
      is_active: false
    };

    const result = await updateSitterListing(updateInput);

    expect(result.has_yard).toEqual(false);
    expect(result.has_insurance).toEqual(false);
    expect(result.is_active).toEqual(false);
    expect(typeof result.has_yard).toEqual('boolean');
    expect(typeof result.has_insurance).toEqual('boolean');
    expect(typeof result.is_active).toEqual('boolean');
  });

  it('should handle array field updates correctly', async () => {
    const updateInput: UpdateSitterListingInput = {
      id: listingId,
      services_offered: ['overnight_care'],
      accepts_sizes: ['large', 'extra_large']
    };

    const result = await updateSitterListing(updateInput);

    expect(result.services_offered).toEqual(['overnight_care']);
    expect(result.accepts_sizes).toEqual(['large', 'extra_large']);
    expect(Array.isArray(result.services_offered)).toEqual(true);
    expect(Array.isArray(result.accepts_sizes)).toEqual(true);
  });

  it('should update timestamp correctly', async () => {
    const originalListing = await db.select()
      .from(sitterListingsTable)
      .where(eq(sitterListingsTable.id, listingId))
      .execute();
    
    const originalUpdatedAt = originalListing[0].updated_at;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateSitterListingInput = {
      id: listingId,
      title: 'Timestamp Test Service'
    };

    const result = await updateSitterListing(updateInput);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });
});