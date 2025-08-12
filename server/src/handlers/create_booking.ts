import { db } from '../db';
import { bookingsTable, usersTable, dogsTable, sitterListingsTable } from '../db/schema';
import { type CreateBookingInput, type Booking } from '../schema';
import { eq } from 'drizzle-orm';

export const createBooking = async (input: CreateBookingInput): Promise<Booking> => {
  try {
    // Validate that all referenced entities exist
    const [owner, sitter, dog, listing] = await Promise.all([
      db.select().from(usersTable).where(eq(usersTable.id, input.owner_id)).execute(),
      db.select().from(usersTable).where(eq(usersTable.id, input.sitter_id)).execute(),
      db.select().from(dogsTable).where(eq(dogsTable.id, input.dog_id)).execute(),
      db.select().from(sitterListingsTable).where(eq(sitterListingsTable.id, input.listing_id)).execute()
    ]);

    if (owner.length === 0) {
      throw new Error('Owner not found');
    }
    if (sitter.length === 0) {
      throw new Error('Sitter not found');
    }
    if (dog.length === 0) {
      throw new Error('Dog not found');
    }
    if (listing.length === 0) {
      throw new Error('Listing not found');
    }

    // Validate that the dog belongs to the owner
    if (dog[0].owner_id !== input.owner_id) {
      throw new Error('Dog does not belong to the specified owner');
    }

    // Validate that the listing belongs to the sitter
    if (listing[0].sitter_id !== input.sitter_id) {
      throw new Error('Listing does not belong to the specified sitter');
    }

    // Calculate booking duration and pricing
    const startTime = input.start_date.getTime();
    const endTime = input.end_date.getTime();
    const totalHours = (endTime - startTime) / (1000 * 60 * 60);
    const totalDays = Math.ceil(totalHours / 24);

    let totalPrice = 0;
    let calculatedHours: number | null = null;
    let calculatedDays: number | null = null;

    // Calculate price based on service type
    const listingData = listing[0];
    switch (input.service_type) {
      case 'dog_walking':
      case 'grooming':
        // Hourly services
        calculatedHours = totalHours;
        totalPrice = totalHours * parseFloat(listingData.price_per_hour);
        break;
      case 'daycare':
        // Daily service
        if (listingData.price_per_day) {
          calculatedDays = totalDays;
          totalPrice = totalDays * parseFloat(listingData.price_per_day);
        } else {
          // Fallback to hourly rate if no daily rate
          calculatedHours = totalHours;
          totalPrice = totalHours * parseFloat(listingData.price_per_hour);
        }
        break;
      case 'pet_sitting':
        // Can be hourly or daily depending on duration
        if (totalHours <= 24) {
          calculatedHours = totalHours;
          totalPrice = totalHours * parseFloat(listingData.price_per_hour);
        } else {
          if (listingData.price_per_day) {
            calculatedDays = totalDays;
            totalPrice = totalDays * parseFloat(listingData.price_per_day);
          } else {
            calculatedHours = totalHours;
            totalPrice = totalHours * parseFloat(listingData.price_per_hour);
          }
        }
        break;
      case 'overnight_care':
        // Night-based service
        if (listingData.price_per_night) {
          calculatedDays = totalDays;
          totalPrice = totalDays * parseFloat(listingData.price_per_night);
        } else if (listingData.price_per_day) {
          calculatedDays = totalDays;
          totalPrice = totalDays * parseFloat(listingData.price_per_day);
        } else {
          // Fallback to hourly rate
          calculatedHours = totalHours;
          totalPrice = totalHours * parseFloat(listingData.price_per_hour);
        }
        break;
      default:
        throw new Error('Invalid service type');
    }

    // Insert booking record
    const result = await db.insert(bookingsTable)
      .values({
        owner_id: input.owner_id,
        sitter_id: input.sitter_id,
        dog_id: input.dog_id,
        listing_id: input.listing_id,
        service_type: input.service_type,
        start_date: input.start_date,
        end_date: input.end_date,
        total_hours: calculatedHours?.toString() || null,
        total_days: calculatedDays,
        total_price: totalPrice.toString(),
        status: 'pending',
        special_requests: input.special_requests,
        notes: null
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const booking = result[0];
    return {
      ...booking,
      total_hours: booking.total_hours ? parseFloat(booking.total_hours) : null,
      total_price: parseFloat(booking.total_price)
    };
  } catch (error) {
    console.error('Booking creation failed:', error);
    throw error;
  }
};