export type Staff = { id: number; name: string; role: string; photo?: string }
export type Service = { name: string; price: number; duration: number }
export type Review = { id: number; author: string; rating: number; text: string }

export type Establishment = {
  id: number
  name: string
  district: string
  category: 'Barbershop' | 'Beauty Salon'
  gender: 'Men' | 'Women' | 'Unisex'
  isOpen: boolean
  rating: number
  reviews: number
  price: number
  services: string[]
  image: string
  staff: Staff[]
  serviceList: Service[]
  reviewList: Review[]
}

export const establishments: Establishment[] = [
  {
    id: 1,
    name: 'The Grooming Society',
    district: 'New Cairo',
    category: 'Barbershop',
    gender: 'Men',
    isOpen: true,
    rating: 4.9,
    reviews: 128,
    price: 250,
    services: ['Haircut', 'Beard trim', 'Hot towel'],
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=85',
    staff: [
      { id: 1, name: 'Any Stylist', role: 'Available' },
      { id: 2, name: 'Kareem', role: 'Master Barber', photo: 'https://i.pravatar.cc/80?img=10' },
      { id: 3, name: 'Omar', role: 'Barber', photo: 'https://i.pravatar.cc/80?img=11' },
    ],
    serviceList: [
      { name: 'Haircut & Beard', price: 250, duration: 40 },
      { name: 'Haircut only', price: 150, duration: 25 },
      { name: 'Beard trim', price: 120, duration: 15 },
    ],
    reviewList: [
      { id: 1, author: 'Youssef Adel', rating: 5, text: 'Kareem always nails my fade. Hot towel finish is a nice touch.' },
      { id: 2, author: 'Mostafa Hany', rating: 5, text: 'Clean shop, friendly staff, never had to wait more than 5 minutes.' },
      { id: 3, author: 'Amr Salah', rating: 4, text: 'Great haircut, a bit pricier than other places in New Cairo but worth it.' },
    ],
  },
  {
    id: 2,
    name: 'Luma Beauty House',
    district: 'Zamalek',
    category: 'Beauty Salon',
    gender: 'Women',
    isOpen: true,
    rating: 4.8,
    reviews: 96,
    price: 450,
    services: ['Blow dry', 'Hair color', 'Manicure'],
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=85',
    staff: [
      { id: 1, name: 'Any Stylist', role: 'Available' },
      { id: 2, name: 'Noor', role: 'Lead Stylist', photo: 'https://i.pravatar.cc/80?img=50' },
    ],
    serviceList: [
      { name: 'Blow Dry + Styling', price: 450, duration: 60 },
      { name: 'Hair Color', price: 600, duration: 90 },
      { name: 'Manicure', price: 200, duration: 30 },
    ],
    reviewList: [
      { id: 1, author: 'Nour Fathy', rating: 5, text: 'Noor is incredibly talented with color. My balayage turned out perfect.' },
      { id: 2, author: 'Salma Reda', rating: 5, text: 'Beautiful salon, very relaxing atmosphere in Zamalek.' },
      { id: 3, author: 'Dina Kamal', rating: 4, text: 'Loved my blow dry, will be back for the manicure next time.' },
    ],
  },
  {
    id: 3,
    name: 'Maven Studio',
    district: 'Maadi',
    category: 'Beauty Salon',
    gender: 'Unisex',
    isOpen: false,
    rating: 4.7,
    reviews: 74,
    price: 320,
    services: ['Hair styling', 'Nails', 'Facials'],
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=85',
    staff: [{ id: 1, name: 'Any Stylist', role: 'Available' }],
    serviceList: [
      { name: 'Hair Styling', price: 320, duration: 50 },
      { name: 'Nails', price: 250, duration: 45 },
      { name: 'Facials', price: 400, duration: 60 },
    ],
    reviewList: [
      { id: 1, author: 'Heba Younes', rating: 5, text: 'The facial was so relaxing, my skin has never looked better.' },
      { id: 2, author: 'Karim Fouad', rating: 4, text: 'Unisex spot in Maadi is rare, glad I found this one.' },
    ],
  },
  {
    id: 4,
    name: 'Blade & Brush',
    district: 'Heliopolis',
    category: 'Barbershop',
    gender: 'Men',
    isOpen: true,
    rating: 4.6,
    reviews: 51,
    price: 180,
    services: ['Haircut', 'Beard trim', 'Kids cut'],
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=85',
    staff: [
      { id: 1, name: 'Any Stylist', role: 'Available' },
      { id: 2, name: 'Ahmed', role: 'Senior Barber', photo: 'https://i.pravatar.cc/80?img=12' },
    ],
    serviceList: [
      { name: 'Standard Haircut', price: 180, duration: 30 },
      { name: 'Kids Cut', price: 120, duration: 20 },
      { name: 'Beard Trim', price: 100, duration: 15 },
    ],
    reviewList: [
      { id: 1, author: 'Tarek Ibrahim', rating: 5, text: 'Ahmed is great with kids, my son actually enjoys his haircuts now.' },
      { id: 2, author: 'Sherif Nabil', rating: 4, text: 'Solid, no-frills barbershop. Good prices for Heliopolis.' },
    ],
  },
  {
    id: 5,
    name: 'Serein Atelier',
    district: 'Sheikh Zayed',
    category: 'Beauty Salon',
    gender: 'Women',
    isOpen: true,
    rating: 4.9,
    reviews: 112,
    price: 600,
    services: ['Hair color', 'Balayage', 'Bridal'],
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=900&q=85',
    staff: [
      { id: 1, name: 'Any Stylist', role: 'Available' },
      { id: 2, name: 'Layla', role: 'Master Colorist', photo: 'https://i.pravatar.cc/80?img=51' },
    ],
    serviceList: [
      { name: 'Hair Color', price: 600, duration: 120 },
      { name: 'Balayage', price: 800, duration: 150 },
      { name: 'Bridal Package', price: 1200, duration: 180 },
    ],
    reviewList: [
      { id: 1, author: 'Farida Osman', rating: 5, text: 'Layla did my bridal hair and makeup trial, absolutely stunning work.' },
      { id: 2, author: 'Mariam Adly', rating: 5, text: 'Best balayage I have had in Cairo, worth the drive to Sheikh Zayed.' },
      { id: 3, author: 'Rana Fahmy', rating: 5, text: 'Atelier feels luxurious from the moment you walk in.' },
    ],
  },
]

export const serviceFilters = ['All services', 'Haircut', 'Beard trim', 'Hair color', 'Manicure', 'Facials']

export const timeSlots: { time: string; period: 'Morning' | 'Afternoon' | 'Evening' }[] = [
  { time: '09:00', period: 'Morning' },
  { time: '10:00', period: 'Morning' },
  { time: '11:00', period: 'Morning' },
  { time: '14:00', period: 'Afternoon' },
  { time: '15:00', period: 'Afternoon' },
  { time: '16:00', period: 'Afternoon' },
  { time: '18:00', period: 'Evening' },
  { time: '19:00', period: 'Evening' },
]
