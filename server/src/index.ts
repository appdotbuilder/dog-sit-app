import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createUserInputSchema,
  updateUserInputSchema,
  createDogInputSchema,
  updateDogInputSchema,
  createSitterListingInputSchema,
  updateSitterListingInputSchema,
  searchSittersInputSchema,
  createBookingInputSchema,
  updateBookingStatusInputSchema,
  createMessageInputSchema,
  markMessageReadInputSchema,
  createReviewInputSchema
} from './schema';

// Import handlers
import { createUser } from './handlers/create_user';
import { getUser } from './handlers/get_user';
import { updateUser } from './handlers/update_user';
import { createDog } from './handlers/create_dog';
import { getDogsByOwner } from './handlers/get_dogs_by_owner';
import { updateDog } from './handlers/update_dog';
import { createSitterListing } from './handlers/create_sitter_listing';
import { searchSitters } from './handlers/search_sitters';
import { getSitterListings } from './handlers/get_sitter_listings';
import { updateSitterListing } from './handlers/update_sitter_listing';
import { createBooking } from './handlers/create_booking';
import { getBookingsByOwner } from './handlers/get_bookings_by_owner';
import { getBookingsBySitter } from './handlers/get_bookings_by_sitter';
import { updateBookingStatus } from './handlers/update_booking_status';
import { createMessage } from './handlers/create_message';
import { getMessages } from './handlers/get_messages';
import { markMessageRead } from './handlers/mark_message_read';
import { createReview } from './handlers/create_review';
import { getReviews } from './handlers/get_reviews';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // User management routes
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),
  
  getUser: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getUser(input.id)),
  
  updateUser: publicProcedure
    .input(updateUserInputSchema)
    .mutation(({ input }) => updateUser(input)),

  // Dog management routes
  createDog: publicProcedure
    .input(createDogInputSchema)
    .mutation(({ input }) => createDog(input)),
  
  getDogsByOwner: publicProcedure
    .input(z.object({ ownerId: z.number() }))
    .query(({ input }) => getDogsByOwner(input.ownerId)),
  
  updateDog: publicProcedure
    .input(updateDogInputSchema)
    .mutation(({ input }) => updateDog(input)),

  // Sitter listing routes
  createSitterListing: publicProcedure
    .input(createSitterListingInputSchema)
    .mutation(({ input }) => createSitterListing(input)),
  
  searchSitters: publicProcedure
    .input(searchSittersInputSchema)
    .query(({ input }) => searchSitters(input)),
  
  getSitterListings: publicProcedure
    .input(z.object({ sitterId: z.number() }))
    .query(({ input }) => getSitterListings(input.sitterId)),
  
  updateSitterListing: publicProcedure
    .input(updateSitterListingInputSchema)
    .mutation(({ input }) => updateSitterListing(input)),

  // Booking management routes
  createBooking: publicProcedure
    .input(createBookingInputSchema)
    .mutation(({ input }) => createBooking(input)),
  
  getBookingsByOwner: publicProcedure
    .input(z.object({ ownerId: z.number() }))
    .query(({ input }) => getBookingsByOwner(input.ownerId)),
  
  getBookingsBySitter: publicProcedure
    .input(z.object({ sitterId: z.number() }))
    .query(({ input }) => getBookingsBySitter(input.sitterId)),
  
  updateBookingStatus: publicProcedure
    .input(updateBookingStatusInputSchema)
    .mutation(({ input }) => updateBookingStatus(input)),

  // Messaging routes
  createMessage: publicProcedure
    .input(createMessageInputSchema)
    .mutation(({ input }) => createMessage(input)),
  
  getMessages: publicProcedure
    .input(z.object({ bookingId: z.number() }))
    .query(({ input }) => getMessages(input.bookingId)),
  
  markMessageRead: publicProcedure
    .input(markMessageReadInputSchema)
    .mutation(({ input }) => markMessageRead(input)),

  // Review routes
  createReview: publicProcedure
    .input(createReviewInputSchema)
    .mutation(({ input }) => createReview(input)),
  
  getReviews: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(({ input }) => getReviews(input.userId)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();