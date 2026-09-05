'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,
  Compass,
  Heart,
  Home,
  MapPin,
  Menu,
  RotateCcw,
  Search,
  Scissors,
  SlidersHorizontal,
  Sparkles,
  Star,
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
}

const establishments: Establishment[] = [
  { id: 1, name: 'The Grooming Society', district: 'New Cairo', category: 'Barbershop', gender: 'Men', isOpen: true, rating: 4.9, reviews: 128, price: 250, services: ['Haircut', 'Beard trim', 'Hot towel'], image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=85' },
  { id: 2, name: 'Luma Beauty House', district: 'Zamalek', category: 'Beauty Salon', gender: 'Women', isOpen: true, rating: 4.8, reviews: 96, price: 450, services: ['Blow dry', 'Hair color', 'Manicure'], image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=85' },
  { id: 3, name: 'Maven Studio', district: 'Maadi', category: 'Beauty Salon', gender: 'Unisex', isOpen: false, rating: 4.7, reviews: 74, price: 320, services: ['Hair styling', 'Nails', 'Facials'], image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=85' },
  { id: 4, name: 'Blade & Brush', district: 'Heliopolis', category: 'Barbershop', gender: 'Men', isOpen: true, rating: 4.6, reviews: 51, price: 180, services: ['Haircut', 'Beard trim', 'Kids cut'], image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=85' },
  { id: 5, name: 'Serein Atelier', district: 'Sheikh Zayed', category: 'Beauty Salon', gender: 'Women', isOpen: true, rating: 4.9, reviews: 112, price: 600, services: ['Hair color', 'Balayage', 'Bridal'], image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=900&q=85' },
]

const serviceFilters = ['All services', 'Haircut', 'Beard trim', 'Hair color', 'Manicure', 'Facials']

function CoverImage({ establishment }: { establishment: Establishment }) {
  return (
    <div className="relative h-52 overflow-hidden bg-stone-200">
      <img src={establishment.image} alt={`${establishment.name} interior`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${establishment.isOpen ? 'bg-white/95 text-emerald-700' : 'bg-stone-900/75 text-white'}`}>
          {establishment.isOpen ? 'Open now' : 'Closed'}
        </span>
        <span className="rounded-full bg-stone-950/65 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">{establishment.category}</span>
      </div>
      <button aria-label={`Save ${establishment.name}`} className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-full bg-white/90 text-stone-700 shadow-sm backdrop-blur transition hover:bg-white">
        <Heart aria-hidden="true" className="size-4" />
      </button>
    </div>
  )
}

function EstablishmentCard({ establishment }: { establishment: Establishment }) {
  const [booked, setBooked] = useState(false)
  return (
    <article className="group overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CoverImage establishment={establishment} />
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl font-semibold tracking-tight text-stone-900">{establishment.name}</h3>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-stone-500"><MapPin aria-hidden="true" className="size-3.5" />{establishment.district}</div>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-sm font-medium text-stone-700"><Star aria-hidden="true" className="size-3.5 fill-amber-400 text-amber-400" />{establishment.rating}<span className="text-stone-400">({establishment.reviews})</span></div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {establishment.services.map((service) => <span key={service} className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600">{service}</span>)}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-3">
          <div><p className="text-[11px] uppercase tracking-wider text-stone-400">Starting from</p><p className="mt-0.5 font-semibold text-stone-900">EGP {establishment.price}</p></div>
          <Button onClick={() => setBooked(true)} className="rounded-xl bg-stone-900 px-4 text-xs font-semibold text-white hover:bg-stone-700" disabled={booked}>{booked ? 'Request sent' : 'Book appointment'}</Button>
        </div>
      </div>
    </article>
  )
}

function SkeletonCard() {
  return <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white"><div className="h-52 animate-pulse bg-stone-200" /><div className="flex flex-col gap-4 p-4"><div className="h-5 w-3/5 animate-pulse rounded bg-stone-200" /><div className="h-4 w-2/5 animate-pulse rounded bg-stone-100" /><div className="flex gap-2"><div className="h-6 w-20 animate-pulse rounded-full bg-stone-100" /><div className="h-6 w-24 animate-pulse rounded-full bg-stone-100" /></div><div className="h-10 animate-pulse rounded-xl bg-stone-100" /></div></div>
}

export default function Page() {
  const [activeType, setActiveType] = useState<'All' | 'Men' | 'Women'>('All')
  const [service, setService] = useState('All services')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('Explore')

  const filtered = useMemo(() => establishments.filter((item) => {
    const typeMatch = activeType === 'All' || item.gender === activeType || item.gender === 'Unisex'
    const serviceMatch = service === 'All services' || item.services.includes(service)
    const search = `${item.name} ${item.district} ${item.category} ${item.services.join(' ')}`.toLowerCase()
    return typeMatch && serviceMatch && search.includes(query.toLowerCase())
  }), [activeType, query, service])

  const resetFilters = () => { setActiveType('All'); setService('All services'); setQuery('') }
  const previewLoading = () => { setLoading(true); window.setTimeout(() => setLoading(false), 1200) }

  return (
    <main className="min-h-screen bg-[#f7f5f1] text-stone-900">
      <div className="mx-auto min-h-screen max-w-2xl bg-[#f7f5f1] pb-24 shadow-[0_0_60px_rgba(62,48,35,0.06)]">
        <header className="sticky top-0 z-20 border-b border-stone-200/70 bg-[#f7f5f1]/95 px-5 py-4 backdrop-blur-md">
          <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="grid size-9 place-items-center rounded-xl bg-stone-900 text-white"><Scissors aria-hidden="true" className="size-4" /></div><span className="font-serif text-xl font-semibold tracking-tight">Lustre</span></div><div className="flex items-center gap-1"><button aria-label="Notifications" className="grid size-9 place-items-center rounded-full text-stone-500 hover:bg-stone-200/60"><Bell className="size-4" /></button><button aria-label="Open menu" className="grid size-9 place-items-center rounded-full text-stone-500 hover:bg-stone-200/60"><Menu className="size-4" /></button></div></div>
          <div className="mt-5 flex items-center justify-between"><div><p className="text-[11px] font-medium uppercase tracking-[0.18em] text-stone-400">Discover in</p><button className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-stone-800"><MapPin className="size-3.5" />Cairo, Egypt<ChevronRight className="size-3.5 text-stone-400" /></button></div><div className="grid size-10 place-items-center rounded-full border border-stone-200 bg-white text-sm font-semibold text-stone-700">AN</div></div>
        </header>

        <section className="px-5 pt-7"><p className="text-sm font-medium text-stone-500">Good afternoon, Amira</p><h1 className="mt-1 max-w-sm font-serif text-3xl font-semibold leading-tight tracking-tight">Find your next <em className="font-normal text-stone-500">signature look.</em></h1></section>
        <section className="px-5 pt-5"><div className="flex rounded-xl bg-stone-200/70 p-1">{(['All', 'Men', 'Women'] as const).map((type) => <button key={type} onClick={() => setActiveType(type)} className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${activeType === type ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}>{type === 'All' ? 'All places' : type === 'Men' ? 'For him' : 'For her'}</button>)}</div></section>
        <section className="px-5 pt-4"><label className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm"><Search aria-hidden="true" className="size-4 text-stone-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search salons, services, areas..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400" />{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X className="size-4 text-stone-400" /></button>}</label></section>
        <section className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-4">{serviceFilters.map((item) => <button key={item} onClick={() => setService(item)} className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium transition ${service === item ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400'}`}>{item}</button>)}<button aria-label="Open filters" className="grid size-8 shrink-0 place-items-center rounded-full border border-stone-200 bg-white text-stone-500"><SlidersHorizontal className="size-3.5" /></button></section>

        <section className="mx-5 flex items-center justify-between rounded-2xl bg-[#e7dfd3] px-4 py-3.5"><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-xl bg-white/70 text-stone-700"><CalendarDays className="size-4" /></div><div><p className="text-xs font-semibold text-stone-800">Ready for a refresh?</p><p className="mt-0.5 text-[11px] text-stone-600">Rebook your last appointment</p></div></div><button className="grid size-8 place-items-center rounded-full bg-stone-900 text-white"><ChevronRight className="size-4" /></button></section>

        <section className="px-5 pt-7"><div className="mb-4 flex items-end justify-between"><div><p className="text-[11px] font-medium uppercase tracking-[0.18em] text-stone-400">Curated for you</p><h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight">Near you <span className="font-sans text-sm font-normal text-stone-400">({filtered.length})</span></h2></div><button onClick={previewLoading} className="flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-900"><RotateCcw className="size-3.5" />Refresh</button></div>
          {loading ? <div className="flex flex-col gap-4"><SkeletonCard /><SkeletonCard /></div> : filtered.length > 0 ? <div className="flex flex-col gap-4">{filtered.map((establishment) => <EstablishmentCard key={establishment.id} establishment={establishment} />)}</div> : <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-14 text-center"><div className="grid size-14 place-items-center rounded-full bg-stone-100 text-stone-500"><Search className="size-6" /></div><h3 className="mt-5 font-serif text-xl font-semibold">Nothing found in Cairo</h3><p className="mt-2 max-w-xs text-sm leading-6 text-stone-500">No salons or barbershops found matching your search in Cairo.</p><Button onClick={resetFilters} className="mt-5 rounded-xl bg-stone-900 text-white hover:bg-stone-700">Reset filters</Button></div>}
        </section>

        <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-2xl items-center justify-around border-t border-stone-200 bg-white/95 px-3 py-3 backdrop-blur-md" aria-label="Main navigation">{[{ label: 'Explore', icon: Compass }, { label: 'Bookings', icon: Clock3 }, { label: 'Saved', icon: Heart }, { label: 'Profile', icon: UserRound }].map(({ label, icon: Icon }) => <button key={label} onClick={() => setActiveTab(label)} className={`flex min-w-16 flex-col items-center gap-1 text-[10px] font-medium transition ${activeTab === label ? 'text-stone-900' : 'text-stone-400'}`}><Icon className={`size-4 ${activeTab === label ? 'fill-stone-900' : ''}`} /><span>{label}</span></button>)}</nav>
      </div>
    </main>
  )
}
