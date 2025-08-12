import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, dogsTable } from '../db/schema';
import { type UpdateDogInput } from '../schema';
import { updateDog } from '../handlers/update_dog';
import { eq } from 'drizzle-orm';

// Helper function to create a test user
const createTestUser = async () => {
  const result = await db.insert(usersTable)
    .values({
      email: 'owner@test.com',
      password_hash: 'hashedpassword',
      first_name: 'John',
      last_name: 'Doe',
      role: 'owner'
    })
    .returning()
    .execute();
  return result[0];
};

// Helper function to create a test dog
const createTestDog = async (ownerId: number) => {
  const result = await db.insert(dogsTable)
    .values({
      owner_id: ownerId,
      name: 'Buddy',
      breed: 'Golden Retriever',
      age: 3,
      size: 'large',
      weight: '30.5',
      temperament: ['friendly', 'playful'],
      medical_notes: 'No known allergies',
      special_instructions: 'Loves treats',
      is_active: true
    })
    .returning()
    .execute();
  
  return {
    ...result[0],
    weight: result[0].weight ? parseFloat(result[0].weight) : null
  };
};

describe('updateDog', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update basic dog information', async () => {
    const user = await createTestUser();
    const dog = await createTestDog(user.id);

    const updateInput: UpdateDogInput = {
      id: dog.id,
      name: 'Max',
      age: 4,
      breed: 'Labrador'
    };

    const result = await updateDog(updateInput);

    expect(result.id).toEqual(dog.id);
    expect(result.owner_id).toEqual(user.id);
    expect(result.name).toEqual('Max');
    expect(result.age).toEqual(4);
    expect(result.breed).toEqual('Labrador');
    expect(result.size).toEqual('large'); // Should remain unchanged
    expect(result.weight).toEqual(30.5); // Should remain unchanged
    expect(result.temperament).toEqual(['friendly', 'playful']); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update weight with numeric conversion', async () => {
    const user = await createTestUser();
    const dog = await createTestDog(user.id);

    const updateInput: UpdateDogInput = {
      id: dog.id,
      weight: 25.8
    };

    const result = await updateDog(updateInput);

    expect(result.weight).toEqual(25.8);
    expect(typeof result.weight).toBe('number');
  });

  it('should set weight to null when provided', async () => {
    const user = await createTestUser();
    const dog = await createTestDog(user.id);

    const updateInput: UpdateDogInput = {
      id: dog.id,
      weight: null
    };

    const result = await updateDog(updateInput);

    expect(result.weight).toBeNull();
  });

  it('should update temperament array', async () => {
    const user = await createTestUser();
    const dog = await createTestDog(user.id);

    const updateInput: UpdateDogInput = {
      id: dog.id,
      temperament: ['calm', 'energetic']
    };

    const result = await updateDog(updateInput);

    expect(result.temperament).toEqual(['calm', 'energetic']);
  });

  it('should update size and activity status', async () => {
    const user = await createTestUser();
    const dog = await createTestDog(user.id);

    const updateInput: UpdateDogInput = {
      id: dog.id,
      size: 'medium',
      is_active: false
    };

    const result = await updateDog(updateInput);

    expect(result.size).toEqual('medium');
    expect(result.is_active).toBe(false);
  });

  it('should update nullable fields to null', async () => {
    const user = await createTestUser();
    const dog = await createTestDog(user.id);

    const updateInput: UpdateDogInput = {
      id: dog.id,
      breed: null,
      medical_notes: null,
      special_instructions: null,
      profile_image_url: null
    };

    const result = await updateDog(updateInput);

    expect(result.breed).toBeNull();
    expect(result.medical_notes).toBeNull();
    expect(result.special_instructions).toBeNull();
    expect(result.profile_image_url).toBeNull();
  });

  it('should update profile image URL', async () => {
    const user = await createTestUser();
    const dog = await createTestDog(user.id);

    const updateInput: UpdateDogInput = {
      id: dog.id,
      profile_image_url: 'https://example.com/new-dog-photo.jpg'
    };

    const result = await updateDog(updateInput);

    expect(result.profile_image_url).toEqual('https://example.com/new-dog-photo.jpg');
  });

  it('should persist changes to database', async () => {
    const user = await createTestUser();
    const dog = await createTestDog(user.id);

    const updateInput: UpdateDogInput = {
      id: dog.id,
      name: 'Charlie',
      age: 5,
      weight: 35.2
    };

    await updateDog(updateInput);

    // Query database directly to verify persistence
    const dogs = await db.select()
      .from(dogsTable)
      .where(eq(dogsTable.id, dog.id))
      .execute();

    expect(dogs).toHaveLength(1);
    expect(dogs[0].name).toEqual('Charlie');
    expect(dogs[0].age).toEqual(5);
    expect(parseFloat(dogs[0].weight!)).toEqual(35.2);
    expect(dogs[0].updated_at).toBeInstanceOf(Date);
  });

  it('should only update provided fields', async () => {
    const user = await createTestUser();
    const dog = await createTestDog(user.id);

    const updateInput: UpdateDogInput = {
      id: dog.id,
      name: 'Luna'
    };

    const result = await updateDog(updateInput);

    // Only name should change, everything else should remain the same
    expect(result.name).toEqual('Luna');
    expect(result.breed).toEqual('Golden Retriever');
    expect(result.age).toEqual(3);
    expect(result.size).toEqual('large');
    expect(result.weight).toEqual(30.5);
    expect(result.temperament).toEqual(['friendly', 'playful']);
    expect(result.medical_notes).toEqual('No known allergies');
    expect(result.special_instructions).toEqual('Loves treats');
    expect(result.is_active).toBe(true);
  });

  it('should throw error when dog does not exist', async () => {
    const updateInput: UpdateDogInput = {
      id: 999,
      name: 'NonExistent'
    };

    expect(updateDog(updateInput)).rejects.toThrow(/Dog with ID 999 not found/i);
  });

  it('should handle all dog sizes correctly', async () => {
    const user = await createTestUser();
    const dog = await createTestDog(user.id);

    const sizes = ['small', 'medium', 'large', 'extra_large'] as const;

    for (const size of sizes) {
      const updateInput: UpdateDogInput = {
        id: dog.id,
        size: size
      };

      const result = await updateDog(updateInput);
      expect(result.size).toEqual(size);
    }
  });

  it('should handle complex update with multiple fields', async () => {
    const user = await createTestUser();
    const dog = await createTestDog(user.id);

    const updateInput: UpdateDogInput = {
      id: dog.id,
      name: 'Rex',
      breed: 'German Shepherd',
      age: 6,
      size: 'extra_large',
      weight: 45.7,
      temperament: ['calm', 'aggressive'],
      medical_notes: 'Hip dysplasia',
      special_instructions: 'Needs daily medication',
      profile_image_url: 'https://example.com/rex.jpg',
      is_active: false
    };

    const result = await updateDog(updateInput);

    expect(result.name).toEqual('Rex');
    expect(result.breed).toEqual('German Shepherd');
    expect(result.age).toEqual(6);
    expect(result.size).toEqual('extra_large');
    expect(result.weight).toEqual(45.7);
    expect(result.temperament).toEqual(['calm', 'aggressive']);
    expect(result.medical_notes).toEqual('Hip dysplasia');
    expect(result.special_instructions).toEqual('Needs daily medication');
    expect(result.profile_image_url).toEqual('https://example.com/rex.jpg');
    expect(result.is_active).toBe(false);
    expect(result.updated_at).toBeInstanceOf(Date);
  });
});