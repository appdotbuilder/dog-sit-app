import { db } from '../db';
import { sitterListingsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type UpdateSitterListingInput, type SitterListing } from '../schema';

export const updateSitterListing = async (input: UpdateSitterListingInput): Promise<SitterListing> => {
  try {
    // Build update values object, only including fields that are provided
    const updateValues: any = {};
    
    if (input.title !== undefined) updateValues.title = input.title;
    if (input.description !== undefined) updateValues.description = input.description;
    if (input.services_offered !== undefined) updateValues.services_offered = input.services_offered;
    if (input.price_per_hour !== undefined) updateValues.price_per_hour = input.price_per_hour.toString();
    if (input.price_per_day !== undefined) updateValues.price_per_day = input.price_per_day ? input.price_per_day.toString() : null;
    if (input.price_per_night !== undefined) updateValues.price_per_night = input.price_per_night ? input.price_per_night.toString() : null;
    if (input.max_dogs !== undefined) updateValues.max_dogs = input.max_dogs;
    if (input.accepts_sizes !== undefined) updateValues.accepts_sizes = input.accepts_sizes;
    if (input.location !== undefined) updateValues.location = input.location;
    if (input.radius_km !== undefined) updateValues.radius_km = input.radius_km.toString();
    if (input.experience_years !== undefined) updateValues.experience_years = input.experience_years;
    if (input.has_yard !== undefined) updateValues.has_yard = input.has_yard;
    if (input.has_insurance !== undefined) updateValues.has_insurance = input.has_insurance;
    if (input.emergency_contact !== undefined) updateValues.emergency_contact = input.emergency_contact;
    if (input.is_active !== undefined) updateValues.is_active = input.is_active;
    
    // Always update the updated_at timestamp
    updateValues.updated_at = new Date();

    // Update the sitter listing
    const result = await db.update(sitterListingsTable)
      .set(updateValues)
      .where(eq(sitterListingsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Sitter listing with id ${input.id} not found`);
    }

    // Convert numeric fields back to numbers before returning
    const listing = result[0];
    return {
      ...listing,
      price_per_hour: parseFloat(listing.price_per_hour),
      price_per_day: listing.price_per_day ? parseFloat(listing.price_per_day) : null,
      price_per_night: listing.price_per_night ? parseFloat(listing.price_per_night) : null,
      radius_km: parseFloat(listing.radius_km),
      services_offered: listing.services_offered as any,
      accepts_sizes: listing.accepts_sizes as any
    };
  } catch (error) {
    console.error('Sitter listing update failed:', error);
    throw error;
  }
};