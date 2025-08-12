import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, sitterListingsTable } from '../db/schema';
import { type CreateUserInput, type CreateSitterListingInput } from '../schema';
import { getSitterListings } from '../handlers/get_sitter_listings';
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
  bio: 'Experienced dog sitter'
};

const anotherUser: CreateUserInput = {
  email: 'anothersitter@example.com',
  password: 'password123',
  first_name: 'Jane',
  last_name: 'Smith',
  phone: '+0987654321',
  role: 'sitter',
  location: 'Boston',
  bio: 'Professional pet care provider'
};

// Test listing data
const testListing1: CreateSitterListingInput = {
  sitter_id: 1, // Will be updated after user creation
  title: 'Professional Dog Walking',
  description: 'Experienced dog walker available for daily walks',
  services_offered: ['dog_walking', 'pet_sitting'],
  price_per_hour: 25.50,
  price_per_day: 120.00,
  price_per_night: null,
  max_dogs: 3,
  accepts_sizes: ['small', 'medium'],
  location: 'New York',
  radius_km: 5.0,
  experience_years: 5,
  has_yard: true,
  has_insurance: true,
  emergency_contact: '+1234567890'
};

const testListing2: CreateSitterListingInput = {
  sitter_id: 1, // Will be updated after user creation
  title: 'Overnight Pet Care',
  description: 'Safe overnight care for your beloved pets',
  services_offered: ['overnight_care', 'pet_sitting'],
  price_per_hour: 30.00,
  price_per_day: null,
  price_per_night: 85.75,
  max_dogs: 2,
  accepts_sizes: ['large', 'extra_large'],
  location: 'New York',
  radius_km: 10.5,
  experience_years: 3,
  has_yard: false,
  has_insurance: true,
  emergency_contact: null
};

const createTestUser = async (userData: CreateUserInput) => {
  const passwordHash = 'hashed_' + userData.password; // Simple hash for testing
  
  const result = await db.insert(usersTable)
    .values({
      email: userData.email,
      password_hash: passwordHash,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      role: userData.role,
      location: userData.location,
      bio: userData.bio
    })
    .returning()
    .execute();

  return result[0];
};

const createTestListing = async (listingData: CreateSitterListingInput) => {
  const result = await db.insert(sitterListingsTable)
    .values({
      sitter_id: listingData.sitter_id,
      title: listingData.title,
      description: listingData.description,
      services_offered: listingData.services_offered,
      price_per_hour: listingData.price_per_hour.toString(),
      price_per_day: listingData.price_per_day ? listingData.price_per_day.toString() : null,
      price_per_night: listingData.price_per_night ? listingData.price_per_night.toString() : null,
      max_dogs: listingData.max_dogs,
      accepts_sizes: listingData.accepts_sizes,
      location: listingData.location,
      radius_km: listingData.radius_km.toString(),
      experience_years: listingData.experience_years,
      has_yard: listingData.has_yard,
      has_insurance: listingData.has_insurance,
      emergency_contact: listingData.emergency_contact
    })
    .returning()
    .execute();

  return result[0];
};

describe('getSitterListings', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all listings for a specific sitter', async () => {
    // Create test user
    const user = await createTestUser(testUser);
    
    // Create test listings
    const listing1Data = { ...testListing1, sitter_id: user.id };
    const listing2Data = { ...testListing2, sitter_id: user.id };
    
    await createTestListing(listing1Data);
    await createTestListing(listing2Data);

    // Test the handler
    const results = await getSitterListings(user.id);

    expect(results).toHaveLength(2);
    
    // Verify first listing
    const firstListing = results.find(l => l.title === 'Professional Dog Walking');
    expect(firstListing).toBeDefined();
    expect(firstListing!.sitter_id).toEqual(user.id);
    expect(firstListing!.title).toEqual('Professional Dog Walking');
    expect(firstListing!.description).toEqual('Experienced dog walker available for daily walks');
    expect(firstListing!.services_offered).toEqual(['dog_walking', 'pet_sitting']);
    expect(firstListing!.price_per_hour).toEqual(25.50);
    expect(typeof firstListing!.price_per_hour).toEqual('number');
    expect(firstListing!.price_per_day).toEqual(120.00);
    expect(typeof firstListing!.price_per_day).toEqual('number');
    expect(firstListing!.price_per_night).toBeNull();
    expect(firstListing!.max_dogs).toEqual(3);
    expect(firstListing!.accepts_sizes).toEqual(['small', 'medium']);
    expect(firstListing!.location).toEqual('New York');
    expect(firstListing!.radius_km).toEqual(5.0);
    expect(typeof firstListing!.radius_km).toEqual('number');
    expect(firstListing!.experience_years).toEqual(5);
    expect(firstListing!.has_yard).toBe(true);
    expect(firstListing!.has_insurance).toBe(true);
    expect(firstListing!.emergency_contact).toEqual('+1234567890');
    expect(firstListing!.is_active).toBe(true);
    expect(firstListing!.id).toBeDefined();
    expect(firstListing!.created_at).toBeInstanceOf(Date);
    expect(firstListing!.updated_at).toBeInstanceOf(Date);
    
    // Verify second listing
    const secondListing = results.find(l => l.title === 'Overnight Pet Care');
    expect(secondListing).toBeDefined();
    expect(secondListing!.sitter_id).toEqual(user.id);
    expect(secondListing!.price_per_hour).toEqual(30.00);
    expect(typeof secondListing!.price_per_hour).toEqual('number');
    expect(secondListing!.price_per_day).toBeNull();
    expect(secondListing!.price_per_night).toEqual(85.75);
    expect(typeof secondListing!.price_per_night).toEqual('number');
    expect(secondListing!.radius_km).toEqual(10.5);
    expect(typeof secondListing!.radius_km).toEqual('number');
    expect(secondListing!.has_yard).toBe(false);
    expect(secondListing!.emergency_contact).toBeNull();
  });

  it('should return empty array when sitter has no listings', async () => {
    // Create test user but no listings
    const user = await createTestUser(testUser);

    const results = await getSitterListings(user.id);

    expect(results).toHaveLength(0);
    expect(Array.isArray(results)).toBe(true);
  });

  it('should return empty array for non-existent sitter', async () => {
    const results = await getSitterListings(999);

    expect(results).toHaveLength(0);
    expect(Array.isArray(results)).toBe(true);
  });

  it('should include both active and inactive listings', async () => {
    // Create test user
    const user = await createTestUser(testUser);
    
    // Create active listing
    const activeListing = { ...testListing1, sitter_id: user.id };
    await createTestListing(activeListing);
    
    // Create inactive listing by updating is_active to false
    const inactiveListing = { ...testListing2, sitter_id: user.id };
    const created = await createTestListing(inactiveListing);
    
    // Update the listing to be inactive
    await db.update(sitterListingsTable)
      .set({ is_active: false })
      .where(eq(sitterListingsTable.id, created.id))
      .execute();

    // Test the handler
    const results = await getSitterListings(user.id);

    expect(results).toHaveLength(2);
    
    const activeResult = results.find(l => l.is_active === true);
    const inactiveResult = results.find(l => l.is_active === false);
    
    expect(activeResult).toBeDefined();
    expect(inactiveResult).toBeDefined();
    expect(activeResult!.title).toEqual('Professional Dog Walking');
    expect(inactiveResult!.title).toEqual('Overnight Pet Care');
  });

  it('should only return listings for specified sitter', async () => {
    // Create two different users
    const user1 = await createTestUser(testUser);
    const user2 = await createTestUser(anotherUser);
    
    // Create listings for both users
    const listing1 = { ...testListing1, sitter_id: user1.id };
    const listing2 = { ...testListing2, sitter_id: user2.id };
    
    await createTestListing(listing1);
    await createTestListing(listing2);

    // Test handler for first user
    const results1 = await getSitterListings(user1.id);
    expect(results1).toHaveLength(1);
    expect(results1[0].sitter_id).toEqual(user1.id);
    expect(results1[0].title).toEqual('Professional Dog Walking');

    // Test handler for second user
    const results2 = await getSitterListings(user2.id);
    expect(results2).toHaveLength(1);
    expect(results2[0].sitter_id).toEqual(user2.id);
    expect(results2[0].title).toEqual('Overnight Pet Care');
  });

  it('should handle numeric type conversions correctly', async () => {
    // Create test user
    const user = await createTestUser(testUser);
    
    // Create listing with various numeric values
    const listingWithDecimals = {
      ...testListing1,
      sitter_id: user.id,
      price_per_hour: 15.99,
      price_per_day: 75.50,
      radius_km: 12.75
    };
    
    await createTestListing(listingWithDecimals);

    const results = await getSitterListings(user.id);

    expect(results).toHaveLength(1);
    const listing = results[0];
    
    // Verify all numeric fields are properly converted to numbers
    expect(typeof listing.price_per_hour).toEqual('number');
    expect(typeof listing.price_per_day).toEqual('number');
    expect(typeof listing.radius_km).toEqual('number');
    
    expect(listing.price_per_hour).toEqual(15.99);
    expect(listing.price_per_day).toEqual(75.50);
    expect(listing.radius_km).toEqual(12.75);
    
    // Verify null numeric fields remain null
    const listingWithNulls = {
      ...testListing2,
      sitter_id: user.id,
      price_per_day: null,
      price_per_night: 100.25
    };
    
    await createTestListing(listingWithNulls);

    const results2 = await getSitterListings(user.id);
    const secondListing = results2.find(l => l.title === 'Overnight Pet Care');
    
    expect(secondListing!.price_per_day).toBeNull();
    expect(typeof secondListing!.price_per_night).toEqual('number');
    expect(secondListing!.price_per_night).toEqual(100.25);
  });
});