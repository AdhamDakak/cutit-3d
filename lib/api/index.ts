export * from './venues'
export * from './stylists'
export * from './slots'
export * from './bookings'
export * from './user'
export * from './favorites'

// ANY_STAFF_ID (a client-side selection sentinel, translated to
// { staffId: null, anyStaff: true } by createBooking) and getBookingDetails
// (a synchronous join over venues/staff/stylists/services, kept sync for
// now rather than forced through another round of hook plumbing) both stay
// implemented in lib/data.ts, but are re-exported here so every screen's
// only import path into this data is lib/api — never lib/data directly,
// per the guardrail at the top of lib/data.ts.
export { ANY_STAFF_ID, getBookingDetails } from '@/lib/data'
