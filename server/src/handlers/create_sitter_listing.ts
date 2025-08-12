import { db } from '../db';
import { sitterListingsTable, usersTable } from '../db/schema';
import { type CreateSitterListingInput, type SitterListing } from '../schema';
import { eq } from 'drizzle-orm';

export const createSitterListing = async (input: CreateSitterListingInput): Promise<SitterListing> => {
  try {
    // Validate that the user exists and has sitter role permissions
    const user = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, input.sitter_id))
      .execute();

    if (user.length === 0) {
      throw new Error('User not found');
    }

    if (user[0].role !== 'sitter' && user[0].role !== 'both') {
      throw new Error('User does not have sitter role permissions');
    }

    // Insert sitter listing record
    const result = await db.insert(sitterListingsTable)
      .values({
        sitter_id: input.sitter_id,
        title: input.title,
        description: input.description,
        services_offered: input.services_offered,
        price_per_hour: input.price_per_hour.toString(), // Convert number to string for numeric column
        price_per_day: input.price_per_day ? input.price_per_day.toString() : null,
        price_per_night: input.price_per_night ? input.price_per_night.toString() : null,
        max_dogs: input.max_dogs,
        accepts_sizes: input.accepts_sizes,
        location: input.location,
        radius_km: input.radius_km.toString(), // Convert number to string for numeric column
        experience_years: input.experience_years,
        has_yard: input.has_yard,
        has_insurance: input.has_insurance,
        emergency_contact: input.emergency_contact
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const listing = result[0];
    return {
      ...listing,
      price_per_hour: parseFloat(listing.price_per_hour), // Convert string back to number
      price_per_day: listing.price_per_day ? parseFloat(listing.price_per_day) : null,
      price_per_night: listing.price_per_night ? parseFloat(listing.price_per_night) : null,
      radius_km: parseFloat(listing.radius_km), // Convert string back to number
      services_offered: listing.services_offered as ('dog_walking' | 'pet_sitting' | 'daycare' | 'overnight_care' | 'grooming')[], // Type assertion for enum arrays
      accepts_sizes: listing.accepts_sizes as ('small' | 'medium' | 'large' | 'extra_large')[] // Type assertion for enum arrays
    };
  } catch (error) {
    console.error('Sitter listing creation failed:', error);
    throw error;
  }
};