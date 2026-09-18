import type { Gender } from '@/lib/app-state'

// ---------------------------------------------------------------------------
// GUARDRAIL: the mock tables below (venues, staff, stylists, services,
// reviews, bookings, favorites, currentUser) are the pre-Supabase "database"
// for this app. lib/api/* is the only code allowed to import them — every
// screen and component goes through lib/api's functions/hooks instead, so
// swapping mock data for real Supabase calls later only touches that one
// folder. Only the *types* and `serviceFilters` on this file are meant to be
// imported elsewhere (ANY_STAFF_ID, getBookingDetails, getVenueStartingPrice,
// and isVenueOpenNow are re-exported through lib/api/index.ts for
// convenience, but are still defined here). If you're adding a new screen
// and reaching for `import { venues } from '@/lib/data'` — or any
// `get*`/`generate*` helper — look for (or add) the equivalent in lib/api
// instead. There's no ESLint config in this project to enforce this
// automatically (see APP_CONTEXT.md); verify by hand with:
//
//   grep -rnE "import .*\b(venues|stylists|services|staff|reviews|bookings|favorites|currentUser|generate[A-Za-z]*|get(Venue|Stylist)[A-Za-z]*)\b.*from '@/lib/data'" app components lib/hooks | grep -v "import type"
//
// A clean migration returns nothing.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Core entity types — shaped to match what a real Supabase backend would
// eventually return (normalized tables joined by foreign key, not deeply
// nested object literals).
// ---------------------------------------------------------------------------

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

/** Per-day opening window. `null` means closed that day. */
export type OpeningHours = Record<DayOfWeek, { open: string; close: string } | null>

export type VenueCategory = 'Barbershop' | 'Beauty Salon'
export type VenueGender = 'Men' | 'Women' | 'Unisex'

export type Venue = {
  id: string
  name: string
  coverImageUrl: string | null
  address: string
  area: string
  city: string
  latitude: number
  longitude: number
  rating: number
  reviewCount: number
  category: VenueCategory
  /** Clientele the venue serves — drives the "For Her" / "For Him" home filter. */
  gender: VenueGender
  /** Loose marketing tags shown as badges and matched against home-screen service filters. */
  servicesOffered: string[]
  description: string
  openingHours: OpeningHours
}

export type Staff = {
  id: string
  venueId: string
  name: string
  role: string
  photoUrl: string | null
  rating?: number
}

export type StylistServiceType = 'at-home' | 'events-bridal'

/**
 * A Cutit Go mobile/event provider — distinct from venue-scoped `Staff`
 * since most of these fields (bio, portfolio, serviceTypes) don't apply
 * to salon booking staff. Some stylists are also venue Staff members
 * (e.g. a salon barber who also takes at-home bookings) — that's a
 * coincidence of shared mock names, not a modeled relationship; `venueId`
 * here is Stylist's own field, not a join to the Staff row.
 */
export type Stylist = {
  id: string
  name: string
  isFreelancer: boolean
  venueId: string | null
  serviceTypes: StylistServiceType[]
  /** Which clients this stylist serves — a barber might be ['male'], a bridal makeup artist ['female'], a unisex coiffeur both. */
  servesGender: ('male' | 'female')[]
  specialties: string[]
  rating: number
  reviewCount: number
  bio: string
  photoUrl: string | null
  portfolioPhotos: string[]
  priceFrom: number
  yearsExperience?: number
  /** Simplified per-stylist availability, same shape as Venue.openingHours (no per-day-exception model yet). */
  availability: OpeningHours
}

export type Service = {
  id: string
  /** Null for a freelance Stylist's own service rather than a Venue's. */
  venueId: string | null
  /** Set when this is a Cutit Go Stylist's own service rather than a Venue's. */
  stylistId?: string
  name: string
  durationMinutes: number
  priceEGP: number
  category: string
}

export type TimeSlotStatus = 'available' | 'booked' | 'blocked'

export type TimeSlot = {
  id: string
  venueId: string
  staffId: string
  serviceId: string
  startTime: string
  endTime: string
  status: TimeSlotStatus
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type BookingType = 'salon' | 'at-home' | 'events-bridal'

/** Sentinel `Booking.staffId` for "no stylist preference" — never a real `Staff.id`. */
export const ANY_STAFF_ID = 'any'

export type Booking = {
  id: string
  userId: string
  bookingType: BookingType
  // Salon bookings:
  venueId: string | null
  /** A real Staff id, or null when `anyStaff` is true (customer chose "Any stylist") or for Cutit Go bookings (which use stylistId instead). ANY_STAFF_ID is a client-side selection sentinel only — it's never stored here; createBooking translates it to `{ staffId: null, anyStaff: true }`. */
  staffId: string | null
  /** True when this salon booking has no staff preference. Explicit flag rather than overloading staffId with a magic string, since a real backend needs the "any" case to be part of the contract, not an implementation detail. */
  anyStaff?: boolean
  // Cutit Go bookings:
  stylistId: string | null
  addressId: string | null
  travelFeeEGP?: number
  /** events-bridal only. */
  eventDate?: string
  /** events-bridal only — venue name, guest count, etc., freeform for now. */
  eventNotes?: string
  // Shared:
  serviceIds: string[]
  startTime: string
  endTime: string
  status: BookingStatus
  priceEGP: number
  createdAt: string
}

export type Review = {
  id: string
  bookingId: string
  /** Null for a review of a freelance Stylist rather than a Venue. */
  venueId: string | null
  /** Set when this review is of a Cutit Go Stylist rather than a Venue. */
  stylistId?: string
  userId: string
  rating: number
  text: string | null
  authorName: string
  createdAt: string
}

export type Address = {
  id: string
  /** 'Home' | 'Work' | a custom label the user typed. */
  label: string
  area: string
  details: string
  latitude?: number
  longitude?: number
}

export type Favorite = {
  id: string
  userId: string
  venueId: string
  createdAt: string
}

export type User = {
  id: string
  fullName: string
  email: string
  phone: string
  avatarUrl: string | null
  gender: Gender
  addresses: Address[]
  walletBalance: number
}

// ---------------------------------------------------------------------------
// Mock tables
// ---------------------------------------------------------------------------

function dailyHours(open: string, close: string): OpeningHours {
  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  return Object.fromEntries(days.map((day) => [day, { open, close }])) as OpeningHours
}

const CLOSED_ALL_WEEK: OpeningHours = {
  monday: null,
  tuesday: null,
  wednesday: null,
  thursday: null,
  friday: null,
  saturday: null,
  sunday: null,
}

export const venues: Venue[] = [
  {
    id: 'v1',
    name: 'The Grooming Society',
    coverImageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=85',
    address: '90th Street, New Cairo',
    area: 'New Cairo',
    city: 'Cairo',
    latitude: 30.0296,
    longitude: 31.4913,
    rating: 4.9,
    reviewCount: 128,
    category: 'Barbershop',
    gender: 'Men',
    servicesOffered: ['Haircut', 'Beard trim', 'Hot towel'],
    description: 'A modern barbershop in New Cairo known for precision fades and a relaxing hot towel finish.',
    openingHours: dailyHours('10:00', '22:00'),
  },
  {
    id: 'v2',
    name: 'Luma Beauty House',
    coverImageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=85',
    address: '26th of July Street, Zamalek',
    area: 'Zamalek',
    city: 'Cairo',
    latitude: 30.0616,
    longitude: 31.2197,
    rating: 4.8,
    reviewCount: 96,
    category: 'Beauty Salon',
    gender: 'Women',
    servicesOffered: ['Blow dry', 'Hair color', 'Manicure'],
    description: 'A calm, light-filled salon in Zamalek specializing in color work and styling.',
    openingHours: dailyHours('10:00', '21:00'),
  },
  {
    id: 'v3',
    name: 'Maven Studio',
    coverImageUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=85',
    address: 'Road 9, Maadi',
    area: 'Maadi',
    city: 'Cairo',
    latitude: 29.9603,
    longitude: 31.2568,
    rating: 4.7,
    reviewCount: 74,
    category: 'Beauty Salon',
    gender: 'Unisex',
    servicesOffered: ['Hair styling', 'Nails', 'Facials'],
    description: 'A unisex studio in Maadi offering styling, nails, and facials. Temporarily closed for renovation.',
    openingHours: CLOSED_ALL_WEEK,
  },
  {
    id: 'v4',
    name: 'Blade & Brush',
    coverImageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=85',
    address: 'Baghdad Street, Heliopolis',
    area: 'Heliopolis',
    city: 'Cairo',
    latitude: 30.0876,
    longitude: 31.3221,
    rating: 4.6,
    reviewCount: 51,
    category: 'Barbershop',
    gender: 'Men',
    servicesOffered: ['Haircut', 'Beard trim', 'Kids cut'],
    description: 'A no-frills neighborhood barbershop in Heliopolis, good with kids and quick fades alike.',
    openingHours: dailyHours('09:00', '21:00'),
  },
  {
    id: 'v5',
    name: 'Serein Atelier',
    coverImageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=900&q=85',
    address: 'District 5, Sheikh Zayed',
    area: 'Sheikh Zayed',
    city: 'Giza',
    latitude: 30.0328,
    longitude: 30.9755,
    rating: 4.9,
    reviewCount: 112,
    category: 'Beauty Salon',
    gender: 'Women',
    servicesOffered: ['Hair color', 'Balayage', 'Bridal'],
    description: 'A luxury color and bridal atelier in Sheikh Zayed, worth the drive from anywhere in Cairo.',
    openingHours: dailyHours('11:00', '23:00'),
  },
]

// No per-venue "Any Stylist" rows here anymore — venue/[id].tsx renders that
// option itself, keyed by the shared ANY_STAFF_ID sentinel above, so there's
// one convention instead of a mock Staff row per venue plus a state sentinel.
export const staff: Staff[] = [
  { id: 'v1-kareem', venueId: 'v1', name: 'Kareem', role: 'Master Barber', photoUrl: 'https://i.pravatar.cc/80?img=10', rating: 4.9 },
  { id: 'v1-omar', venueId: 'v1', name: 'Omar', role: 'Barber', photoUrl: 'https://i.pravatar.cc/80?img=11', rating: 4.7 },

  { id: 'v2-noor', venueId: 'v2', name: 'Noor', role: 'Lead Stylist', photoUrl: 'https://i.pravatar.cc/80?img=50', rating: 4.8 },

  { id: 'v4-ahmed', venueId: 'v4', name: 'Ahmed', role: 'Senior Barber', photoUrl: 'https://i.pravatar.cc/80?img=12', rating: 4.6 },

  { id: 'v5-layla', venueId: 'v5', name: 'Layla', role: 'Master Colorist', photoUrl: 'https://i.pravatar.cc/80?img=51', rating: 4.9 },
]

export const stylists: Stylist[] = [
  {
    id: 'st-tarek',
    name: 'Tarek Selim',
    isFreelancer: true,
    venueId: null,
    serviceTypes: ['at-home'],
    servesGender: ['male'],
    specialties: ['Barbering', 'Beard Grooming'],
    rating: 4.8,
    reviewCount: 62,
    bio: 'Mobile barber covering Cairo and Giza. Precision fades and traditional straight-razor shaves, at your door.',
    photoUrl: 'https://i.pravatar.cc/160?img=20',
    portfolioPhotos: [],
    priceFrom: 200,
    yearsExperience: 6,
    availability: dailyHours('09:00', '19:00'),
  },
  {
    id: 'st-rania',
    name: 'Rania Hossam',
    isFreelancer: true,
    venueId: null,
    serviceTypes: ['events-bridal'],
    servesGender: ['female'],
    specialties: ['Bridal Makeup', 'Hairstyling'],
    rating: 4.9,
    reviewCount: 88,
    bio: 'Bridal makeup artist and hairstylist with 9 years in the industry. Known for soft, long-wear looks that photograph beautifully.',
    photoUrl: 'https://i.pravatar.cc/160?img=21',
    portfolioPhotos: [],
    priceFrom: 1500,
    yearsExperience: 9,
    availability: dailyHours('10:00', '22:00'),
  },
  {
    id: 'st-kareem-mobile',
    name: 'Kareem',
    isFreelancer: false,
    venueId: 'v1',
    serviceTypes: ['at-home'],
    servesGender: ['male'],
    specialties: ['Barbering', 'Beard Grooming'],
    rating: 4.9,
    reviewCount: 21,
    bio: 'The Grooming Society’s master barber also takes at-home bookings around New Cairo.',
    photoUrl: 'https://i.pravatar.cc/160?img=10',
    portfolioPhotos: [],
    priceFrom: 300,
    yearsExperience: 7,
    availability: dailyHours('17:00', '21:00'),
  },
  {
    id: 'st-noor-mobile',
    name: 'Noor',
    isFreelancer: false,
    venueId: 'v2',
    serviceTypes: ['events-bridal'],
    servesGender: ['female'],
    specialties: ['Bridal Hair', 'Blow Dry'],
    rating: 4.8,
    reviewCount: 34,
    bio: 'Luma Beauty House’s lead stylist, available for bridal parties and event hair on location.',
    photoUrl: 'https://i.pravatar.cc/160?img=50',
    portfolioPhotos: [],
    priceFrom: 900,
    yearsExperience: 8,
    availability: dailyHours('16:00', '22:00'),
  },
  {
    id: 'st-salma',
    name: 'Salma Ezz',
    isFreelancer: true,
    venueId: null,
    serviceTypes: ['at-home', 'events-bridal'],
    servesGender: ['male', 'female'],
    specialties: ['Hair Styling', 'Makeup'],
    rating: 4.7,
    reviewCount: 45,
    bio: 'Freelance hair and makeup artist for everyday at-home appointments and special events alike.',
    photoUrl: 'https://i.pravatar.cc/160?img=22',
    portfolioPhotos: [],
    priceFrom: 500,
    yearsExperience: 5,
    availability: dailyHours('09:00', '20:00'),
  },
  {
    id: 'st-adham',
    name: 'Adham Farouk',
    isFreelancer: true,
    venueId: null,
    serviceTypes: ['events-bridal'],
    servesGender: ['male'],
    specialties: ['Groom Grooming', 'Barbering'],
    rating: 4.6,
    reviewCount: 19,
    bio: 'Grooming for grooms and their party — sharp fades and beard styling before the big day.',
    photoUrl: 'https://i.pravatar.cc/160?img=23',
    portfolioPhotos: [],
    priceFrom: 600,
    yearsExperience: 4,
    availability: dailyHours('10:00', '20:00'),
  },
  {
    id: 'st-dina',
    name: 'Dina Sabry',
    isFreelancer: true,
    venueId: null,
    serviceTypes: ['at-home'],
    servesGender: ['female'],
    specialties: ['Hair Styling', 'Blow Dry'],
    rating: 4.9,
    reviewCount: 51,
    bio: 'At-home blow dry and styling specialist across Cairo, Giza, and Sheikh Zayed.',
    photoUrl: 'https://i.pravatar.cc/160?img=24',
    portfolioPhotos: [],
    priceFrom: 350,
    yearsExperience: 5,
    availability: dailyHours('09:00', '18:00'),
  },
]

export const services: Service[] = [
  { id: 'v1-svc-1', venueId: 'v1', name: 'Haircut & Beard', durationMinutes: 40, priceEGP: 250, category: 'Hair' },
  { id: 'v1-svc-2', venueId: 'v1', name: 'Haircut only', durationMinutes: 25, priceEGP: 150, category: 'Hair' },
  { id: 'v1-svc-3', venueId: 'v1', name: 'Beard trim', durationMinutes: 15, priceEGP: 120, category: 'Beard' },

  { id: 'v2-svc-1', venueId: 'v2', name: 'Blow Dry + Styling', durationMinutes: 60, priceEGP: 450, category: 'Styling' },
  { id: 'v2-svc-2', venueId: 'v2', name: 'Hair Color', durationMinutes: 90, priceEGP: 600, category: 'Color' },
  { id: 'v2-svc-3', venueId: 'v2', name: 'Manicure', durationMinutes: 30, priceEGP: 200, category: 'Nails' },

  { id: 'v3-svc-1', venueId: 'v3', name: 'Hair Styling', durationMinutes: 50, priceEGP: 320, category: 'Styling' },
  { id: 'v3-svc-2', venueId: 'v3', name: 'Nails', durationMinutes: 45, priceEGP: 250, category: 'Nails' },
  { id: 'v3-svc-3', venueId: 'v3', name: 'Facials', durationMinutes: 60, priceEGP: 400, category: 'Facial' },

  { id: 'v4-svc-1', venueId: 'v4', name: 'Standard Haircut', durationMinutes: 30, priceEGP: 180, category: 'Hair' },
  { id: 'v4-svc-2', venueId: 'v4', name: 'Kids Cut', durationMinutes: 20, priceEGP: 120, category: 'Hair' },
  { id: 'v4-svc-3', venueId: 'v4', name: 'Beard Trim', durationMinutes: 15, priceEGP: 100, category: 'Beard' },

  { id: 'v5-svc-1', venueId: 'v5', name: 'Hair Color', durationMinutes: 120, priceEGP: 600, category: 'Color' },
  { id: 'v5-svc-2', venueId: 'v5', name: 'Balayage', durationMinutes: 150, priceEGP: 800, category: 'Color' },
  { id: 'v5-svc-3', venueId: 'v5', name: 'Bridal Package', durationMinutes: 180, priceEGP: 1200, category: 'Bridal' },

  { id: 'st-tarek-svc-1', venueId: null, stylistId: 'st-tarek', name: 'Haircut (Mobile)', durationMinutes: 30, priceEGP: 200, category: 'Hair' },
  { id: 'st-tarek-svc-2', venueId: null, stylistId: 'st-tarek', name: 'Beard Trim (Mobile)', durationMinutes: 15, priceEGP: 100, category: 'Beard' },

  { id: 'st-rania-svc-1', venueId: null, stylistId: 'st-rania', name: 'Bridal Makeup', durationMinutes: 90, priceEGP: 1500, category: 'Makeup' },
  { id: 'st-rania-svc-2', venueId: null, stylistId: 'st-rania', name: 'Trial Makeup', durationMinutes: 60, priceEGP: 800, category: 'Makeup' },
  { id: 'st-rania-svc-3', venueId: null, stylistId: 'st-rania', name: 'Bridal Hairstyling', durationMinutes: 60, priceEGP: 600, category: 'Hair' },

  { id: 'st-kareem-mobile-svc-1', venueId: null, stylistId: 'st-kareem-mobile', name: 'Haircut & Beard (At Home)', durationMinutes: 40, priceEGP: 300, category: 'Hair' },
  { id: 'st-kareem-mobile-svc-2', venueId: null, stylistId: 'st-kareem-mobile', name: 'Haircut Only (At Home)', durationMinutes: 25, priceEGP: 200, category: 'Hair' },

  { id: 'st-noor-mobile-svc-1', venueId: null, stylistId: 'st-noor-mobile', name: 'Bridal Hair', durationMinutes: 90, priceEGP: 900, category: 'Hair' },
  { id: 'st-noor-mobile-svc-2', venueId: null, stylistId: 'st-noor-mobile', name: 'Event Blow Dry', durationMinutes: 45, priceEGP: 400, category: 'Hair' },

  { id: 'st-salma-svc-1', venueId: null, stylistId: 'st-salma', name: 'Hair Styling', durationMinutes: 60, priceEGP: 500, category: 'Hair' },
  { id: 'st-salma-svc-2', venueId: null, stylistId: 'st-salma', name: 'Makeup', durationMinutes: 60, priceEGP: 700, category: 'Makeup' },
  { id: 'st-salma-svc-3', venueId: null, stylistId: 'st-salma', name: 'Hair + Makeup Combo', durationMinutes: 100, priceEGP: 1100, category: 'Combo' },

  { id: 'st-adham-svc-1', venueId: null, stylistId: 'st-adham', name: 'Groom Grooming Package', durationMinutes: 45, priceEGP: 600, category: 'Beard' },
  { id: 'st-adham-svc-2', venueId: null, stylistId: 'st-adham', name: 'Beard Styling', durationMinutes: 20, priceEGP: 250, category: 'Beard' },

  { id: 'st-dina-svc-1', venueId: null, stylistId: 'st-dina', name: 'Blow Dry', durationMinutes: 45, priceEGP: 350, category: 'Hair' },
  { id: 'st-dina-svc-2', venueId: null, stylistId: 'st-dina', name: 'Hair Styling', durationMinutes: 60, priceEGP: 450, category: 'Hair' },
]

export const reviews: Review[] = [
  { id: 'v1-rv-1', bookingId: 'bk-legacy-1', venueId: 'v1', userId: 'u-guest-1', rating: 5, text: 'Kareem always nails my fade. Hot towel finish is a nice touch.', authorName: 'Youssef Adel', createdAt: '2024-05-02T10:00:00' },
  { id: 'v1-rv-2', bookingId: 'bk-legacy-2', venueId: 'v1', userId: 'u-guest-2', rating: 5, text: 'Clean shop, friendly staff, never had to wait more than 5 minutes.', authorName: 'Mostafa Hany', createdAt: '2024-04-18T10:00:00' },
  { id: 'v1-rv-3', bookingId: 'bk-legacy-3', venueId: 'v1', userId: 'u-guest-3', rating: 4, text: 'Great haircut, a bit pricier than other places in New Cairo but worth it.', authorName: 'Amr Salah', createdAt: '2024-03-11T10:00:00' },

  { id: 'v2-rv-1', bookingId: 'bk-legacy-4', venueId: 'v2', userId: 'u-guest-4', rating: 5, text: 'Noor is incredibly talented with color. My balayage turned out perfect.', authorName: 'Nour Fathy', createdAt: '2024-05-20T10:00:00' },
  { id: 'v2-rv-2', bookingId: 'bk-legacy-5', venueId: 'v2', userId: 'u-guest-5', rating: 5, text: 'Beautiful salon, very relaxing atmosphere in Zamalek.', authorName: 'Salma Reda', createdAt: '2024-04-02T10:00:00' },
  { id: 'v2-rv-3', bookingId: 'bk-legacy-6', venueId: 'v2', userId: 'u-guest-6', rating: 4, text: 'Loved my blow dry, will be back for the manicure next time.', authorName: 'Dina Kamal', createdAt: '2024-02-27T10:00:00' },

  { id: 'v3-rv-1', bookingId: 'bk-legacy-7', venueId: 'v3', userId: 'u-guest-7', rating: 5, text: 'The facial was so relaxing, my skin has never looked better.', authorName: 'Heba Younes', createdAt: '2024-03-30T10:00:00' },
  { id: 'v3-rv-2', bookingId: 'bk-legacy-8', venueId: 'v3', userId: 'u-guest-8', rating: 4, text: 'Unisex spot in Maadi is rare, glad I found this one.', authorName: 'Karim Fouad', createdAt: '2024-02-14T10:00:00' },

  { id: 'v4-rv-1', bookingId: 'bk-legacy-9', venueId: 'v4', userId: 'u-guest-9', rating: 5, text: 'Ahmed is great with kids, my son actually enjoys his haircuts now.', authorName: 'Tarek Ibrahim', createdAt: '2024-05-05T10:00:00' },
  { id: 'v4-rv-2', bookingId: 'bk-legacy-10', venueId: 'v4', userId: 'u-guest-10', rating: 4, text: 'Solid, no-frills barbershop. Good prices for Heliopolis.', authorName: 'Sherif Nabil', createdAt: '2024-03-22T10:00:00' },

  { id: 'v5-rv-1', bookingId: 'bk-legacy-11', venueId: 'v5', userId: 'u-guest-11', rating: 5, text: 'Layla did my bridal hair and makeup trial, absolutely stunning work.', authorName: 'Farida Osman', createdAt: '2024-05-15T10:00:00' },
  { id: 'v5-rv-2', bookingId: 'bk-legacy-12', venueId: 'v5', userId: 'u-guest-12', rating: 5, text: 'Best balayage I have had in Cairo, worth the drive to Sheikh Zayed.', authorName: 'Mariam Adly', createdAt: '2024-04-08T10:00:00' },
  { id: 'v5-rv-3', bookingId: 'bk-legacy-13', venueId: 'v5', userId: 'u-guest-13', rating: 5, text: 'Atelier feels luxurious from the moment you walk in.', authorName: 'Rana Fahmy', createdAt: '2024-03-01T10:00:00' },

  { id: 'st-tarek-rv-1', bookingId: 'bk-legacy-14', venueId: null, stylistId: 'st-tarek', userId: 'u-guest-14', rating: 5, text: 'Showed up on time and gave me the best fade I have had at home.', authorName: 'Hossam Zaki', createdAt: '2024-05-08T10:00:00' },
  { id: 'st-tarek-rv-2', bookingId: 'bk-legacy-15', venueId: null, stylistId: 'st-tarek', userId: 'u-guest-15', rating: 4, text: 'Great haircut, brought all his own tools and towels.', authorName: 'Fady Nassif', createdAt: '2024-04-01T10:00:00' },

  { id: 'st-rania-rv-1', bookingId: 'bk-legacy-16', venueId: null, stylistId: 'st-rania', userId: 'u-guest-16', rating: 5, text: 'Rania did my bridal trial and the real thing lasted all night without touch-ups.', authorName: 'Nadine Samir', createdAt: '2024-05-22T10:00:00' },
  { id: 'st-rania-rv-2', bookingId: 'bk-legacy-17', venueId: null, stylistId: 'st-rania', userId: 'u-guest-17', rating: 5, text: 'Booked her for my engagement party, everyone asked who did my makeup.', authorName: 'Yara Emad', createdAt: '2024-03-19T10:00:00' },

  { id: 'st-kareem-mobile-rv-1', bookingId: 'bk-legacy-18', venueId: null, stylistId: 'st-kareem-mobile', userId: 'u-guest-18', rating: 5, text: 'Same great fade as in the shop, just at my apartment instead.', authorName: 'Ziad Moustafa', createdAt: '2024-04-25T10:00:00' },
]

export const currentUser: User = {
  id: 'u1',
  fullName: 'Amira Nabil',
  email: 'amira.nabil@email.com',
  phone: '+20 100 123 4567',
  avatarUrl: null,
  gender: 'For Her',
  addresses: [
    { id: 'a1', label: 'Home', area: 'New Cairo', details: '5th Settlement, Building 12, Apt 4', latitude: 30.03, longitude: 31.49 },
    { id: 'a2', label: 'Work', area: 'Zamalek', details: '26th of July Street, Floor 3', latitude: 30.0616, longitude: 31.2197 },
  ],
  walletBalance: 350,
}

export const bookings: Booking[] = [
  {
    id: 'bk1',
    userId: currentUser.id,
    bookingType: 'salon',
    venueId: 'v1',
    staffId: 'v1-kareem',
    stylistId: null,
    addressId: null,
    serviceIds: ['v1-svc-1'],
    startTime: todayAt(16, 30),
    endTime: todayAt(17, 10),
    status: 'confirmed',
    priceEGP: 350,
    createdAt: '2024-06-01T09:00:00',
  },
  {
    id: 'bk2',
    userId: currentUser.id,
    bookingType: 'salon',
    venueId: 'v2',
    staffId: 'v2-noor',
    stylistId: null,
    addressId: null,
    serviceIds: ['v2-svc-2'],
    startTime: '2024-06-14T13:00:00',
    endTime: '2024-06-14T14:30:00',
    status: 'completed',
    priceEGP: 650,
    createdAt: '2024-06-10T09:00:00',
  },
  {
    id: 'bk3',
    userId: currentUser.id,
    bookingType: 'salon',
    venueId: 'v3',
    staffId: null,
    anyStaff: true,
    stylistId: null,
    addressId: null,
    serviceIds: ['v3-svc-1'],
    startTime: '2024-05-02T11:00:00',
    endTime: '2024-05-02T11:50:00',
    status: 'cancelled',
    priceEGP: 320,
    createdAt: '2024-04-28T09:00:00',
  },
]

export const favorites: Favorite[] = [
  { id: 'fav1', userId: currentUser.id, venueId: 'v1', createdAt: '2024-05-10T09:00:00' },
  { id: 'fav2', userId: currentUser.id, venueId: 'v5', createdAt: '2024-05-18T09:00:00' },
]

export const serviceFilters = ['All services', 'Haircut', 'Beard trim', 'Hair color', 'Manicure', 'Facials']

// ---------------------------------------------------------------------------
// Derived-data helpers — this is the shape a Supabase query layer would take
// on (joins by foreign key, availability computed rather than hardcoded).
// ---------------------------------------------------------------------------

function todayAt(hours: number, minutes: number): string {
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  // Keep the full UTC-instant ISO string (with trailing "Z") — a version
  // truncated to look like local wall-clock time would silently shift by
  // the local UTC offset the next time it's parsed with `new Date(...)`.
  return date.toISOString()
}

export function getVenueStaff(venueId: string): Staff[] {
  return staff.filter((member) => member.venueId === venueId)
}

export function getVenueServices(venueId: string): Service[] {
  return services.filter((service) => service.venueId === venueId)
}

export function getVenueReviews(venueId: string): Review[] {
  return reviews.filter((review) => review.venueId === venueId)
}

export function getStylistReviews(stylistId: string): Review[] {
  return reviews.filter((review) => review.stylistId === stylistId)
}

export function getStylistsByType(type: StylistServiceType): Stylist[] {
  return stylists.filter((stylist) => stylist.serviceTypes.includes(type))
}

export function getStylistServices(stylistId: string): Service[] {
  return services.filter((service) => service.stylistId === stylistId)
}

/**
 * Resolves the venue/staff (salon) or stylist/address (Cutit Go) side of a
 * booking, plus its booked services, for display. `addresses` is a
 * parameter rather than the static `currentUser.addresses` because callers
 * read it from the live `AppState` (new addresses added mid-session
 * wouldn't otherwise resolve).
 */
export function getBookingDetails(booking: Booking, addresses: Address[] = []) {
  const venue = booking.venueId ? venues.find((item) => item.id === booking.venueId) : undefined
  const bookingStaff = booking.staffId ? staff.find((item) => item.id === booking.staffId) : undefined
  const stylist = booking.stylistId ? stylists.find((item) => item.id === booking.stylistId) : undefined
  const address = booking.addressId ? addresses.find((item) => item.id === booking.addressId) : undefined
  const bookedServices = services.filter((service) => booking.serviceIds.includes(service.id))
  const startDate = new Date(booking.startTime)
  return {
    venue,
    staff: bookingStaff,
    stylist,
    address,
    services: bookedServices,
    startDate,
    priceEGP: booking.priceEGP,
    bookingType: booking.bookingType,
    status: booking.status,
    dateLabel: startDate.toLocaleDateString([], { month: 'long', day: '2-digit', year: 'numeric' }),
    timeLabel: startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
  }
}

/** Cheapest bookable service at a venue, shown as the "From EGP X" card price. */
export function getVenueStartingPrice(venueId: string): number {
  const venueServices = getVenueServices(venueId)
  return Math.min(...venueServices.map((service) => service.priceEGP))
}

const DAY_KEYS: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export function isVenueOpenNow(openingHours: OpeningHours, now: Date = new Date()): boolean {
  const today = openingHours[DAY_KEYS[now.getDay()]]
  if (!today) return false
  const minutesNow = now.getHours() * 60 + now.getMinutes()
  const [openH, openM] = today.open.split(':').map(Number)
  const [closeH, closeM] = today.close.split(':').map(Number)
  return minutesNow >= openH * 60 + openM && minutesNow < closeH * 60 + closeM
}

/**
 * Availability computed from the venue's schedule (standing in for a
 * per-staff schedule, which the backend doesn't model separately yet),
 * existing bookings for that staff member, and the requested service
 * duration — rather than a flat hardcoded list of times.
 */
export function generateTimeSlots({
  venueId,
  staffId,
  serviceId,
  date,
  durationMinutes,
}: {
  venueId: string
  staffId: string
  serviceId: string
  date: Date
  /** Overrides the service's own duration, e.g. when multiple services are selected. */
  durationMinutes?: number
}): TimeSlot[] {
  const venue = venues.find((item) => item.id === venueId)
  const service = services.find((item) => item.id === serviceId)
  if (!venue || !service) return []

  const dayHours = venue.openingHours[DAY_KEYS[date.getDay()]]
  if (!dayHours) return []

  const step = durationMinutes ?? service.durationMinutes
  const [openH, openM] = dayHours.open.split(':').map(Number)
  const [closeH, closeM] = dayHours.close.split(':').map(Number)

  const dayStart = new Date(date)
  dayStart.setHours(openH, openM, 0, 0)
  const dayEnd = new Date(date)
  dayEnd.setHours(closeH, closeM, 0, 0)

  // ANY_STAFF_ID means "no staff preference" — treat the slot as taken if
  // *any* of the venue's staff has a conflicting booking, rather than
  // filtering to one specific staffId.
  const staffBookings =
    staffId === ANY_STAFF_ID
      ? bookings.filter((booking) => booking.venueId === venueId && booking.status !== 'cancelled')
      : bookings.filter((booking) => booking.staffId === staffId && booking.status !== 'cancelled')

  const slots: TimeSlot[] = []
  for (let start = new Date(dayStart); start.getTime() + step * 60_000 <= dayEnd.getTime(); start = new Date(start.getTime() + step * 60_000)) {
    const end = new Date(start.getTime() + step * 60_000)

    // Simplified lunch-break rule standing in for a real staff schedule exception.
    const isLunchBreak = start.getHours() === 13

    const overlapsBooking = staffBookings.some((booking) => {
      const bookingStart = new Date(booking.startTime).getTime()
      const bookingEnd = new Date(booking.endTime).getTime()
      return start.getTime() < bookingEnd && end.getTime() > bookingStart
    })

    const status: TimeSlotStatus = isLunchBreak ? 'blocked' : overlapsBooking ? 'booked' : 'available'

    slots.push({
      id: `${staffId}-${serviceId}-${start.toISOString()}`,
      venueId,
      staffId,
      serviceId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      status,
    })
  }

  return slots
}

export type StylistTimeSlot = {
  id: string
  stylistId: string
  startTime: string
  endTime: string
  status: TimeSlotStatus
}

/**
 * Same derivation logic as generateTimeSlots, but for a freelance/Cutit Go
 * Stylist: availability comes from Stylist.availability instead of a
 * Venue's opening hours, existing bookings are matched by stylistId
 * instead of staffId, and duration is the caller-summed total of however
 * many services were selected (there's no single "the service" to look
 * up a duration from once multiple are selected).
 *
 * Accepts the bookings list to check against (defaults to the static mock
 * table) so a caller with a live, growing list — e.g. app-state's
 * addBooking()-updated bookings — can pass that in instead for slots that
 * correctly account for bookings made earlier in the same session.
 */
export function generateStylistTimeSlots({
  stylistId,
  durationMinutes,
  date,
  bookingsList = bookings,
}: {
  stylistId: string
  durationMinutes: number
  date: Date
  bookingsList?: Booking[]
}): StylistTimeSlot[] {
  const stylist = stylists.find((item) => item.id === stylistId)
  if (!stylist || durationMinutes <= 0) return []

  const dayHours = stylist.availability[DAY_KEYS[date.getDay()]]
  if (!dayHours) return []

  const [openH, openM] = dayHours.open.split(':').map(Number)
  const [closeH, closeM] = dayHours.close.split(':').map(Number)

  const dayStart = new Date(date)
  dayStart.setHours(openH, openM, 0, 0)
  const dayEnd = new Date(date)
  dayEnd.setHours(closeH, closeM, 0, 0)

  const stylistBookings = bookingsList.filter((booking) => booking.stylistId === stylistId && booking.status !== 'cancelled')

  const slots: StylistTimeSlot[] = []
  for (
    let start = new Date(dayStart);
    start.getTime() + durationMinutes * 60_000 <= dayEnd.getTime();
    start = new Date(start.getTime() + durationMinutes * 60_000)
  ) {
    const end = new Date(start.getTime() + durationMinutes * 60_000)

    const overlapsBooking = stylistBookings.some((booking) => {
      const bookingStart = new Date(booking.startTime).getTime()
      const bookingEnd = new Date(booking.endTime).getTime()
      return start.getTime() < bookingEnd && end.getTime() > bookingStart
    })

    slots.push({
      id: `${stylistId}-${start.toISOString()}`,
      stylistId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      status: overlapsBooking ? 'booked' : 'available',
    })
  }

  return slots
}
