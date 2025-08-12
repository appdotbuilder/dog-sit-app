import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { sitterListingsTable, usersTable } from '../db/schema';
import { type CreateSitterListingInput } from '../schema';
import { createSitterListing } from '../handlers/create_sitter_listing';
import { eq } from 'drizzle-orm';

// Test sitter user
const testSitterUser = {
  email: 'sitter@example.com',
  password_hash: 'hashedpassword123',
  first_name: 'Jane',
  last_name: 'Doe',
  phone: '+1234567890',
  role: 'sitter' as const,
  location: 'New York, NY',
  bio: 'Experienced dog sitter'
};

const testBothUser = {
  email: 'both@example.com',
  password_hash: 'hashedpassword456',
  first_name: 'John',
  last_name: 'Smith',
  phone: '+1987654321',
  role: 'both' as const,
  location: 'Brooklyn, NY',
  bio: 'Dog owner and sitter'
};

const testOwnerUser = {
  email: 'owner@example.com',
  password_hash: 'hashedpassword789',
  first_name: 'Bob',
  last_name: 'Johnson',
  phone: '+1122334455',
  role: 'owner' as const,
  location: 'Queens, NY',
  bio: 'Dog owner'
};

// Test input for sitter listing
const testInput: CreateSitterListingInput = {
  sitter_id: 1, // Will be updated in tests
  title: 'Professional Dog Walking Service',
  description: 'Experienced dog walker providing reliable and caring services for your furry friends.',
  services_offered: ['dog_walking', 'pet_sitting'],
  price_per_hour: 25.50,
  price_per_day: 150.00,
  price_per_night: 80.00,
  max_dogs: 3,
  accepts_sizes: ['small', 'medium', 'large'],
  location: 'New York, NY',
  radius_km: 10.5,
  experience_years: 5,
  has_yard: true,
  has_insurance: true,
  emergency_contact: '+1555666777'
};

describe('createSitterListing', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a sitter listing for user with sitter role', async () => {
    // Create a sitter user first
    const users = await db.insert(usersTable)
      .values(testSitterUser)
      .returning()
      .execute();
    
    const userId = users[0].id;
    const input = { ...testInput, sitter_id: userId };

    const result = await createSitterListing(input);

    // Basic field validation
    expect(result.sitter_id).toEqual(userId);
    expect(result.title).toEqual('Professional Dog Walking Service');
    expect(result.description).toEqual(testInput.description);
    expect(result.services_offered).toEqual(['dog_walking', 'pet_sitting']);
    expect(result.price_per_hour).toEqual(25.50);
    expect(typeof result.price_per_hour).toBe('number');
    expect(result.price_per_day).toEqual(150.00);
    expect(typeof result.price_per_day).toBe('number');
    expect(result.price_per_night).toEqual(80.00);
    expect(typeof result.price_per_night).toBe('number');
    expect(result.max_dogs).toEqual(3);
    expect(result.accepts_sizes).toEqual(['small', 'medium', 'large']);
    expect(result.location).toEqual('New York, NY');
    expect(result.radius_km).toEqual(10.5);
    expect(typeof result.radius_km).toBe('number');
    expect(result.experience_years).toEqual(5);
    expect(result.has_yard).toEqual(true);
    expect(result.has_insurance).toEqual(true);
    expect(result.emergency_contact).toEqual('+1555666777');
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a sitter listing for user with both role', async () => {
    // Create a user with 'both' role
    const users = await db.insert(usersTable)
      .values(testBothUser)
      .returning()
      .execute();
    
    const userId = users[0].id;
    const input = { ...testInput, sitter_id: userId };

    const result = await createSitterListing(input);

    expect(result.sitter_id).toEqual(userId);
    expect(result.title).toEqual(testInput.title);
    expect(result.id).toBeDefined();
  });

  it('should save sitter listing to database', async () => {
    // Create a sitter user first
    const users = await db.insert(usersTable)
      .values(testSitterUser)
      .returning()
      .execute();
    
    const userId = users[0].id;
    const input = { ...testInput, sitter_id: userId };

    const result = await createSitterListing(input);

    // Query database to verify the listing was saved
    const listings = await db.select()
      .from(sitterListingsTable)
      .where(eq(sitterListingsTable.id, result.id))
      .execute();

    expect(listings).toHaveLength(1);
    expect(listings[0].sitter_id).toEqual(userId);
    expect(listings[0].title).toEqual('Professional Dog Walking Service');
    expect(listings[0].description).toEqual(testInput.description);
    expect(listings[0].services_offered).toEqual(['dog_walking', 'pet_sitting']);
    expect(parseFloat(listings[0].price_per_hour)).toEqual(25.50);
    expect(parseFloat(listings[0].price_per_day!)).toEqual(150.00);
    expect(parseFloat(listings[0].price_per_night!)).toEqual(80.00);
    expect(parseFloat(listings[0].radius_km)).toEqual(10.5);
    expect(listings[0].created_at).toBeInstanceOf(Date);
    expect(listings[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle nullable price fields correctly', async () => {
    // Create a sitter user first
    const users = await db.insert(usersTable)
      .values(testSitterUser)
      .returning()
      .execute();
    
    const userId = users[0].id;
    const inputWithNulls = {
      ...testInput,
      sitter_id: userId,
      price_per_day: null,
      price_per_night: null,
      emergency_contact: null
    };

    const result = await createSitterListing(inputWithNulls);

    expect(result.price_per_day).toBeNull();
    expect(result.price_per_night).toBeNull();
    expect(result.emergency_contact).toBeNull();
    expect(result.price_per_hour).toEqual(25.50);
    expect(typeof result.price_per_hour).toBe('number');
  });

  it('should throw error when user does not exist', async () => {
    const input = { ...testInput, sitter_id: 999 }; // Non-existent user ID

    await expect(createSitterListing(input)).rejects.toThrow(/user not found/i);
  });

  it('should throw error when user does not have sitter role permissions', async () => {
    // Create a user with 'owner' role only
    const users = await db.insert(usersTable)
      .values(testOwnerUser)
      .returning()
      .execute();
    
    const userId = users[0].id;
    const input = { ...testInput, sitter_id: userId };

    await expect(createSitterListing(input)).rejects.toThrow(/does not have sitter role permissions/i);
  });

  it('should handle complex service arrays and size arrays', async () => {
    // Create a sitter user first
    const users = await db.insert(usersTable)
      .values(testSitterUser)
      .returning()
      .execute();
    
    const userId = users[0].id;
    const complexInput = {
      ...testInput,
      sitter_id: userId,
      services_offered: ['dog_walking', 'pet_sitting', 'daycare', 'overnight_care', 'grooming'] as ('dog_walking' | 'pet_sitting' | 'daycare' | 'overnight_care' | 'grooming')[],
      accepts_sizes: ['small', 'medium', 'large', 'extra_large'] as ('small' | 'medium' | 'large' | 'extra_large')[]
    };

    const result = await createSitterListing(complexInput);

    expect(result.services_offered).toEqual(['dog_walking', 'pet_sitting', 'daycare', 'overnight_care', 'grooming']);
    expect(result.accepts_sizes).toEqual(['small', 'medium', 'large', 'extra_large']);
  });

  it('should handle minimum required fields', async () => {
    // Create a sitter user first
    const users = await db.insert(usersTable)
      .values(testSitterUser)
      .returning()
      .execute();
    
    const userId = users[0].id;
    const minimalInput: CreateSitterListingInput = {
      sitter_id: userId,
      title: 'Basic Service',
      description: 'A basic dog sitting service',
      services_offered: ['pet_sitting'],
      price_per_hour: 20.00,
      price_per_day: null,
      price_per_night: null,
      max_dogs: 1,
      accepts_sizes: ['small'],
      location: 'Brooklyn, NY',
      radius_km: 5.0,
      experience_years: 1,
      has_yard: false,
      has_insurance: false,
      emergency_contact: null
    };

    const result = await createSitterListing(minimalInput);

    expect(result.title).toEqual('Basic Service');
    expect(result.services_offered).toEqual(['pet_sitting']);
    expect(result.accepts_sizes).toEqual(['small']);
    expect(result.price_per_day).toBeNull();
    expect(result.price_per_night).toBeNull();
    expect(result.emergency_contact).toBeNull();
    expect(result.has_yard).toEqual(false);
    expect(result.has_insurance).toEqual(false);
  });
});