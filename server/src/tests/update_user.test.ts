import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type UpdateUserInput } from '../schema';
import { updateUser } from '../handlers/update_user';
import { eq } from 'drizzle-orm';

describe('updateUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create a test user
  const createTestUser = async () => {
    const result = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashed_password',
        first_name: 'Original',
        last_name: 'User',
        phone: '123-456-7890',
        role: 'owner',
        location: 'Original City',
        bio: 'Original bio'
      })
      .returning()
      .execute();

    return result[0];
  };

  it('should update user fields successfully', async () => {
    // Create a test user
    const testUser = await createTestUser();

    const updateInput: UpdateUserInput = {
      id: testUser.id,
      first_name: 'Updated',
      last_name: 'Name',
      phone: '987-654-3210',
      location: 'New City',
      bio: 'Updated bio'
    };

    const result = await updateUser(updateInput);

    // Verify the updated fields
    expect(result.id).toEqual(testUser.id);
    expect(result.first_name).toEqual('Updated');
    expect(result.last_name).toEqual('Name');
    expect(result.phone).toEqual('987-654-3210');
    expect(result.location).toEqual('New City');
    expect(result.bio).toEqual('Updated bio');
    
    // Verify unchanged fields remain the same
    expect(result.email).toEqual('test@example.com');
    expect(result.password_hash).toEqual('hashed_password');
    expect(result.role).toEqual('owner');
    
    // Verify timestamps
    expect(result.created_at).toEqual(testUser.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(testUser.updated_at.getTime());
  });

  it('should update only provided fields', async () => {
    // Create a test user
    const testUser = await createTestUser();

    const updateInput: UpdateUserInput = {
      id: testUser.id,
      first_name: 'PartialUpdate'
      // Only updating first_name, other fields should remain unchanged
    };

    const result = await updateUser(updateInput);

    // Verify only first_name was updated
    expect(result.first_name).toEqual('PartialUpdate');
    expect(result.last_name).toEqual('User'); // Should remain unchanged
    expect(result.phone).toEqual('123-456-7890'); // Should remain unchanged
    expect(result.location).toEqual('Original City'); // Should remain unchanged
    expect(result.bio).toEqual('Original bio'); // Should remain unchanged
  });

  it('should handle null values correctly', async () => {
    // Create a test user
    const testUser = await createTestUser();

    const updateInput: UpdateUserInput = {
      id: testUser.id,
      phone: null,
      profile_image_url: null,
      location: null,
      bio: null
    };

    const result = await updateUser(updateInput);

    // Verify null values are set correctly
    expect(result.phone).toBeNull();
    expect(result.profile_image_url).toBeNull();
    expect(result.location).toBeNull();
    expect(result.bio).toBeNull();
    
    // Verify other fields remain unchanged
    expect(result.first_name).toEqual('Original');
    expect(result.last_name).toEqual('User');
  });

  it('should update profile_image_url when provided', async () => {
    // Create a test user
    const testUser = await createTestUser();

    const updateInput: UpdateUserInput = {
      id: testUser.id,
      profile_image_url: 'https://example.com/new-image.jpg'
    };

    const result = await updateUser(updateInput);

    expect(result.profile_image_url).toEqual('https://example.com/new-image.jpg');
  });

  it('should save changes to database', async () => {
    // Create a test user
    const testUser = await createTestUser();

    const updateInput: UpdateUserInput = {
      id: testUser.id,
      first_name: 'DatabaseTest',
      bio: 'Verified in database'
    };

    await updateUser(updateInput);

    // Query database directly to verify changes were persisted
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, testUser.id))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].first_name).toEqual('DatabaseTest');
    expect(users[0].bio).toEqual('Verified in database');
    expect(users[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when user not found', async () => {
    const updateInput: UpdateUserInput = {
      id: 99999, // Non-existent user ID
      first_name: 'NotFound'
    };

    expect(updateUser(updateInput)).rejects.toThrow(/User with id 99999 not found/i);
  });

  it('should handle empty update gracefully', async () => {
    // Create a test user
    const testUser = await createTestUser();

    const updateInput: UpdateUserInput = {
      id: testUser.id
      // No fields to update except id
    };

    const result = await updateUser(updateInput);

    // Should still return the user with updated timestamp
    expect(result.id).toEqual(testUser.id);
    expect(result.first_name).toEqual('Original'); // Unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(testUser.updated_at.getTime());
  });

  it('should handle all fields being updated at once', async () => {
    // Create a test user
    const testUser = await createTestUser();

    const updateInput: UpdateUserInput = {
      id: testUser.id,
      first_name: 'AllFields',
      last_name: 'Updated',
      phone: '555-0123',
      profile_image_url: 'https://example.com/profile.jpg',
      location: 'Complete City',
      bio: 'Everything updated'
    };

    const result = await updateUser(updateInput);

    expect(result.first_name).toEqual('AllFields');
    expect(result.last_name).toEqual('Updated');
    expect(result.phone).toEqual('555-0123');
    expect(result.profile_image_url).toEqual('https://example.com/profile.jpg');
    expect(result.location).toEqual('Complete City');
    expect(result.bio).toEqual('Everything updated');
    expect(result.updated_at).toBeInstanceOf(Date);
  });
});