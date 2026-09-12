import type { Gender } from '@/lib/app-state'

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

export type Service = {
  id: string
  venueId: string
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

export type BookingStatus = 'confirmed' | 'completed' | 'cancelled'
export type BookingLocationType = 'in-salon' | 'at-home'

export type Booking = {
  id: string
  userId: string
  venueId: string
  staffId: string
  serviceId: string
  startTime: string
  endTime: string
  status: BookingStatus
  priceEGP: number
  createdAt: string
  locationType: BookingLocationType
}

export type Review = {
  id: string
  bookingId: string
  venueId: string
  userId: string
  rating: number
  text: string | null
  authorName: string
  createdAt: string
}

export type Address = {
  id: string
  label: string
  line: string
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

export const staff: Staff[] = [
  { id: 'v1-any', venueId: 'v1', name: 'Any Stylist', role: 'Available', photoUrl: null },
  { id: 'v1-kareem', venueId: 'v1', name: 'Kareem', role: 'Master Barber', photoUrl: 'https://i.pravatar.cc/80?img=10', rating: 4.9 },
  { id: 'v1-omar', venueId: 'v1', name: 'Omar', role: 'Barber', photoUrl: 'https://i.pravatar.cc/80?img=11', rating: 4.7 },

  { id: 'v2-any', venueId: 'v2', name: 'Any Stylist', role: 'Available', photoUrl: null },
  { id: 'v2-noor', venueId: 'v2', name: 'Noor', role: 'Lead Stylist', photoUrl: 'https://i.pravatar.cc/80?img=50', rating: 4.8 },

  { id: 'v3-any', venueId: 'v3', name: 'Any Stylist', role: 'Available', photoUrl: null },

  { id: 'v4-any', venueId: 'v4', name: 'Any Stylist', role: 'Available', photoUrl: null },
  { id: 'v4-ahmed', venueId: 'v4', name: 'Ahmed', role: 'Senior Barber', photoUrl: 'https://i.pravatar.cc/80?img=12', rating: 4.6 },

  { id: 'v5-any', venueId: 'v5', name: 'Any Stylist', role: 'Available', photoUrl: null },
  { id: 'v5-layla', venueId: 'v5', name: 'Layla', role: 'Master Colorist', photoUrl: 'https://i.pravatar.cc/80?img=51', rating: 4.9 },
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
]

export const currentUser: User = {
  id: 'u1',
  fullName: 'Amira Nabil',
  email: 'amira.nabil@email.com',
  phone: '+20 100 123 4567',
  avatarUrl: null,
  gender: 'For Her',
  addresses: [
    { id: 'a1', label: 'Home', line: 'New Cairo, 5th Settlement' },
    { id: 'a2', label: 'Work', line: 'Zamalek' },
  ],
  walletBalance: 350,
}

export const bookings: Booking[] = [
  {
    id: 'bk1',
    userId: currentUser.id,
    venueId: 'v1',
    staffId: 'v1-kareem',
    serviceId: 'v1-svc-1',
    startTime: todayAt(16, 30),
    endTime: todayAt(17, 10),
    status: 'confirmed',
    priceEGP: 350,
    createdAt: '2024-06-01T09:00:00',
    locationType: 'in-salon',
  },
  {
    id: 'bk2',
    userId: currentUser.id,
    venueId: 'v2',
    staffId: 'v2-noor',
    serviceId: 'v2-svc-2',
    startTime: '2024-06-14T13:00:00',
    endTime: '2024-06-14T14:30:00',
    status: 'completed',
    priceEGP: 650,
    createdAt: '2024-06-10T09:00:00',
    locationType: 'in-salon',
  },
  {
    id: 'bk3',
    userId: currentUser.id,
    venueId: 'v3',
    staffId: 'v3-any',
    serviceId: 'v3-svc-1',
    startTime: '2024-05-02T11:00:00',
    endTime: '2024-05-02T11:50:00',
    status: 'cancelled',
    priceEGP: 320,
    createdAt: '2024-04-28T09:00:00',
    locationType: 'in-salon',
  },
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

  const staffBookings = bookings.filter((booking) => booking.staffId === staffId && booking.status !== 'cancelled')

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
