import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { getUser } from '../handlers/get_user';

// Test user data
const testUser = {
  email: 'john.doe@example.com',
  password_hash: 'hashed_password_123',
  first_name: 'John',
  last_name: 'Doe',
  phone: '+1234567890',
  profile_image_url: 'https://example.com/profile.jpg',
  role: 'owner' as const,
  location: 'New York, NY',
  bio: 'Dog lover and experienced pet owner'
};

describe('getUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should retrieve an existing user by id', async () => {
    // Create test user
    const [insertedUser] = await db.insert(usersTable)
      .values(testUser)
      .returning()
      .execute();

    const result = await getUser(insertedUser.id);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(insertedUser.id);
    expect(result!.email).toEqual('john.doe@example.com');
    expect(result!.first_name).toEqual('John');
    expect(result!.last_name).toEqual('Doe');
    expect(result!.phone).toEqual('+1234567890');
    expect(result!.profile_image_url).toEqual('https://example.com/profile.jpg');
    expect(result!.role).toEqual('owner');
    expect(result!.location).toEqual('New York, NY');
    expect(result!.bio).toEqual('Dog lover and experienced pet owner');
    expect(result!.password_hash).toEqual('hashed_password_123');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent user', async () => {
    const result = await getUser(999);

    expect(result).toBeNull();
  });

  it('should handle user with minimal fields', async () => {
    // Create user with only required fields
    const minimalUser = {
      email: 'minimal@example.com',
      password_hash: 'simple_hashed_password',
      first_name: 'Min',
      last_name: 'User',
      phone: null,
      profile_image_url: null,
      role: 'sitter' as const,
      location: null,
      bio: null
    };

    const [insertedUser] = await db.insert(usersTable)
      .values(minimalUser)
      .returning()
      .execute();

    const result = await getUser(insertedUser.id);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(insertedUser.id);
    expect(result!.email).toEqual('minimal@example.com');
    expect(result!.first_name).toEqual('Min');
    expect(result!.last_name).toEqual('User');
    expect(result!.phone).toBeNull();
    expect(result!.profile_image_url).toBeNull();
    expect(result!.role).toEqual('sitter');
    expect(result!.location).toBeNull();
    expect(result!.bio).toBeNull();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should handle all user role types', async () => {
    const users = [
      { ...testUser, email: 'owner@example.com', role: 'owner' as const },
      { ...testUser, email: 'sitter@example.com', role: 'sitter' as const },
      { ...testUser, email: 'both@example.com', role: 'both' as const }
    ];

    // Create users with different roles
    const insertedUsers = await db.insert(usersTable)
      .values(users)
      .returning()
      .execute();

    // Verify each role is preserved
    for (const insertedUser of insertedUsers) {
      const result = await getUser(insertedUser.id);
      expect(result).not.toBeNull();
      expect(result!.role).toEqual(insertedUser.role);
    }
  });

  it('should retrieve user with special characters in fields', async () => {
    const specialUser = {
      ...testUser,
      email: 'special+chars@test-domain.co.uk',
      first_name: "John-Paul",
      last_name: "O'Connor",
      location: "São Paulo, Brazil",
      bio: "I love dogs! 🐕 My bio includes émojis & spécial chars: @#$%"
    };

    const [insertedUser] = await db.insert(usersTable)
      .values(specialUser)
      .returning()
      .execute();

    const result = await getUser(insertedUser.id);

    expect(result).not.toBeNull();
    expect(result!.email).toEqual('special+chars@test-domain.co.uk');
    expect(result!.first_name).toEqual("John-Paul");
    expect(result!.last_name).toEqual("O'Connor");
    expect(result!.location).toEqual("São Paulo, Brazil");
    expect(result!.bio).toEqual("I love dogs! 🐕 My bio includes émojis & spécial chars: @#$%");
  });
});