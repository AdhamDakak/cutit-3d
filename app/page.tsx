'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  CalendarX2,
  CheckCircle2,
  ChevronLeft,
  CircleAlert,
  ChevronRight,
  Cake,
  CreditCard,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  DoorOpen,
  FileText,
  Scissors,
  Heart,
  HelpCircle,
  Home,
  Languages,
  LocateFixed,
  LogOut,
  Mail,
  MessageCircle,
  MapPin,
  Menu,
  Moon,
  Pencil,
  Phone,
  PhoneCall,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  Trash2,
  WalletCards,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react'

type Establishment = {
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
  staff?: { id: number; name: string; role: string; photo?: string }[]
  serviceList?: { name: string; price: number; duration: number }[]
}

const establishments: Establishment[] = [
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
      { id: 1, name: 'Any Stylist', role: 'Available', photo: undefined },
      { id: 2, name: 'Kareem', role: 'Master Barber', photo: 'https://i.pravatar.cc/40?img=10' },
      { id: 3, name: 'Omar', role: 'Barber', photo: 'https://i.pravatar.cc/40?img=11' },
    ],
    serviceList: [
      { name: 'Haircut & Beard', price: 250, duration: 40 },
      { name: 'Haircut only', price: 150, duration: 25 },
      { name: 'Beard trim', price: 120, duration: 15 },
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
      { id: 1, name: 'Any Stylist', role: 'Available', photo: undefined },
      { id: 2, name: 'Noor', role: 'Lead Stylist', photo: 'https://i.pravatar.cc/40?img=50' },
    ],
    serviceList: [
      { name: 'Blow Dry + Styling', price: 450, duration: 60 },
      { name: 'Hair Color', price: 600, duration: 90 },
      { name: 'Manicure', price: 200, duration: 30 },
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
    staff: [
      { id: 1, name: 'Any Stylist', role: 'Available', photo: undefined },
    ],
    serviceList: [
      { name: 'Hair Styling', price: 320, duration: 50 },
      { name: 'Nails', price: 250, duration: 45 },
      { name: 'Facials', price: 400, duration: 60 },
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
      { id: 1, name: 'Any Stylist', role: 'Available', photo: undefined },
      { id: 2, name: 'Ahmed', role: 'Senior Barber', photo: 'https://i.pravatar.cc/40?img=12' },
    ],
    serviceList: [
      { name: 'Standard Haircut', price: 180, duration: 30 },
      { name: 'Kids Cut', price: 120, duration: 20 },
      { name: 'Beard Trim', price: 100, duration: 15 },
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
      { id: 1, name: 'Any Stylist', role: 'Available', photo: undefined },
      { id: 2, name: 'Layla', role: 'Master Colorist', photo: 'https://i.pravatar.cc/40?img=51' },
    ],
    serviceList: [
      { name: 'Hair Color', price: 600, duration: 120 },
      { name: 'Balayage', price: 800, duration: 150 },
      { name: 'Bridal Package', price: 1200, duration: 180 },
    ],
  },
]

const serviceFilters = ['All services', 'Haircut', 'Beard trim', 'Hair color', 'Manicure', 'Facials']

function CoverImage({ establishment }: { establishment: Establishment }) {
  return (
    <div className="relative h-36 overflow-hidden bg-stone-200">
      <img src={establishment.image} alt={`${establishment.name} interior`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2.5">
        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${establishment.isOpen ? 'bg-white/95 text-emerald-700' : 'bg-stone-900/75 text-white'}`}>
          {establishment.isOpen ? 'Open' : 'Closed'}
        </span>
        <span className="rounded-full bg-stone-950/65 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">{establishment.category}</span>
      </div>
      <button aria-label={`Save ${establishment.name}`} className="absolute bottom-2 right-2 grid size-8 place-items-center rounded-full bg-white/90 text-stone-700 shadow-sm backdrop-blur transition hover:bg-white">
        <Heart aria-hidden="true" className="size-3.5" />
      </button>
    </div>
  )
}

function EstablishmentCard({ establishment, onClick }: { establishment: Establishment; onClick: () => void }) {
  const visibleServices = establishment.services.slice(0, 2)
  const remainingCount = establishment.services.length - 2
  return (
    <article onClick={onClick} className="group cursor-pointer overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CoverImage establishment={establishment} />
      <div className="flex flex-col gap-3 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-base font-semibold tracking-tight text-stone-900 truncate">{establishment.name}</h3>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-stone-500"><MapPin aria-hidden="true" className="size-3" />{establishment.district}</div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-stone-700"><Star aria-hidden="true" className="size-3 fill-amber-400 text-amber-400" />{establishment.rating}<span className="text-stone-400 text-[10px]">({establishment.reviews})</span></div>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {visibleServices.map((service) => <span key={service} className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] text-stone-600">{service}</span>)}
          {remainingCount > 0 && <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] text-stone-600">+{remainingCount}</span>}
          <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-stone-200 px-2 py-0.5 text-[10px] text-stone-500"><Home className="size-2.5" />At Salon</span>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-stone-100 pt-2">
          <div><p className="text-[10px] uppercase tracking-widest text-stone-400">From</p><p className="mt-0.5 font-semibold text-xs text-stone-900">EGP {establishment.price}</p></div>
          <button onClick={(e) => { e.stopPropagation(); onClick() }} className="rounded-lg bg-stone-900 px-3 py-2 text-xs font-semibold text-white hover:bg-stone-700 transition">Book</button>
        </div>
      </div>
    </article>
  )
}

function SkeletonCard() {
  return <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white"><div className="h-36 animate-pulse bg-stone-200" /><div className="flex flex-col gap-3 p-3"><div className="h-4 w-3/5 animate-pulse rounded bg-stone-200" /><div className="h-3 w-2/5 animate-pulse rounded bg-stone-100" /><div className="flex gap-1"><div className="h-5 w-16 animate-pulse rounded-full bg-stone-100" /><div className="h-5 w-20 animate-pulse rounded-full bg-stone-100" /></div><div className="h-8 animate-pulse rounded-lg bg-stone-100" /></div></div>
}

function DetailView({ establishment, onBack, darkMode }: { establishment: Establishment; onBack: () => void; darkMode: boolean }) {
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null)
  const [selectedServices, setSelectedServices] = useState<Set<number>>(new Set())
  const [selectedDate, setSelectedDate] = useState<number>(0)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    return date
  })
  const totalPrice = Array.from(selectedServices).reduce((sum, idx) => sum + (establishment.serviceList?.[idx]?.price || 0), 0)
  const timeSlots = [
    { time: '09:00', period: 'Morning' },
    { time: '10:00', period: 'Morning' },
    { time: '11:00', period: 'Morning' },
    { time: '14:00', period: 'Afternoon' },
    { time: '15:00', period: 'Afternoon' },
    { time: '16:00', period: 'Afternoon' },
    { time: '18:00', period: 'Evening' },
    { time: '19:00', period: 'Evening' },
  ]

  const bgClass = darkMode ? 'bg-zinc-950' : 'bg-[#f7f5f1]'
  const cardClass = darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200/80'
  const textClass = darkMode ? 'text-white' : 'text-stone-900'
  const mutedClass = darkMode ? 'text-zinc-400' : 'text-stone-500'

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${bgClass}`}>
      <div className="mx-auto max-w-2xl">
        <div className={`sticky top-0 z-40 flex items-center justify-between border-b ${darkMode ? 'border-zinc-800 bg-zinc-900/95' : 'border-stone-200'} ${cardClass} px-5 py-4 backdrop-blur-md`}>
          <button onClick={onBack} className={`grid size-9 place-items-center rounded-full hover:${darkMode ? 'bg-zinc-800' : 'bg-stone-200/60'}`}>
            <ArrowLeft className="size-5" />
          </button>
          <h2 className={`font-serif text-lg font-semibold ${textClass}`}>{establishment.name}</h2>
          <button className={`grid size-9 place-items-center rounded-full`}>
            <Heart className="size-5" />
          </button>
        </div>

        <img src={establishment.image} alt={establishment.name} className="h-64 w-full object-cover" />

        <div className="px-5 py-6">
          <div className={`flex items-start justify-between gap-4 rounded-xl p-4 ${cardClass} border`}>
            <div>
              <h3 className={`font-serif text-2xl font-semibold ${textClass}`}>{establishment.name}</h3>
              <div className={`mt-2 flex items-center gap-1.5 ${mutedClass}`}>
                <MapPin className="size-4" />
                {establishment.district}
              </div>
              <div className={`mt-3 flex items-center gap-1 ${textClass}`}>
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{establishment.rating}</span>
                <span className={mutedClass}>({establishment.reviews} reviews)</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h4 className={`font-semibold ${textClass} mb-4`}>Select a Stylist</h4>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {establishment.staff?.map((person) => (
                <button
                  key={person.id}
                  onClick={() => setSelectedStaff(person.id)}
                  className={`shrink-0 flex flex-col items-center gap-2 px-3 py-2 rounded-lg transition ${selectedStaff === person.id ? (darkMode ? 'bg-blue-600' : 'bg-stone-900 text-white') : (darkMode ? 'bg-zinc-800' : 'bg-stone-100')}`}
                >
                  <div className="size-10 rounded-full bg-stone-300" />
                  <div className="text-center text-xs">
                    <p className={selectedStaff === person.id && !darkMode ? 'text-white' : textClass}>{person.name}</p>
                    <p className={`text-[10px] ${selectedStaff === person.id && !darkMode ? 'text-white' : mutedClass}`}>{person.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h4 className={`font-semibold ${textClass} mb-4`}>Select Services</h4>
            <div className="space-y-3">
              {establishment.serviceList?.map((service, idx) => (
                <label key={idx} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${selectedServices.has(idx) ? (darkMode ? 'border-blue-500 bg-blue-900/20' : 'border-stone-900 bg-stone-50') : (darkMode ? 'border-zinc-700 bg-zinc-800' : 'border-stone-200 bg-white')}`}>
                  <input
                    type="checkbox"
                    checked={selectedServices.has(idx)}
                    onChange={(e) => {
                      const newSet = new Set(selectedServices)
                      if (e.target.checked) newSet.add(idx)
                      else newSet.delete(idx)
                      setSelectedServices(newSet)
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className={`font-medium ${textClass}`}>{service.name}</p>
                    <p className={`text-sm ${mutedClass}`}>{service.duration} min</p>
                  </div>
                  <p className={`font-semibold ${textClass} shrink-0`}>EGP {service.price}</p>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h4 className={`font-semibold ${textClass} mb-4`}>Select Date</h4>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dates.map((date, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(idx)}
                  className={`shrink-0 rounded-lg px-4 py-3 text-center transition ${selectedDate === idx ? (darkMode ? 'bg-blue-600' : 'bg-stone-900 text-white') : (darkMode ? 'bg-zinc-800' : 'bg-white border border-stone-200')}`}
                >
                  <p className={`text-xs font-medium ${selectedDate === idx && !darkMode ? 'text-white' : mutedClass}`}>{dayNames[date.getDay()]}</p>
                  <p className={`text-lg font-bold ${selectedDate === idx && !darkMode ? 'text-white' : textClass}`}>{date.getDate()}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h4 className={`font-semibold ${textClass} mb-4`}>Select Time</h4>
            <div className="space-y-4">
              {['Morning', 'Afternoon', 'Evening'].map((period) => (
                <div key={period}>
                  <p className={`text-xs font-medium uppercase tracking-wider ${mutedClass} mb-2`}>{period}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.filter((slot) => slot.period === period).map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`rounded-lg py-2 text-xs font-medium transition ${selectedTime === slot.time ? (darkMode ? 'bg-blue-600' : 'bg-stone-900 text-white') : (darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-stone-100 hover:bg-stone-200')}`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 pb-24" />
        </div>
      </div>

      <div className={`fixed inset-x-0 bottom-0 z-40 mx-auto max-w-2xl border-t ${darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-stone-200 bg-white'} px-5 py-4 shadow-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs uppercase tracking-widest ${mutedClass}`}>Total</p>
            <p className={`text-2xl font-bold ${textClass}`}>EGP {totalPrice}</p>
          </div>
          <button disabled={selectedServices.size === 0 || !selectedTime} className={`rounded-xl px-6 py-3 font-semibold transition disabled:opacity-50 ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-stone-900 hover:bg-stone-700 text-white'}`}>
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  )
}

function ServiceShortcuts({ darkMode }: { darkMode: boolean }) {
  const actions = [
    { label: 'At Home', icon: DoorOpen },
    { label: 'Events & Bridal', icon: Sparkles },
    { label: 'Hair & Barbering', icon: Scissors },
    { label: 'Beauty & Care', icon: Heart },
  ]
  return (
    <section className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-4">
      {actions.map(({ label, icon: Icon }) => (
        <button key={label} className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium ${darkMode ? 'border-zinc-700 bg-zinc-900 text-zinc-200' : 'border-stone-200 bg-white text-stone-700 shadow-sm'}`}>
          <Icon className="size-4" />{label}
        </button>
      ))}
    </section>
  )
}

function RecommendationFeed({ establishments, darkMode, onBook, signedIn, gender }: { establishments: Establishment[]; darkMode: boolean; onBook: (item: Establishment) => void; signedIn: boolean; gender: 'For Her' | 'For Him' }) {
  const recommendations = establishments.filter((item) => !signedIn || item.gender === (gender === 'For Her' ? 'Women' : 'Men') || item.gender === 'Unisex')
  return (
    <section className="px-5 pt-7">
      <div className="mb-4 flex items-end justify-between"><div><p className={`text-[11px] font-medium uppercase tracking-[0.18em] ${darkMode ? 'text-zinc-500' : 'text-stone-500'}`}>Smart picks</p><h2 className={`mt-1 font-serif text-2xl font-semibold ${darkMode ? 'text-white' : 'text-stone-900'}`}>Recommended for You</h2></div><span className={`text-xs ${darkMode ? 'text-zinc-500' : 'text-stone-400'}`}>{signedIn ? 'Based on your profile' : 'Explore both'}</span></div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {recommendations.map((item) => <article key={item.id} className={`w-56 shrink-0 overflow-hidden rounded-2xl border ${darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-stone-200 bg-white'} shadow-sm`}>
          <img src={item.image} alt={`${item.name} recommendation`} className="h-28 w-full object-cover" />
          <div className="p-3"><div className="flex items-start justify-between gap-2"><h3 className={`truncate text-sm font-semibold ${darkMode ? 'text-white' : 'text-stone-900'}`}>{item.name}</h3><span className="flex shrink-0 items-center gap-0.5 text-xs"><Star className="size-3 fill-amber-400 text-amber-400" />{item.rating}</span></div><p className={`mt-1 text-xs ${darkMode ? 'text-zinc-400' : 'text-stone-500'}`}>{item.district} · From EGP {item.price}</p><div className="mt-2 flex items-center gap-1"><span className={`rounded-full px-2 py-1 text-[10px] ${darkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-stone-100 text-stone-600'}`}>{item.services[0]}</span><button onClick={() => onBook(item)} className={`ml-auto rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-white ${darkMode ? 'bg-blue-600' : 'bg-stone-900'}`}>Book</button></div></div>
        </article>)}
      </div>
    </section>
  )
}

function ExploreMap({ establishments, darkMode, onViewShop }: { establishments: Establishment[]; darkMode: boolean; onViewShop: (item: Establishment) => void }) {
  const [selectedPin, setSelectedPin] = useState<Establishment | null>(null)
  const [mapView, setMapView] = useState(true)
  return <section className="px-5 pt-5"><div className="mb-3 flex items-center justify-between"><h2 className={`font-serif text-xl font-semibold ${darkMode ? 'text-white' : 'text-stone-900'}`}>Nearby in Cairo</h2><div className={`flex rounded-lg p-1 ${darkMode ? 'bg-zinc-800' : 'bg-stone-200'}`}><button onClick={() => setMapView(true)} className={`rounded px-2 py-1 text-[10px] ${mapView ? 'bg-white text-stone-900' : darkMode ? 'text-zinc-400' : 'text-stone-500'}`}>Map</button><button onClick={() => setMapView(false)} className={`rounded px-2 py-1 text-[10px] ${!mapView ? 'bg-white text-stone-900' : darkMode ? 'text-zinc-400' : 'text-stone-500'}`}>List</button></div></div>{mapView ? <div className={`relative h-72 overflow-hidden rounded-2xl border ${darkMode ? 'border-zinc-800 bg-[#202728]' : 'border-stone-200 bg-[#dce5df]'}`}><div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(25deg, transparent 48%, #91a39c 49%, #91a39c 51%, transparent 52%), linear-gradient(115deg, transparent 48%, #91a39c 49%, #91a39c 51%, transparent 52%)', backgroundSize: '80px 80px' }} />{establishments.map((item, index) => <button key={item.id} onClick={() => setSelectedPin(item)} className={`absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white shadow-md ${selectedPin?.id === item.id ? 'bg-blue-600 text-white' : 'bg-stone-900 text-white'}`} style={{ left: `${20 + (index * 17) % 65}%`, top: `${25 + (index * 23) % 48}%` }} aria-label={`Select ${item.name}`}><MapPin className="size-4 fill-current" /></button>)}<button className="absolute bottom-3 left-3 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-stone-800 shadow">Search this area</button><button className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-lg bg-white text-stone-800 shadow" aria-label="My location"><LocateFixed className="size-4" /></button>{selectedPin && <div className={`absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-xl p-2 shadow-lg ${darkMode ? 'bg-zinc-900' : 'bg-white'}`}><img src={selectedPin.image} alt="" className="size-12 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className={`truncate text-xs font-semibold ${darkMode ? 'text-white' : 'text-stone-900'}`}>{selectedPin.name}</p><p className={`text-[10px] ${darkMode ? 'text-zinc-400' : 'text-stone-500'}`}>★ {selectedPin.rating} · From EGP {selectedPin.price}</p></div><button onClick={() => onViewShop(selectedPin)} className="rounded-lg bg-stone-900 px-2.5 py-2 text-[10px] font-semibold text-white">View Shop</button></div>}</div> : <div className="flex flex-col gap-3">{establishments.map((item) => <EstablishmentCard key={item.id} establishment={item} onClick={() => onViewShop(item)} />)}</div>}</section>
}

function ProfileScreen({ darkMode, textClass, mutedClass, cardClass, onToggleDarkMode, activeGender, setActiveGender, onSignOut }: { darkMode: boolean; textClass: string; mutedClass: string; cardClass: string; onToggleDarkMode: () => void; activeGender: 'For Her' | 'For Him'; setActiveGender: (value: 'For Her' | 'For Him') => void; onSignOut: () => void }) {
  const [language, setLanguage] = useState('English')
  const [reminders, setReminders] = useState(true)
  const [offers, setOffers] = useState(false)

  const SettingRow = ({ icon: Icon, label, value, onClick }: { icon: typeof UserRound; label: string; value?: string; onClick?: () => void }) => (
    <button onClick={onClick} className={`flex min-h-14 w-full items-center gap-3 border-b px-4 py-3 text-left last:border-0 ${darkMode ? 'border-zinc-800' : 'border-stone-100'}`}>
      <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${darkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-stone-100 text-stone-600'}`}><Icon className="size-4" /></span>
      <span className="min-w-0 flex-1"><span className={`block text-sm font-medium ${textClass}`}>{label}</span>{value && <span className={`mt-0.5 block truncate text-xs ${mutedClass}`}>{value}</span>}</span>
      <ChevronRight className={`size-4 shrink-0 ${mutedClass}`} />
    </button>
  )
  const ToggleRow = ({ icon: Icon, label, checked, onChange }: { icon: typeof Bell; label: string; checked: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={`flex min-h-14 w-full items-center gap-3 border-b px-4 py-3 text-left last:border-0 ${darkMode ? 'border-zinc-800' : 'border-stone-100'}`}>
      <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${darkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-stone-100 text-stone-600'}`}><Icon className="size-4" /></span><span className={`flex-1 text-sm font-medium ${textClass}`}>{label}</span><span className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-blue-600' : darkMode ? 'bg-zinc-700' : 'bg-stone-200'}`}><span className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${checked ? 'left-6' : 'left-1'}`} /></span>
    </button>
  )
  const sectionClass = `overflow-hidden rounded-2xl border ${darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-stone-200 bg-white'} shadow-sm`
  return <section className="px-5 pb-6 pt-5">
    <div className="mb-5 flex items-center justify-between"><h1 className={`font-serif text-3xl font-semibold ${textClass}`}>Profile</h1><button aria-label="Edit profile" className={`grid size-9 place-items-center rounded-full ${darkMode ? 'bg-zinc-800' : 'bg-white shadow-sm'} ${mutedClass}`}><Pencil className="size-4" /></button></div>
    <div className="flex items-center gap-4"><div className={`grid size-20 shrink-0 place-items-center rounded-full text-2xl font-semibold ring-4 ${darkMode ? 'bg-blue-900/60 text-blue-200 ring-zinc-950' : 'bg-blue-100 text-blue-700 ring-white'}`} aria-label="Amira Nabil initials">AN</div><div><h2 className={`text-lg font-semibold ${textClass}`}>Amira Nabil</h2><p className={`mt-1 flex items-center gap-1 text-sm ${mutedClass}`}><Phone className="size-3.5" />+20 100 123 4567 <Check className="size-3.5 text-blue-500" /></p><p className={`mt-1 text-xs ${mutedClass}`}>Member since 2024</p></div></div>
    <div className={`mt-6 grid grid-cols-3 divide-x rounded-2xl border py-4 ${darkMode ? 'divide-zinc-800 border-zinc-800 bg-zinc-900' : 'divide-stone-200 border-stone-200 bg-white'}`}><div className="text-center"><p className={`text-lg font-semibold ${textClass}`}>12</p><p className={`mt-1 text-[10px] ${mutedClass}`}>Bookings</p></div><div className="text-center"><p className={`text-lg font-semibold ${textClass}`}>2</p><p className={`mt-1 text-[10px] ${mutedClass}`}>Addresses</p></div><div className="text-center"><p className={`text-lg font-semibold ${textClass}`}>350</p><p className={`mt-1 text-[10px] ${mutedClass}`}>Wallet · EGP</p></div></div>
    <div className="mt-7 flex flex-col gap-5">
      <div><p className={`mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.16em] ${mutedClass}`}>Personal information</p><div className={sectionClass}><SettingRow icon={UserRound} label="Full Name" value="Amira Nabil" /><SettingRow icon={Mail} label="Email Address" value="amira.nabil@email.com" /><div className={`flex items-center gap-3 border-b px-4 py-3 ${darkMode ? 'border-zinc-800' : 'border-stone-100'}`}><span className={`grid size-8 place-items-center rounded-lg ${darkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-stone-100 text-stone-600'}`}><UsersRound className="size-4" /></span><span className={`flex-1 text-sm font-medium ${textClass}`}>Smart recommendations</span><div className={`flex rounded-lg p-0.5 ${darkMode ? 'bg-zinc-800' : 'bg-stone-100'}`}>{(['For Her', 'For Him'] as const).map((item) => <button key={item} onClick={() => setActiveGender(item)} className={`rounded-md px-2 py-1.5 text-[10px] font-semibold ${activeGender === item ? 'bg-blue-600 text-white' : mutedClass}`}>{item.replace('For ', '')}</button>)}</div></div></div></div>
      <div><p className={`mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.16em] ${mutedClass}`}>Saved addresses</p><div className={sectionClass}><SettingRow icon={Home} label="Home" value="New Cairo, 5th Settlement" /><SettingRow icon={MapPin} label="Work" value="Zamalek" /><button className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-blue-600"><Plus className="size-4" />Add New Address</button></div></div>
      <div><p className={`mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.16em] ${mutedClass}`}>Payment & wallet</p><div className={sectionClass}><div className={`flex items-center gap-3 border-b px-4 py-4 ${darkMode ? 'border-zinc-800' : 'border-stone-100'}`}><span className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white"><WalletCards className="size-4" /></span><span className="flex-1"><span className={`block text-sm font-semibold ${textClass}`}>CUTIT Wallet</span><span className={`text-xs ${mutedClass}`}>Available balance</span></span><span className={`text-sm font-bold ${textClass}`}>EGP 350</span><button aria-label="Top up wallet" className="grid size-7 place-items-center rounded-full bg-blue-50 text-blue-600"><Plus className="size-4" /></button></div><SettingRow icon={CreditCard} label="Saved cards" value="Visa ending in 4242" /><SettingRow icon={WalletCards} label="Default payment" value="Card" /></div></div>
      <div><p className={`mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.16em] ${mutedClass}`}>Preferences</p><div className={sectionClass}><ToggleRow icon={darkMode ? Moon : Sun} label="Appearance · Dark mode" checked={darkMode} onChange={onToggleDarkMode} /><div className={`flex min-h-14 items-center gap-3 border-b px-4 py-3 ${darkMode ? 'border-zinc-800' : 'border-stone-100'}`}><Languages className={`size-4 ${mutedClass}`} /><span className={`flex-1 text-sm font-medium ${textClass}`}>Language</span><div className={`flex rounded-lg p-0.5 ${darkMode ? 'bg-zinc-800' : 'bg-stone-100'}`}>{['English', 'العربية'].map((item) => <button key={item} onClick={() => setLanguage(item)} className={`rounded-md px-2 py-1.5 text-[10px] font-semibold ${language === item ? 'bg-blue-600 text-white' : mutedClass}`}>{item}</button>)}</div></div><ToggleRow icon={Bell} label="Appointment reminders" checked={reminders} onChange={() => setReminders(!reminders)} /><ToggleRow icon={Sparkles} label="Exclusive offers" checked={offers} onChange={() => setOffers(!offers)} /></div></div>
      <div><p className={`mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.16em] ${mutedClass}`}>Support & legal</p><div className={sectionClass}><SettingRow icon={MessageCircle} label="In-App Chat Support" value="Chat with our team" /><SettingRow icon={HelpCircle} label="FAQs" /><SettingRow icon={FileText} label="Report a booking issue" /><SettingRow icon={FileText} label="Terms of Service" /><SettingRow icon={FileText} label="Privacy Policy" /></div></div>
      <div className="flex flex-col gap-3"><button onClick={onSignOut} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold ${darkMode ? 'border-zinc-700 text-zinc-200' : 'border-stone-200 text-stone-800'}`}><LogOut className="size-4" />Log Out</button><button className="py-2 text-xs text-red-500"><Trash2 className="mr-1 inline size-3.5" />Delete Account</button></div>
    </div>
  </section>
}

function BookingsScreen({ darkMode, textClass, mutedClass, onExplore }: { darkMode: boolean; textClass: string; mutedClass: string; onExplore: () => void }) {
  const [tab, setTab] = useState<'Upcoming' | 'Past History'>('Upcoming')
  const [reviewOpen, setReviewOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const card = `rounded-2xl border ${darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-stone-200 bg-white'} shadow-sm`
  const upcoming = { name: 'The Grooming Society', district: 'New Cairo', image: establishments[0].image, stylist: 'Kareem', service: 'Haircut & Beard', total: 350, mode: 'In-Salon' }
  const past = { name: 'Luma Beauty House', district: 'Zamalek', image: establishments[1].image, date: 'June 14, 2024', total: 650 }
  return <section className="w-full pb-32">
    <header className={`sticky top-0 z-20 border-b px-5 py-4 backdrop-blur-md ${darkMode ? 'border-zinc-800 bg-zinc-950/90' : 'border-stone-200 bg-[#f7f5f1]/90'}`}><div className="flex items-center justify-between"><div><p className={`text-[11px] font-medium uppercase tracking-[0.18em] ${mutedClass}`}>Your visits</p><h1 className={`mt-1 font-serif text-2xl font-semibold ${textClass}`}>My Bookings</h1></div><button aria-label="Notifications" className={`relative grid size-10 place-items-center rounded-full border ${darkMode ? 'border-zinc-700 bg-zinc-900' : 'border-stone-200 bg-white'}`}><Bell className={`size-4 ${textClass}`} /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-blue-600" /></button></div><div className={`mt-5 flex rounded-xl p-1 ${darkMode ? 'bg-zinc-900' : 'bg-stone-200/70'}`}>{(['Upcoming', 'Past History'] as const).map((item) => <button key={item} onClick={() => setTab(item)} className={`flex-1 rounded-lg py-2.5 text-sm font-semibold ${tab === item ? (darkMode ? 'bg-zinc-800 text-white' : 'bg-white text-stone-900 shadow-sm') : mutedClass}`}>{item}</button>)}</div></header>
    <div className="flex flex-col gap-4 px-5 pt-5">{tab === 'Upcoming' ? <>
      <div className={`flex items-center gap-3 rounded-2xl px-4 py-4 ${darkMode ? 'bg-blue-950/50 text-blue-100' : 'bg-blue-50 text-blue-900'}`}><div className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white"><Clock3 className="size-5" /></div><div><p className="text-sm font-semibold">Your appointment is in 1 hour and 45 minutes</p><p className="mt-1 text-xs opacity-70">Today, 4:30 PM · Please arrive 10 minutes early</p></div></div>
      <article className={`${card} overflow-hidden`}><div className="flex gap-3 p-4"><img src={upcoming.image} alt="The Grooming Society" className="size-16 rounded-xl object-cover" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><h2 className={`truncate text-sm font-semibold ${textClass}`}>{upcoming.name}</h2><span className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] ${darkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-stone-100 text-stone-600'}`}>{upcoming.district}</span></div><span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">Confirmed</span></div></div></div><div className={`mx-4 flex items-center gap-3 border-y py-3 ${darkMode ? 'border-zinc-800' : 'border-stone-100'}`}><div className="grid size-9 place-items-center rounded-full bg-stone-200 text-xs font-semibold text-stone-700">KA</div><div className="flex-1"><p className={`text-sm font-medium ${textClass}`}>{upcoming.stylist} <span className={mutedClass}>(Master Barber)</span></p><p className={`mt-1 text-xs ${mutedClass}`}>{upcoming.service} · EGP {upcoming.total}</p></div></div><div className="flex items-center justify-between px-4 py-3"><span className={`flex items-center gap-1.5 text-xs font-medium ${textClass}`}><CalendarDays className="size-3.5" />Today, 4:30 PM</span><span className={`rounded-full px-2 py-1 text-[10px] font-medium ${darkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-stone-100 text-stone-600'}`}>In-Salon</span></div><div className={`flex w-full flex-wrap gap-2 border-t p-4 ${darkMode ? 'border-zinc-800' : 'border-stone-100'}`}><div className="flex w-full gap-2"><button className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold ${darkMode ? 'border-zinc-700 text-zinc-200' : 'border-stone-200 text-stone-700'}`}><PhoneCall className="size-3.5 shrink-0" />Call Venue</button><button className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold ${darkMode ? 'border-zinc-700 text-zinc-200' : 'border-stone-200 text-stone-700'}`}><MapPin className="size-3.5 shrink-0" />Get Directions</button></div><button className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white"><MessageCircle className="size-3.5 shrink-0" />WhatsApp Support</button><button className={`flex w-full items-center justify-center gap-1.5 py-1 text-xs font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}><HelpCircle className="size-3.5" />Need Help with this Booking?</button></div></article>
    </> : <>
      <article className={`${card} overflow-hidden`}><div className="flex gap-3 p-4"><img src={past.image} alt="Luma Beauty House" className="size-16 rounded-xl object-cover" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><h2 className={`truncate text-sm font-semibold ${textClass}`}>{past.name}</h2><p className={`mt-1 text-xs ${mutedClass}`}>{past.district} · {past.date}</p></div><span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">Completed</span></div><p className={`mt-3 text-sm font-semibold ${textClass}`}>Total paid · EGP {past.total}</p></div></div><div className={`grid grid-cols-2 gap-2 border-t p-4 ${darkMode ? 'border-zinc-800' : 'border-stone-100'}`}><button onClick={onExplore} className="rounded-xl bg-stone-900 py-2.5 text-xs font-semibold text-white">Rebook in 1-Tap</button><button onClick={() => setReviewOpen(true)} className={`rounded-xl border py-2.5 text-xs font-semibold ${darkMode ? 'border-zinc-700 text-zinc-200' : 'border-stone-200 text-stone-700'}`}>Leave a Review</button></div></article><article className={`${card} overflow-hidden`}><div className="flex gap-3 p-4"><div className={`grid size-16 place-items-center rounded-xl ${darkMode ? 'bg-zinc-800' : 'bg-stone-100'}`}><CalendarX2 className={`size-6 ${mutedClass}`} /></div><div><h2 className={`text-sm font-semibold ${textClass}`}>Maven Studio</h2><p className={`mt-1 text-xs ${mutedClass}`}>Maadi · May 02, 2024</p><span className="mt-3 inline-flex rounded-full bg-stone-200 px-2 py-1 text-[10px] font-semibold text-stone-600">Cancelled</span></div></div></article></>}
    </div>{reviewOpen && <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-4"><div className={`w-full max-w-2xl rounded-2xl p-5 ${darkMode ? 'bg-zinc-900' : 'bg-white'}`}><div className="flex items-center justify-between"><h2 className={`font-serif text-xl font-semibold ${textClass}`}>How was your visit?</h2><button onClick={() => setReviewOpen(false)} aria-label="Close review"><X className={mutedClass} /></button></div><p className={`mt-1 text-sm ${mutedClass}`}>Luma Beauty House</p><div className="flex justify-center gap-2 py-6">{[1,2,3,4,5].map((item) => <button key={item} onClick={() => setRating(item)} aria-label={`${item} stars`}><Star className={`size-8 ${item <= rating ? 'fill-amber-400 text-amber-400' : mutedClass}`} /></button>)}</div><button onClick={() => setReviewOpen(false)} disabled={!rating} className="w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white disabled:opacity-40">Submit Review</button></div></div>}
  </section>
}

export default function Page() {
  const [activeGender, setActiveGender] = useState<'For Her' | 'For Him'>('For Her')
  const [service, setService] = useState('All services')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('Home')
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)

  const filtered = useMemo(() => {
    return establishments.filter((item) => {
      const genderKey = activeGender === 'For Her' ? 'Women' : 'Men'
      const genderMatch = item.gender === genderKey || item.gender === 'Unisex'
      const serviceMatch = service === 'All services' || item.services.includes(service)
      const search = `${item.name} ${item.district} ${item.category} ${item.services.join(' ')}`.toLowerCase()
      return genderMatch && serviceMatch && search.includes(query.toLowerCase())
    })
  }, [activeGender, query, service])

  const resetFilters = () => {
    setActiveGender('For Her')
    setService('All services')
    setQuery('')
  }

  const previewLoading = () => {
    setLoading(true)
    window.setTimeout(() => setLoading(false), 1200)
  }

  const bgClass = darkMode ? 'bg-zinc-950' : 'bg-[#f7f5f1]'
  const headerBgClass = darkMode ? 'bg-zinc-950/95 border-zinc-800' : 'bg-[#f7f5f1]/95 border-stone-200/70'
  const cardClass = darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-stone-900'
  const textClass = darkMode ? 'text-white' : 'text-stone-900'
  const mutedClass = darkMode ? 'text-zinc-400' : 'text-stone-500'

  if (selectedEstablishment) {
    return <DetailView establishment={selectedEstablishment} onBack={() => setSelectedEstablishment(null)} darkMode={darkMode} />
  }

  return (
    <main className={`min-h-screen w-full overflow-x-hidden ${bgClass}`}>
      <div className={`mx-auto min-h-screen w-full max-w-md overflow-x-hidden px-4 ${bgClass} pb-24 ${!darkMode ? 'shadow-[0_0_60px_rgba(62,48,35,0.06)]' : ''}`}>
        {activeTab !== 'Profile' && activeTab !== 'Bookings' && <header className={`sticky top-0 z-20 border-b ${headerBgClass} px-5 py-4 backdrop-blur-md`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src="/cutit-logo.svg" alt="Cutit" className={`h-11 w-[88px] rounded-lg object-contain ${darkMode ? 'bg-zinc-950 invert' : 'bg-[#f7f5f1]'}`} />
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setDarkMode(!darkMode)} aria-label="Toggle dark mode" className={`grid size-9 place-items-center rounded-full ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-yellow-400' : 'text-stone-500 hover:bg-stone-200/60'}`}>
                {darkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>
              <button aria-label="Notifications" className={`grid size-9 place-items-center rounded-full ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-stone-200/60'} ${mutedClass}`}>
                <Bell className="size-4" />
              </button>
              <button aria-label="Open menu" className={`grid size-9 place-items-center rounded-full ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-stone-200/60'} ${mutedClass}`}>
                <Menu className="size-4" />
              </button>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <div>
              <p className={`text-[11px] font-medium uppercase tracking-[0.18em] ${mutedClass}`}>Discover in</p>
              <button className={`mt-1 flex items-center gap-1.5 text-sm font-semibold ${textClass}`}>
                <MapPin className="size-3.5" />
                Cairo, Egypt
                <ChevronRight className={`size-3.5 ${mutedClass}`} />
              </button>
            </div>
            <button onClick={() => setIsSignedIn(!isSignedIn)} aria-label="Toggle signed in recommendation profile" className={`grid size-10 place-items-center rounded-full border ${darkMode ? 'border-zinc-700 bg-zinc-800' : 'border-stone-200 bg-white'} text-sm font-semibold ${textClass}`}>{isSignedIn ? 'AN' : 'G'}</button>
          </div>
        </header>}

        {activeTab === 'Home' && <><ServiceShortcuts darkMode={darkMode} /><RecommendationFeed establishments={establishments} darkMode={darkMode} onBook={setSelectedEstablishment} signedIn={isSignedIn} gender={activeGender} /></>}
        {activeTab === 'Explore' && <ExploreMap establishments={filtered} darkMode={darkMode} onViewShop={setSelectedEstablishment} />}
        {activeTab === 'Bookings' && <BookingsScreen darkMode={darkMode} textClass={textClass} mutedClass={mutedClass} onExplore={() => setActiveTab('Explore')} />}

        {activeTab !== 'Profile' && activeTab !== 'Bookings' && <>
        <section className="px-5 pt-7">
          <p className={`text-sm font-medium ${mutedClass}`}>Good afternoon, Amira</p>
          <h1 className={`mt-1 max-w-sm font-serif text-3xl font-semibold leading-tight tracking-tight ${textClass}`}>
            Find your next <em className={`font-normal ${mutedClass}`}>signature look.</em>
          </h1>
        </section>

        <section className="px-5 pt-5">
          <div className={`flex rounded-xl ${darkMode ? 'bg-zinc-800' : 'bg-stone-200/70'} p-1`}>
            {(['For Her', 'For Him'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActiveGender(type)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${activeGender === type ? (darkMode ? 'bg-zinc-900 text-white shadow-sm' : 'bg-white text-stone-900 shadow-sm') : (darkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-stone-500 hover:text-stone-800')}`}
              >
                {type}
              </button>
            ))}
          </div>
        </section>

        <section className="px-5 pt-4">
          <label className={`flex items-center gap-3 rounded-xl border ${darkMode ? 'border-zinc-700 bg-zinc-900' : 'border-stone-200 bg-white'} px-4 py-3 shadow-sm`}>
            <Search aria-hidden="true" className={`size-4 ${mutedClass}`} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search salons, services..."
              className={`min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:${darkMode ? 'placeholder:text-zinc-600' : 'placeholder:text-stone-400'} ${textClass}`}
            />
            {query && (
              <button aria-label="Clear search" onClick={() => setQuery('')}>
                <X className={`size-4 ${mutedClass}`} />
              </button>
            )}
          </label>
        </section>

        <section className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-4">
          {serviceFilters.map((item) => (
            <button
              key={item}
              onClick={() => setService(item)}
              className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium transition ${service === item ? (darkMode ? 'border-blue-500 bg-blue-600 text-white' : 'border-stone-900 bg-stone-900 text-white') : (darkMode ? 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400')}`}
            >
              {item}
            </button>
          ))}
          <button aria-label="Open filters" className={`grid size-8 shrink-0 place-items-center rounded-full border ${darkMode ? 'border-zinc-700 bg-zinc-800' : 'border-stone-200 bg-white'} ${mutedClass}`}>
            <SlidersHorizontal className="size-3.5" />
          </button>
        </section>

        <section className={`mx-5 flex items-center justify-between rounded-2xl px-4 py-3.5 ${darkMode ? 'bg-zinc-800' : 'bg-[#e7dfd3]'}`}>
          <div className="flex items-center gap-3">
            <div className={`grid size-9 place-items-center rounded-xl ${darkMode ? 'bg-zinc-700' : 'bg-white/70'} ${darkMode ? 'text-zinc-200' : 'text-stone-700'}`}>
              <CalendarDays className="size-4" />
            </div>
            <div>
              <p className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-stone-800'}`}>Ready for a refresh?</p>
              <p className={`mt-0.5 text-[11px] ${darkMode ? 'text-zinc-400' : 'text-stone-600'}`}>Rebook your last appointment</p>
            </div>
          </div>
          <button className={`grid size-8 place-items-center rounded-full ${darkMode ? 'bg-zinc-900 text-zinc-300' : 'bg-stone-900 text-white'}`}>
            <ChevronRight className="size-4" />
          </button>
        </section>

        <section className="px-5 pt-7">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className={`text-[11px] font-medium uppercase tracking-[0.18em] ${mutedClass}`}>Curated for you</p>
              <h2 className={`mt-1 font-serif text-2xl font-semibold tracking-tight ${textClass}`}>
                Near you <span className={`font-sans text-sm font-normal ${mutedClass}`}>({filtered.length})</span>
              </h2>
            </div>
            <button onClick={previewLoading} className={`flex items-center gap-1 text-xs font-semibold ${darkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-stone-500 hover:text-stone-900'}`}>
              <RotateCcw className="size-3.5" />
              Refresh
            </button>
          </div>
          {loading ? (
            <div className="flex flex-col gap-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : filtered.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filtered.map((establishment) => (
                <EstablishmentCard key={establishment.id} establishment={establishment} onClick={() => setSelectedEstablishment(establishment)} />
              ))}
            </div>
          ) : (
            <div className={`flex flex-col items-center rounded-2xl border border-dashed ${darkMode ? 'border-zinc-700 bg-zinc-900/40' : 'border-stone-300 bg-white/60'} px-6 py-14 text-center`}>
              <div className={`grid size-14 place-items-center rounded-full ${darkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-stone-100 text-stone-500'}`}>
                <Search className="size-6" />
              </div>
              <h3 className={`mt-5 font-serif text-xl font-semibold ${textClass}`}>Nothing found in Cairo</h3>
              <p className={`mt-2 max-w-xs text-sm leading-6 ${mutedClass}`}>No salons or barbershops found matching your search in Cairo.</p>
              <Button onClick={resetFilters} className={`mt-5 rounded-xl ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-stone-900 hover:bg-stone-700'} text-white`}>
                Reset filters
              </Button>
            </div>
          )}
        </section>
        </>}
        {activeTab === 'Profile' && <ProfileScreen darkMode={darkMode} textClass={textClass} mutedClass={mutedClass} cardClass={cardClass} onToggleDarkMode={() => setDarkMode(!darkMode)} activeGender={activeGender} setActiveGender={setActiveGender} onSignOut={() => setIsSignedIn(false)} />}

        <nav className={`fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-2xl items-center justify-around border-t ${darkMode ? 'border-zinc-800 bg-zinc-900/95' : 'border-stone-200 bg-white/95'} px-3 py-3 backdrop-blur-md`} aria-label="Main navigation">
          {[{ label: 'Home', icon: Home }, { label: 'Explore', icon: Compass }, { label: 'Bookings', icon: Clock3 }, { label: 'Profile', icon: UserRound }].map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setActiveTab(label)}
              className={`flex min-w-16 flex-col items-center gap-1 text-[10px] font-medium transition ${activeTab === label ? (darkMode ? 'text-blue-400' : 'text-stone-900') : (darkMode ? 'text-zinc-500' : 'text-stone-400')}`}
            >
              <Icon className={`size-4 ${activeTab === label ? (darkMode ? 'fill-blue-400' : 'fill-stone-900') : ''}`} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </main>
  )
}
