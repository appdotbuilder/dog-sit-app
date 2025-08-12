import { db } from '../db';
import { dogsTable } from '../db/schema';
import { type UpdateDogInput, type Dog } from '../schema';
import { eq } from 'drizzle-orm';

export const updateDog = async (input: UpdateDogInput): Promise<Dog> => {
  try {
    // First, check if the dog exists
    const existingDog = await db.select()
      .from(dogsTable)
      .where(eq(dogsTable.id, input.id))
      .execute();

    if (existingDog.length === 0) {
      throw new Error(`Dog with ID ${input.id} not found`);
    }

    // Prepare update data, filtering out undefined values
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.breed !== undefined) {
      updateData.breed = input.breed;
    }
    if (input.age !== undefined) {
      updateData.age = input.age;
    }
    if (input.size !== undefined) {
      updateData.size = input.size;
    }
    if (input.weight !== undefined) {
      updateData.weight = input.weight ? input.weight.toString() : null;
    }
    if (input.temperament !== undefined) {
      updateData.temperament = input.temperament;
    }
    if (input.medical_notes !== undefined) {
      updateData.medical_notes = input.medical_notes;
    }
    if (input.special_instructions !== undefined) {
      updateData.special_instructions = input.special_instructions;
    }
    if (input.profile_image_url !== undefined) {
      updateData.profile_image_url = input.profile_image_url;
    }
    if (input.is_active !== undefined) {
      updateData.is_active = input.is_active;
    }

    // Update the dog record
    const result = await db.update(dogsTable)
      .set(updateData)
      .where(eq(dogsTable.id, input.id))
      .returning()
      .execute();

    // Convert numeric fields back to numbers and ensure proper typing
    const updatedDog = result[0];
    return {
      ...updatedDog,
      weight: updatedDog.weight ? parseFloat(updatedDog.weight) : null,
      temperament: updatedDog.temperament as ('calm' | 'playful' | 'energetic' | 'aggressive' | 'anxious' | 'friendly')[]
    };
  } catch (error) {
    console.error('Dog update failed:', error);
    throw error;
  }
};