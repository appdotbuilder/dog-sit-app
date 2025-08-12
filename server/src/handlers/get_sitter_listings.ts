import { db } from '../db';
import { sitterListingsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type SitterListing } from '../schema';

export const getSitterListings = async (sitterId: number): Promise<SitterListing[]> => {
  try {
    // Query all listings for the specific sitter (active and inactive)
    const results = await db.select()
      .from(sitterListingsTable)
      .where(eq(sitterListingsTable.sitter_id, sitterId))
      .execute();

    // Convert numeric fields back to numbers and cast JSONB arrays to proper types for API response
    return results.map(listing => ({
      ...listing,
      price_per_hour: parseFloat(listing.price_per_hour),
      price_per_day: listing.price_per_day ? parseFloat(listing.price_per_day) : null,
      price_per_night: listing.price_per_night ? parseFloat(listing.price_per_night) : null,
      radius_km: parseFloat(listing.radius_km),
      services_offered: listing.services_offered as ('dog_walking' | 'pet_sitting' | 'daycare' | 'overnight_care' | 'grooming')[],
      accepts_sizes: listing.accepts_sizes as ('small' | 'medium' | 'large' | 'extra_large')[]
    }));
  } catch (error) {
    console.error('Failed to fetch sitter listings:', error);
    throw error;
  }
};