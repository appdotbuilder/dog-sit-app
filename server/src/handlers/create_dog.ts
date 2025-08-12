import { db } from '../db';
import { dogsTable, usersTable } from '../db/schema';
import { type CreateDogInput, type Dog } from '../schema';
import { eq } from 'drizzle-orm';

export const createDog = async (input: CreateDogInput): Promise<Dog> => {
  try {
    // Validate that the owner exists
    const owner = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.owner_id))
      .execute();

    if (owner.length === 0) {
      throw new Error(`Owner with id ${input.owner_id} does not exist`);
    }

    // Insert dog record
    const result = await db.insert(dogsTable)
      .values({
        owner_id: input.owner_id,
        name: input.name,
        breed: input.breed,
        age: input.age,
        size: input.size,
        weight: input.weight ? input.weight.toString() : null, // Convert number to string for numeric column
        temperament: input.temperament, // JSON array stored directly
        medical_notes: input.medical_notes,
        special_instructions: input.special_instructions,
        profile_image_url: input.profile_image_url,
        is_active: true // Default value for new dogs
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers and cast temperament type
    const dog = result[0];
    return {
      ...dog,
      weight: dog.weight ? parseFloat(dog.weight) : null, // Convert string back to number
      temperament: dog.temperament as ("calm" | "playful" | "energetic" | "aggressive" | "anxious" | "friendly")[] // Type cast for temperament
    };
  } catch (error) {
    console.error('Dog creation failed:', error);
    throw error;
  }
};