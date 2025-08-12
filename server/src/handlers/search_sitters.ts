import { db } from '../db';
import { sitterListingsTable } from '../db/schema';
import { type SearchSittersInput, type SitterListing, type ServiceType, type DogSize } from '../schema';
import { eq, gte, lte, and, type SQL } from 'drizzle-orm';

export const searchSitters = async (input: SearchSittersInput): Promise<SitterListing[]> => {
  try {
    // Build conditions array
    const conditions: SQL<unknown>[] = [
      eq(sitterListingsTable.is_active, true)
    ];

    // Filter by location (exact match for now - in production would use geographic search)
    if (input.location) {
      conditions.push(eq(sitterListingsTable.location, input.location));
    }

    // Filter by radius (must be within the sitter's service radius)
    if (input.radius_km !== undefined) {
      conditions.push(gte(sitterListingsTable.radius_km, input.radius_km.toString()));
    }

    // Filter by maximum price per hour
    if (input.max_price_per_hour !== undefined) {
      conditions.push(lte(sitterListingsTable.price_per_hour, input.max_price_per_hour.toString()));
    }

    // Filter by yard requirement
    if (input.has_yard !== undefined) {
      conditions.push(eq(sitterListingsTable.has_yard, input.has_yard));
    }

    // Filter by insurance requirement
    if (input.has_insurance !== undefined) {
      conditions.push(eq(sitterListingsTable.has_insurance, input.has_insurance));
    }

    // Filter by minimum experience years
    if (input.min_experience_years !== undefined) {
      conditions.push(gte(sitterListingsTable.experience_years, input.min_experience_years));
    }

    // Build and execute query
    const results = conditions.length > 0
      ? await db.select()
          .from(sitterListingsTable)
          .where(conditions.length === 1 ? conditions[0] : and(...conditions))
          .execute()
      : await db.select()
          .from(sitterListingsTable)
          .execute();

    // Convert numeric fields and filter by service type and dog size after retrieval
    // (since these are stored as JSONB arrays)
    return results
      .map(listing => ({
        ...listing,
        price_per_hour: parseFloat(listing.price_per_hour),
        price_per_day: listing.price_per_day ? parseFloat(listing.price_per_day) : null,
        price_per_night: listing.price_per_night ? parseFloat(listing.price_per_night) : null,
        radius_km: parseFloat(listing.radius_km),
        services_offered: listing.services_offered as ServiceType[],
        accepts_sizes: listing.accepts_sizes as DogSize[]
      }))
      .filter(listing => {
        // Filter by service type if specified
        if (input.service_type) {
          if (!listing.services_offered.includes(input.service_type)) {
            return false;
          }
        }

        // Filter by dog size if specified
        if (input.dog_size) {
          if (!listing.accepts_sizes.includes(input.dog_size)) {
            return false;
          }
        }

        return true;
      });
  } catch (error) {
    console.error('Sitter search failed:', error);
    throw error;
  }
};