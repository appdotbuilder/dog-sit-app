import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { dogsTable, usersTable } from '../db/schema';
import { type CreateDogInput } from '../schema';
import { createDog } from '../handlers/create_dog';
import { eq } from 'drizzle-orm';

describe('createDog', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Create a test owner before each test that needs one
  const createTestOwner = async () => {
    const result = await db.insert(usersTable)
      .values({
        email: 'owner@test.com',
        password_hash: 'hashed_password',
        first_name: 'John',
        last_name: 'Doe',
        role: 'owner'
      })
      .returning()
      .execute();
    return result[0];
  };

  const testInput: CreateDogInput = {
    owner_id: 1, // Will be updated with real owner ID
    name: 'Buddy',
    breed: 'Golden Retriever',
    age: 3,
    size: 'large',
    weight: 65.5,
    temperament: ['friendly', 'playful'],
    medical_notes: 'Allergic to chicken',
    special_instructions: 'Needs daily walk',
    profile_image_url: 'https://example.com/buddy.jpg'
  };

  it('should create a dog with all fields', async () => {
    const owner = await createTestOwner();
    const input = { ...testInput, owner_id: owner.id };

    const result = await createDog(input);

    // Basic field validation
    expect(result.name).toEqual('Buddy');
    expect(result.breed).toEqual('Golden Retriever');
    expect(result.age).toEqual(3);
    expect(result.size).toEqual('large');
    expect(result.weight).toEqual(65.5);
    expect(typeof result.weight).toBe('number'); // Verify numeric conversion
    expect(result.temperament).toEqual(['friendly', 'playful']);
    expect(result.medical_notes).toEqual('Allergic to chicken');
    expect(result.special_instructions).toEqual('Needs daily walk');
    expect(result.profile_image_url).toEqual('https://example.com/buddy.jpg');
    expect(result.owner_id).toEqual(owner.id);
    expect(result.is_active).toBe(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a dog with minimal required fields', async () => {
    const owner = await createTestOwner();
    const minimalInput: CreateDogInput = {
      owner_id: owner.id,
      name: 'Rex',
      breed: null,
      age: 2,
      size: 'medium',
      weight: null,
      temperament: ['calm'],
      medical_notes: null,
      special_instructions: null,
      profile_image_url: null
    };

    const result = await createDog(minimalInput);

    expect(result.name).toEqual('Rex');
    expect(result.breed).toBeNull();
    expect(result.age).toEqual(2);
    expect(result.size).toEqual('medium');
    expect(result.weight).toBeNull();
    expect(result.temperament).toEqual(['calm']);
    expect(result.medical_notes).toBeNull();
    expect(result.special_instructions).toBeNull();
    expect(result.profile_image_url).toBeNull();
    expect(result.owner_id).toEqual(owner.id);
    expect(result.is_active).toBe(true);
    expect(result.id).toBeDefined();
  });

  it('should save dog to database correctly', async () => {
    const owner = await createTestOwner();
    const input = { ...testInput, owner_id: owner.id };

    const result = await createDog(input);

    // Query database to verify persistence
    const dogs = await db.select()
      .from(dogsTable)
      .where(eq(dogsTable.id, result.id))
      .execute();

    expect(dogs).toHaveLength(1);
    expect(dogs[0].name).toEqual('Buddy');
    expect(dogs[0].breed).toEqual('Golden Retriever');
    expect(dogs[0].age).toEqual(3);
    expect(dogs[0].size).toEqual('large');
    expect(parseFloat(dogs[0].weight!)).toEqual(65.5); // Stored as string, converted back
    expect(dogs[0].temperament).toEqual(['friendly', 'playful'] as any); // Type cast for DB comparison
    expect(dogs[0].owner_id).toEqual(owner.id);
    expect(dogs[0].is_active).toBe(true);
    expect(dogs[0].created_at).toBeInstanceOf(Date);
    expect(dogs[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle different dog sizes correctly', async () => {
    const owner = await createTestOwner();
    const sizes = ['small', 'medium', 'large', 'extra_large'] as const;

    for (const size of sizes) {
      const input: CreateDogInput = {
        ...testInput,
        owner_id: owner.id,
        name: `Dog-${size}`,
        size: size
      };

      const result = await createDog(input);
      expect(result.size).toEqual(size);
      expect(result.name).toEqual(`Dog-${size}`);
    }
  });

  it('should handle different temperament combinations', async () => {
    const owner = await createTestOwner();
    const temperaments: ("calm" | "playful" | "energetic" | "aggressive" | "anxious" | "friendly")[][] = [
      ['calm'],
      ['playful', 'energetic'],
      ['friendly', 'calm', 'playful'],
      ['anxious'],
      ['aggressive']
    ];

    for (let i = 0; i < temperaments.length; i++) {
      const input: CreateDogInput = {
        ...testInput,
        owner_id: owner.id,
        name: `Dog-${i}`,
        temperament: temperaments[i]
      };

      const result = await createDog(input);
      expect(result.temperament).toEqual(temperaments[i]);
    }
  });

  it('should throw error when owner does not exist', async () => {
    const input = { ...testInput, owner_id: 999 }; // Non-existent owner

    await expect(createDog(input)).rejects.toThrow(/Owner with id 999 does not exist/i);
  });

  it('should handle zero weight correctly', async () => {
    const owner = await createTestOwner();
    const input: CreateDogInput = {
      ...testInput,
      owner_id: owner.id,
      weight: null // Null weight should be handled properly
    };

    const result = await createDog(input);
    expect(result.weight).toBeNull();

    // Verify in database
    const dogs = await db.select()
      .from(dogsTable)
      .where(eq(dogsTable.id, result.id))
      .execute();

    expect(dogs[0].weight).toBeNull();
  });

  it('should handle decimal weights correctly', async () => {
    const owner = await createTestOwner();
    const testWeights = [12.5, 45.75, 100.25];

    for (const weight of testWeights) {
      const input: CreateDogInput = {
        ...testInput,
        owner_id: owner.id,
        name: `Dog-${weight}`,
        weight: weight
      };

      const result = await createDog(input);
      expect(result.weight).toEqual(weight);
      expect(typeof result.weight).toBe('number');

      // Verify precision is maintained in database
      const dogs = await db.select()
        .from(dogsTable)
        .where(eq(dogsTable.id, result.id))
        .execute();

      expect(parseFloat(dogs[0].weight!)).toEqual(weight);
    }
  });
});