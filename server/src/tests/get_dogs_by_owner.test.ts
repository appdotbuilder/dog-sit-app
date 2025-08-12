import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, dogsTable } from '../db/schema';
import { type CreateUserInput, type CreateDogInput } from '../schema';
import { getDogsByOwner } from '../handlers/get_dogs_by_owner';
import { eq } from 'drizzle-orm';

// Test user data
const testOwner: CreateUserInput = {
  email: 'owner@example.com',
  password: 'password123',
  first_name: 'John',
  last_name: 'Doe',
  phone: '123-456-7890',
  role: 'owner',
  location: 'New York',
  bio: 'Dog lover'
};

const testSitter: CreateUserInput = {
  email: 'sitter@example.com',
  password: 'password123',
  first_name: 'Jane',
  last_name: 'Smith',
  phone: '098-765-4321',
  role: 'sitter',
  location: 'Boston',
  bio: 'Professional pet sitter'
};

// Test dog data
const testDog1: CreateDogInput = {
  owner_id: 1, // Will be updated with actual owner ID
  name: 'Buddy',
  breed: 'Golden Retriever',
  age: 3,
  size: 'large',
  weight: 65.5,
  temperament: ['friendly', 'playful'],
  medical_notes: 'No known allergies',
  special_instructions: 'Loves fetch',
  profile_image_url: 'https://example.com/buddy.jpg'
};

const testDog2: CreateDogInput = {
  owner_id: 1, // Will be updated with actual owner ID
  name: 'Max',
  breed: 'Labrador',
  age: 5,
  size: 'medium',
  weight: 55.2,
  temperament: ['calm', 'friendly'],
  medical_notes: null,
  special_instructions: null,
  profile_image_url: null
};

const testDog3: CreateDogInput = {
  owner_id: 2, // Will be updated with actual owner ID (different owner)
  name: 'Luna',
  breed: 'Border Collie',
  age: 2,
  size: 'medium',
  weight: 45.0,
  temperament: ['energetic', 'playful'],
  medical_notes: 'Takes daily medication',
  special_instructions: 'Needs exercise twice daily',
  profile_image_url: 'https://example.com/luna.jpg'
};

describe('getDogsByOwner', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let ownerId1: number;
  let ownerId2: number;

  beforeEach(async () => {
    // Create test users
    const ownerResult = await db.insert(usersTable)
      .values({
        email: testOwner.email,
        password_hash: 'hashed_password_123',
        first_name: testOwner.first_name,
        last_name: testOwner.last_name,
        phone: testOwner.phone,
        role: testOwner.role,
        location: testOwner.location,
        bio: testOwner.bio
      })
      .returning()
      .execute();

    const sitterResult = await db.insert(usersTable)
      .values({
        email: testSitter.email,
        password_hash: 'hashed_password_456',
        first_name: testSitter.first_name,
        last_name: testSitter.last_name,
        phone: testSitter.phone,
        role: testSitter.role,
        location: testSitter.location,
        bio: testSitter.bio
      })
      .returning()
      .execute();

    ownerId1 = ownerResult[0].id;
    ownerId2 = sitterResult[0].id;
  });

  it('should return all active dogs for a specific owner', async () => {
    // Create dogs for the first owner
    await db.insert(dogsTable)
      .values([
        {
          ...testDog1,
          owner_id: ownerId1,
          weight: testDog1.weight?.toString(),
          temperament: testDog1.temperament
        },
        {
          ...testDog2,
          owner_id: ownerId1,
          weight: testDog2.weight?.toString(),
          temperament: testDog2.temperament
        }
      ])
      .execute();

    // Create a dog for the second owner
    await db.insert(dogsTable)
      .values({
        ...testDog3,
        owner_id: ownerId2,
        weight: testDog3.weight?.toString(),
        temperament: testDog3.temperament
      })
      .execute();

    const result = await getDogsByOwner(ownerId1);

    expect(result).toHaveLength(2);
    
    // Check first dog
    const buddy = result.find(dog => dog.name === 'Buddy');
    expect(buddy).toBeDefined();
    expect(buddy!.owner_id).toBe(ownerId1);
    expect(buddy!.breed).toBe('Golden Retriever');
    expect(buddy!.age).toBe(3);
    expect(buddy!.size).toBe('large');
    expect(buddy!.weight).toBe(65.5);
    expect(typeof buddy!.weight).toBe('number');
    expect(buddy!.temperament).toEqual(['friendly', 'playful']);
    expect(buddy!.is_active).toBe(true);

    // Check second dog
    const max = result.find(dog => dog.name === 'Max');
    expect(max).toBeDefined();
    expect(max!.owner_id).toBe(ownerId1);
    expect(max!.breed).toBe('Labrador');
    expect(max!.age).toBe(5);
    expect(max!.size).toBe('medium');
    expect(max!.weight).toBe(55.2);
    expect(typeof max!.weight).toBe('number');
    expect(max!.temperament).toEqual(['calm', 'friendly']);
    expect(max!.is_active).toBe(true);
  });

  it('should return empty array for owner with no dogs', async () => {
    // Don't create any dogs
    const result = await getDogsByOwner(ownerId1);

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return empty array for non-existent owner', async () => {
    const nonExistentOwnerId = 999;
    const result = await getDogsByOwner(nonExistentOwnerId);

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should only return active dogs (exclude inactive dogs)', async () => {
    // Create active and inactive dogs
    await db.insert(dogsTable)
      .values([
        {
          ...testDog1,
          owner_id: ownerId1,
          weight: testDog1.weight?.toString(),
          temperament: testDog1.temperament,
          is_active: true
        },
        {
          ...testDog2,
          owner_id: ownerId1,
          name: 'Inactive Dog',
          weight: testDog2.weight?.toString(),
          temperament: testDog2.temperament,
          is_active: false
        }
      ])
      .execute();

    const result = await getDogsByOwner(ownerId1);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Buddy');
    expect(result[0].is_active).toBe(true);
  });

  it('should handle dogs with null weight correctly', async () => {
    const dogWithNullWeight = {
      ...testDog1,
      owner_id: ownerId1,
      weight: null,
      temperament: testDog1.temperament
    };

    await db.insert(dogsTable)
      .values(dogWithNullWeight)
      .execute();

    const result = await getDogsByOwner(ownerId1);

    expect(result).toHaveLength(1);
    expect(result[0].weight).toBeNull();
  });

  it('should filter dogs by owner correctly', async () => {
    // Create dogs for both owners
    await db.insert(dogsTable)
      .values([
        {
          ...testDog1,
          owner_id: ownerId1,
          weight: testDog1.weight?.toString(),
          temperament: testDog1.temperament
        },
        {
          ...testDog3,
          owner_id: ownerId2,
          weight: testDog3.weight?.toString(),
          temperament: testDog3.temperament
        }
      ])
      .execute();

    // Get dogs for first owner
    const owner1Dogs = await getDogsByOwner(ownerId1);
    expect(owner1Dogs).toHaveLength(1);
    expect(owner1Dogs[0].name).toBe('Buddy');
    expect(owner1Dogs[0].owner_id).toBe(ownerId1);

    // Get dogs for second owner
    const owner2Dogs = await getDogsByOwner(ownerId2);
    expect(owner2Dogs).toHaveLength(1);
    expect(owner2Dogs[0].name).toBe('Luna');
    expect(owner2Dogs[0].owner_id).toBe(ownerId2);
  });

  it('should return dogs with proper date objects', async () => {
    await db.insert(dogsTable)
      .values({
        ...testDog1,
        owner_id: ownerId1,
        weight: testDog1.weight?.toString(),
        temperament: testDog1.temperament
      })
      .execute();

    const result = await getDogsByOwner(ownerId1);

    expect(result).toHaveLength(1);
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });
});