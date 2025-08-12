import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { pbkdf2Sync } from 'crypto';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { createUser } from '../handlers/create_user';
import { eq } from 'drizzle-orm';

// Helper function to verify password hash
const verifyPassword = (password: string, hashedPassword: string): boolean => {
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
};

// Complete test input
const testInput: CreateUserInput = {
  email: 'test@example.com',
  password: 'password123',
  first_name: 'John',
  last_name: 'Doe',
  phone: '+1234567890',
  role: 'owner',
  location: 'New York, NY',
  bio: 'Dog lover and responsible pet owner'
};

describe('createUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a user with hashed password', async () => {
    const result = await createUser(testInput);

    // Basic field validation
    expect(result.email).toEqual('test@example.com');
    expect(result.first_name).toEqual('John');
    expect(result.last_name).toEqual('Doe');
    expect(result.phone).toEqual('+1234567890');
    expect(result.role).toEqual('owner');
    expect(result.location).toEqual('New York, NY');
    expect(result.bio).toEqual('Dog lover and responsible pet owner');
    expect(result.profile_image_url).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    
    // Password should be hashed, not plain text
    expect(result.password_hash).not.toEqual('password123');
    expect(result.password_hash).toContain(':'); // Our format is salt:hash
    expect(result.password_hash.length).toBeGreaterThan(100); // Should be long due to salt + hash
    
    // Verify password hash is valid
    const isValidPassword = verifyPassword('password123', result.password_hash);
    expect(isValidPassword).toBe(true);
  });

  it('should save user to database correctly', async () => {
    const result = await createUser(testInput);

    // Query using proper drizzle syntax
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users).toHaveLength(1);
    const dbUser = users[0];
    
    expect(dbUser.email).toEqual('test@example.com');
    expect(dbUser.first_name).toEqual('John');
    expect(dbUser.last_name).toEqual('Doe');
    expect(dbUser.phone).toEqual('+1234567890');
    expect(dbUser.role).toEqual('owner');
    expect(dbUser.location).toEqual('New York, NY');
    expect(dbUser.bio).toEqual('Dog lover and responsible pet owner');
    expect(dbUser.created_at).toBeInstanceOf(Date);
    expect(dbUser.updated_at).toBeInstanceOf(Date);
    
    // Verify password can be validated
    const isValidPassword = verifyPassword('password123', dbUser.password_hash);
    expect(isValidPassword).toBe(true);
  });

  it('should handle user with minimal data (nullable fields)', async () => {
    const minimalInput: CreateUserInput = {
      email: 'minimal@example.com',
      password: 'password123',
      first_name: 'Jane',
      last_name: 'Smith',
      phone: null,
      role: 'sitter',
      location: null,
      bio: null
    };

    const result = await createUser(minimalInput);

    expect(result.email).toEqual('minimal@example.com');
    expect(result.first_name).toEqual('Jane');
    expect(result.last_name).toEqual('Smith');
    expect(result.phone).toBeNull();
    expect(result.role).toEqual('sitter');
    expect(result.location).toBeNull();
    expect(result.bio).toBeNull();
    expect(result.profile_image_url).toBeNull();
    expect(result.id).toBeDefined();
  });

  it('should handle different user roles correctly', async () => {
    const roles = ['owner', 'sitter', 'both'] as const;
    
    for (const role of roles) {
      const input: CreateUserInput = {
        ...testInput,
        email: `${role}@example.com`,
        role: role
      };
      
      const result = await createUser(input);
      expect(result.role).toEqual(role);
      expect(result.email).toEqual(`${role}@example.com`);
    }
  });

  it('should fail when email already exists', async () => {
    // Create first user
    await createUser(testInput);

    // Try to create second user with same email
    const duplicateInput: CreateUserInput = {
      ...testInput,
      first_name: 'Different',
      last_name: 'Person'
    };

    await expect(createUser(duplicateInput)).rejects.toThrow(/duplicate key value violates unique constraint|UNIQUE constraint failed/i);
  });

  it('should create unique password hashes for same password', async () => {
    const input1: CreateUserInput = {
      ...testInput,
      email: 'user1@example.com'
    };
    
    const input2: CreateUserInput = {
      ...testInput,
      email: 'user2@example.com'
    };

    const user1 = await createUser(input1);
    const user2 = await createUser(input2);

    // Same password should produce different hashes (due to salt)
    expect(user1.password_hash).not.toEqual(user2.password_hash);
    
    // Both should validate correctly
    const isValid1 = verifyPassword('password123', user1.password_hash);
    const isValid2 = verifyPassword('password123', user2.password_hash);
    expect(isValid1).toBe(true);
    expect(isValid2).toBe(true);
  });

  it('should set timestamps correctly', async () => {
    const beforeCreate = new Date();
    const result = await createUser(testInput);
    const afterCreate = new Date();

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at >= beforeCreate).toBe(true);
    expect(result.created_at <= afterCreate).toBe(true);
    expect(result.updated_at >= beforeCreate).toBe(true);
    expect(result.updated_at <= afterCreate).toBe(true);
  });

  it('should reject incorrect password verification', async () => {
    const result = await createUser(testInput);
    
    // Correct password should work
    const isValidCorrect = verifyPassword('password123', result.password_hash);
    expect(isValidCorrect).toBe(true);
    
    // Wrong password should fail
    const isValidWrong = verifyPassword('wrongpassword', result.password_hash);
    expect(isValidWrong).toBe(false);
  });
});