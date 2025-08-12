import { db } from '../db';
import { dogsTable } from '../db/schema';
import { type Dog } from '../schema';
import { eq, and } from 'drizzle-orm';

export const getDogsByOwner = async (ownerId: number): Promise<Dog[]> => {
  try {
    const results = await db.select()
      .from(dogsTable)
      .where(and(
        eq(dogsTable.owner_id, ownerId),
        eq(dogsTable.is_active, true)
      ))
      .execute();

    // Convert numeric fields back to numbers and ensure proper type conversion
    return results.map(dog => ({
      ...dog,
      weight: dog.weight ? parseFloat(dog.weight) : null,
      temperament: dog.temperament as ("calm" | "playful" | "energetic" | "aggressive" | "anxious" | "friendly")[]
    }));
  } catch (error) {
    console.error('Failed to fetch dogs by owner:', error);
    throw error;
  }
};