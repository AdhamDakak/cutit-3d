# Cutit — App Context

> Single source of truth for what this app is, how it's built, where it stands, and what should change next. Keep it updated as the app evolves.

_Last updated: 2026-09-16 (Cutit Go's At-Home/Events & Bridal pillars now have a complete booking flow — a real `Stylist` data model, a stylist detail screen, a 4-step `go-booking` wizard, and a shared `booking-confirmation` screen — and Venue detail's Confirm Booking now saves a real `Booking` record instead of showing an `Alert`)_

---

## 1. Product overview

**Cutit** is a mobile booking app for salons and barbershops in Egypt (launching with Cairo). Customers discover venues, pick a stylist + services + date/time, and book. The product vision covers three booking modes:

| Mode | Description | Status in app |
|---|---|---|
| **In-salon** | Book a slot at a venue (barbershop / beauty salon) | UI built end-to-end (mock data) |
| **At-home** | A barber / stylist / coiffeur comes to the customer | UI built end-to-end (mock data) — Cutit Go tab → gender toggle → stylist list → stylist detail → 4-step `go-booking` wizard → confirmation |
| **Events & Bridal** | Makeup artists, bridal packages, event styling | UI built end-to-end (mock data) — same flow as At-Home, plus optional event date/notes on the address step |

Key product traits:
- **Market**: Egypt. Prices in **EGP**, Cairo districts (New Cairo, Zamalek, Maadi, Heliopolis, Sheikh Zayed), phone-number auth (`+20`), English + Arabic (العربية) language toggle.
- **Personalisation**: a "For Her / For Him" gender toggle filters venues and drives "Recommended for You".
- **Customer-facing only**. There is no venue/partner side (no dashboard for salons to manage bookings, staff, or availability).

### Core user journey
`Onboarding (3 slides)` → `Auth (country code + phone → 6-digit OTP → profile)` or `Continue as Guest` → `Home` → pick a venue → `Venue detail` (stylist → services → date → time) → `Confirm Booking` → `Bookings` tab.

Auxiliary support flow, reachable from the header menu icon or Bookings/Profile: `Menu` → `Help` (Reschedule / Cancel / Chat Support) or `Chat Support` directly — all placeholder/local-state only, see §5.

---

## 2. Project history

1. **v0 (Vercel) phase** — the first ~40–50% of the UI was generated in v0 as a **Next.js + Tailwind web app**: one 700-line `app/page.tsx` that faked a phone frame with `max-w-md` centred in the browser. It had responsiveness problems (mismatched fixed widths, no safe-area handling, blocked pinch-zoom) because it was a web page pretending to be an app.
2. **Expo migration (2026-09-10)** — since the real target is native iOS/Android, the project was rebuilt as an **Expo + expo-router + NativeWind** app. The v0 screens were used as a design/copy reference only; every screen was rewritten with native primitives and real navigation. The old web scaffold was deleted.
3. **Current state** — UI-first prototype with mock data. No backend, no persistence, no payments. **The migration is not yet committed** (~50 changed files in the working tree; last commit `a84abb8` is still the v0 version).
4. **Post-migration feature pass (2026-09-11 → 2026-09-12)** — the Expo migration and everything since (auth screen redesign with a country-code picker and a 6-box OTP input, a full Fresha-style rebuild of Explore with `@gorhom/bottom-sheet`, three new screens — Chat Support, Help, Menu — wired up from existing entry points, and a venue-detail pass adding a reviews list, avatar/photo placeholders, and light/dark contrast fixes) is now committed as `1995cc8`, `07d2d15`, and `f9157a8`. The working tree is clean.
5. **Housekeeping + data-model pass (2026-09-12)** — committed as `a934122`, `5b510f8`, `daaf61a`, `8045eba`:
   - Fixed Menu's My Bookings/Help/Settings rows pushing their destination screen on top of the still-mounted menu modal instead of closing it (`router.dismissTo`).
   - Wired `react-native-svg-transformer` (infra only — `Logo` still renders the text wordmark on purpose, see §5); generated a real app icon, Android adaptive-icon layers, favicon, and light/dark splash art from a mark derived from the wordmark's scissors motif (previous files were the unmodified Expo template defaults); bundled Fraunces + Inter via `expo-font`/`@expo-google-fonts` in place of Georgia.
   - Replaced the single `Establishment` mock type with normalized `Venue`/`Staff`/`Service`/`TimeSlot`/`Booking`/`Review`/`User` types (see §6) — availability is now computed from venue hours + existing bookings + service duration instead of a hardcoded list, and "From EGP X" / "Open now" are derived instead of stored.
6. **Arabic + RTL pass (2026-09-13 → 2026-09-14, uncommitted)** — `i18next` + `react-i18next` + `expo-localization` wired via `lib/i18n.ts`, with `locales/en.json`/`ar.json` as the two resource files. Translated every screen under `app/` (root screens, all four tabs, venue detail) — roughly 70–80% of the app's strings; the `components/` group is not yet done. The language toggle in Profile is wired to `i18n.changeLanguage()` and persists via `AsyncStorage` (`lib/app-state.tsx`), correctly re-applying on the next launch via a hydration `useEffect` gated behind a `SplashGate` sibling component in `app/_layout.tsx` (deliberately *not* gating `<Stack>`'s own mount, to avoid re-triggering a mount-race warning fixed earlier in the session). **RTL layout mirroring itself remains unverified** — see §9.3 item 4 for the full status and the blocking issue.
7. **Favorites screen (2026-09-14, uncommitted)** — new `app/favorites.tsx` (modal, same header pattern as `help.tsx`), added a `Favorite` join type to `lib/data.ts` (matching the `Booking`/`Review` normalized-entity pattern rather than an `isFavorite` field on `Venue`), and shared `favoriteVenueIds`/`isFavorite`/`toggleFavorite` state in `lib/app-state.tsx`. Wired the previously-inert heart icons in `establishment-card.tsx` and `venue/[id].tsx` to this shared state, and Menu's Favorites row now navigates there via `dismissTo`. Fully translated (en/ar). See §9.9 for what's still incidental/pending from this pass.
8. **"Cutit Go" tab + At-Home/Events & Bridal entry screens (2026-09-16, uncommitted)** — added a 5th tab (`app/(tabs)/cutit-go.tsx`, `Scissors` icon, between Explore and Bookings) presenting "At Home" and "Events & Bridal" as two cards. Each pushes to a new modal screen (`app/at-home.tsx`, `app/events-bridal.tsx`) built around a new shared `components/gender-stylist-picker.tsx`: a "For Her"/"For Him" toggle with a filtered stylist list below it that updates immediately on toggle. There's no dedicated mobile-provider dataset yet, so the list reuses the existing venue-scoped `staff` table filtered by venue gender — a placeholder, not real mobile-provider data. Selecting a stylist still stubs to `/booking-flow?type=...&gender=...&staffId=...`, which **does not exist yet** (confirmed it correctly hits expo-router's "Unmatched Route" screen). The old `components/service-shortcuts.tsx` chip row (At Home / Events & Bridal / Hair & Barbering / Beauty & Care) was removed from Home entirely and the file deleted — once the first two chips moved to this tab, the remaining two were also removed per instruction, leaving nothing in that component to render. Fully translated (en/ar), RTL conventions applied. See §9.10.
9. **Real `Stylist` data model + `booking-flow`/stylist-detail rebuild (2026-09-16, session 2, committed `88109db`)** — replaced the "reuse venue staff as a placeholder" approach from #8 with a proper `Stylist` entity in `lib/data.ts` (`isFreelancer`, `venueId: string | null`, `serviceTypes`, `servesGender`, `specialties`, `bio`, `portfolioPhotos`, `priceFrom`, `yearsExperience?`, `availability`) and 7 mock stylists spanning freelance/venue-affiliated and at-home/events-bridal. `components/gender-stylist-picker.tsx` and `app/at-home.tsx`/`app/events-bridal.tsx` were deleted and replaced by one parameterized `app/booking-flow.tsx?type=at-home|events-bridal` (its own local "For Her"/"For Him" toggle, deliberately not the shared `activeGender`) rendering the new `components/stylist-card.tsx`, which pushes to a new `app/stylist/[id].tsx` detail screen (bio, specialties, portfolio, reviews, and a "Book" button that at this point was still a `console.log` stub). This pass also laid groundwork for #10 without wiring it up yet: `Booking` gained `bookingType`/`stylistId`/`addressId` fields, a new `Address` type was added, and `lib/travel-fee.ts` (flat base fee + a per-Cairo-area surcharge table) was created but unused until the next entry.
10. **Full Cutit Go booking flow (2026-09-16, session 3, committed `68725dc`)** — built the actual wizard that `stylist/[id].tsx`'s "Book" button now opens: a nested `app/go-booking/_layout.tsx` `<Stack>` registered as a *single* `presentation: 'modal'` group in the root layout (so all 4 steps push sideways inside one modal instead of stacking as separate modals) holding `services.tsx` (multi-select services + running subtotal) → `address.tsx` (saved addresses + an inline "add new address" form, plus optional event date/notes fields when `type === 'events-bridal'`) → `datetime.tsx` (day picker + duration-aware time-slot grid via a new `generateStylistTimeSlots()` helper that reads the stylist's own `availability`) → `review.tsx` (full summary, `calculateTravelFee()`, "Confirm Booking"). The wizard's in-progress selections (chosen services, address, date/time) live in a `GoBookingDraftContext` scoped to the `go-booking` route group — not in `AppStateProvider` — and only the finished `Booking` gets committed to shared state via `addBooking()`. Added a shared `app/booking-confirmation.tsx` (root-level modal, handles both salon and Go bookings) that this flow *and* Venue detail's "Confirm Booking" now both route to, replacing the old `Alert`-based confirmation on the venue screen. Verified end-to-end with Playwright (guest → Cutit Go → At Home → stylist → services → address → date/time → review → confirm → Bookings tab) with zero console/page errors; Playwright itself was removed afterward (dev-only, not a project dependency).

---

## 3. Tech stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | Expo SDK 57 (managed), React Native 0.86, React 19.2 | New Architecture (default in SDK 57) |
| Routing | `expo-router` ~57 | File-based; Stack + Tabs; typed routes enabled |
| Styling | NativeWind 4.2 + Tailwind CSS **3.4** | `darkMode: 'class'`; do **not** upgrade to Tailwind 4 (NativeWind 4 targets v3) |
| Icons | `lucide-react-native` (+ `react-native-svg`) | Same icon set the v0 design used |
| SVG components | `react-native-svg-transformer` | Wired into `metro.config.js` so `.svg` files import as components (`svg.d.ts` types them); not yet used by any screen — see §5's `Logo` note |
| Fonts | `expo-font` + `@expo-google-fonts/fraunces` + `@expo-google-fonts/inter` | Loaded via `useFonts()` in `app/_layout.tsx`; splash screen stays up (`expo-splash-screen`) until they're ready |
| Images | `expo-image` | Remote Unsplash / pravatar URLs for now |
| Bottom sheets | `@gorhom/bottom-sheet` ~5.2 | Powers Explore's draggable map/list panel; peer deps (`react-native-reanimated`, `react-native-gesture-handler`) were already installed |
| i18n | `i18next` + `react-i18next` + `expo-localization` | `lib/i18n.ts`; resources in `locales/en.json`/`ar.json`; see §2.6 |
| Persistence | `@react-native-async-storage/async-storage` | Only the language preference is persisted so far (`lib/app-state.tsx`) — **must be installed via `npx expo install`, not plain `pnpm add`**: a plain install once pulled an npm-latest version whose native module didn't match what Expo Go SDK 57 bundles, causing "Native module is null" crashes on-device (web was unaffected since AsyncStorage's web adapter has no native module) |
| Dev builds | `expo-dev-client` + `eas.json` (`development` profile) | For testing outside Expo Go (e.g. verifying real `I18nManager.forceRTL` behavior) — no build has been run yet; blocked on Apple Developer account access for iOS, Android EAS build untried |
| Safe areas | `react-native-safe-area-context` | Every screen wraps in `SafeAreaView` |
| Language | TypeScript 6 (strict) | `pnpm typecheck` |
| Package manager | pnpm 10 with **`node-linker=hoisted`** (`.npmrc`) | Required: Metro can't resolve `react-native-css-interop` under pnpm's strict layout |

### Commands
```bash
pnpm install
pnpm start            # expo start → QR / i / a / w
pnpm ios | android | web
pnpm typecheck        # tsc --noEmit
npx expo-doctor       # 21/21 checks passed as of migration; a few packages have since drifted a patch version behind the SDK (non-blocking — `npx expo install --check` to review)
```

---

## 4. Project structure

```
app/                      expo-router routes
  _layout.tsx             Root Stack + providers (GestureHandlerRootView, SafeAreaProvider, AppStateProvider, StatusBar); registers go-booking and booking-confirmation as modal route groups
  index.tsx               Redirect → /onboarding or /(tabs) based on hasOnboarded
  onboarding.tsx          3-slide carousel; "Get Started" → /auth, "Continue as Guest" → /(tabs)
  auth.tsx                Country code picker + phone → 6-box auto-advancing OTP → profile (all client-side, no real OTP)
  chat-support.tsx        Modal: local-state chat UI (seeded support greeting, send appends to a list, no backend)
  help.tsx                Modal: Reschedule/Cancel Booking (placeholder actions) + a Chat Support row
  favorites.tsx           Modal: favorited venues (via EstablishmentCard) or an empty state with a "Browse venues" CTA
  booking-flow.tsx        Card push (not modal): "For Him"/"For Her" toggle (local-only) + StylistCard list filtered by type (`at-home`/`events-bridal`) and gender; forwards `type` into /stylist/[id]
  stylist/[id].tsx        Card push: stylist detail (bio, specialties, portfolio, reviews); "Book" pushes into the go-booking modal group with stylistId+type
  go-booking/             Nested Stack, opened as one modal group (presentation set once on the group in the root layout, not per-step)
    _layout.tsx           Declares the 4-step <Stack> + GoBookingDraftContext (selected services, address, event date/notes, date/time) — scoped to this flow only, not AppStateProvider
    services.tsx          Step 1: stylist's services as multi-select rows, running subtotal, Continue disabled until ≥1 selected
    address.tsx           Step 2: saved addresses (from useAppState) as selectable cards + inline "add new address" form; optional event date/notes when type is events-bridal
    datetime.tsx          Step 3: day picker + time-slot grid sized to the selected services' total duration, via generateStylistTimeSlots()
    review.tsx            Step 4: full summary + calculateTravelFee(); "Confirm Booking" builds a Booking, calls addBooking(), routes to /booking-confirmation
  booking-confirmation.tsx  Root-level modal shared by both salon and Go bookings: looks up the booking by id from useAppState().bookings, renders a status-aware summary, "Add to Calendar" (placeholder), "View in Bookings" (dismissAll + replace)
  menu.tsx                Modal: Favorites (→ /favorites) / My Bookings / Help / Settings / Sign Out, opened from the header ≡ icon
  (tabs)/
    _layout.tsx           Bottom tabs: Home / Explore / Cutit Go / Bookings / Profile (lucide icons, theme-aware)
    index.tsx             Home
    explore.tsx           Fresha-style rebuild: full-bleed map background + draggable `@gorhom/bottom-sheet` list (3 snap points), fixed search bar / Venues-Professionals-Anytime filter row / day-picker row on top
    cutit-go.tsx           "At Home" / "Events & Bridal" selection cards → /booking-flow?type=...
    bookings.tsx          Upcoming / Past History; reads useAppState().bookings, so a freshly-confirmed booking is included in the same session
    profile.tsx           Profile & settings
  venue/[id].tsx          Venue detail + booking flow (modal): stylist/service/date/time picker, written reviews list; Confirm Booking now builds a real Booking via addBooking() and routes to /booking-confirmation (previously just an Alert)
components/
  app-header.tsx          Logo, dark-mode toggle, bell, menu (→ /menu), "Discover in Cairo", guest/user avatar toggle
  country-code-picker.tsx Pressable segment + modal list of ~11 country dial codes, used by auth.tsx
  establishment-card.tsx  Venue card (cover, open/closed, rating, services, price, Book, wired favorite heart)
  recommendation-feed.tsx Horizontal "Recommended for You" (gender-filtered when signed in) — its own bespoke card, does NOT use EstablishmentCard, so it has no heart/favorite button at all
  stylist-card.tsx        Stylist row (photo/initials, specialties, rating, "From EGP X") used by booking-flow.tsx; replaced gender-stylist-picker.tsx (deleted, see §2.9)
  explore-map.tsx         Pure background layer now: diagonal-line pattern + pins rendered as star+rating badges (no popup card)
  review-modal.tsx        Bottom-sheet star rating + always-optional text field, used by Bookings and Venue (no more requireText)
  settings-rows.tsx       SettingRow / ToggleRow, used by Profile and now Menu/Help too
  skeleton-card.tsx       Loading placeholder
  logo.tsx                Text wordmark "cut**it**" — intentionally still a placeholder; the SVG import path (`assets/images/cutit-logo.svg` via react-native-svg-transformer) is wired but unused until a final logo asset is ready
lib/
  data.ts                 Venue/Staff/Stylist/Service/TimeSlot/Booking/Address/Review/User/Favorite types; normalized mock tables (venues, staff, stylists, services, reviews, bookings, favorites, currentUser) plus derived helpers (getVenueStaff/Services/Reviews, getStylistServices/Reviews, getStylistsByType, getVenueStartingPrice, isVenueOpenNow, generateTimeSlots, generateStylistTimeSlots) — see §6
  travel-fee.ts           calculateTravelFee(area) — flat base fee + a per-Cairo-area surcharge table, used by the go-booking review step
  app-state.tsx           React Context: hasOnboarded, isSignedIn, activeGender, language (persisted), favoriteVenueIds, bookings (+ addBooking), addresses (+ addAddress); see §2.6/§2.7/§2.10
  i18n.ts                 i18next + react-i18next init, loads locales/en.json and locales/ar.json as resources
  theme.ts                useThemeColors() → hex colours for icons (icons can't use `dark:` classes)
locales/
  en.json / ar.json       i18next translation resources — nested by screen (onboarding, auth, menu, help, chatSupport, tabs, home, explore, bookings, profile, venue, favorites, cutitGo, bookingFlow, stylist, goBooking, bookingConfirmation) plus a shared "common"/"gender" namespace
assets/images/            Cutit-branded icon.png / android-icon-*.png / favicon.png / splash-icon(-dark).png (derived from cutit-mark.svg, a crop of the wordmark's scissors motif) + the full cutit-logo.svg wordmark
global.css                Tailwind directives (imported once in app/_layout.tsx)
tailwind.config.js        NativeWind preset; fontFamily.serif = Fraunces_600SemiBold, fontFamily.sans = Inter_400Regular
babel.config.js / metro.config.js   NativeWind wiring + react-native-svg-transformer (.svg → component)
svg.d.ts                  Types `*.svg` imports as React components
eas.json                  `development` build profile (developmentClient + internal distribution) for testing outside Expo Go — no build run yet
```

~4,250 lines of app code.

---

## 5. Screens & feature inventory

Legend: ✅ works (with mock data) · 🟡 visual only, no handler · ❌ missing

### Onboarding / Auth
- ✅ Slide carousel with dots, Continue / Get Started, Continue as Guest
- ✅ Country code picker (pressable segment + modal list, defaults to Egypt `+20`) prefixed onto the phone number
- ✅ 6-box OTP input with auto-advancing focus, backspace-to-previous, and auto-submit the instant all 6 digits are filled
- ✅ Profile step (name/email) with disabled-state validation; "Continue as Guest" is a pinned, underlined footer on both the phone and OTP screens
- 🟡 "Resend code in 30s" is static text; OTP accepts any 6 digits (never actually verified); email field is unbound

### Home
- ✅ Header (dark-mode toggle, guest/user avatar toggle that flips `isSignedIn`, menu icon → `/menu`)
- ✅ Gender toggle, search, service filter chips, "Near you" list with skeleton + empty state + Refresh
- ✅ Recommended for You feed (gender-aware when signed in)
- ✅ "Near you" list cards' heart icon now toggles real shared favorite state (see §6) — the Recommended for You feed above it has no heart at all (bespoke card, doesn't use `EstablishmentCard`)
- 🟡 Bell, "Cairo, Egypt" picker, filters button, rebook banner
- The service-shortcuts chip row (At Home / Events & Bridal / Hair & Barbering / Beauty & Care) that used to sit here is gone — At Home/Events & Bridal moved to the new Cutit Go tab below, and the remaining two chips were removed with it (no replacement filter chips on Home currently)

### Explore
- ✅ Full-bleed map background with a draggable `@gorhom/bottom-sheet` list on top (peeks at ~22%, drags down to ~14% to reveal the map, up to ~92% to cover the screen — scrolling the list also expands it via the sheet's built-in gesture handoff)
- ✅ Fixed top chrome (search bar, Venues/Professionals toggle, "Anytime" dropdown, sliders icon, horizontal day-picker) stays pinned above the sheet at every drag position
- ✅ Map pins render as star + rating badges; tapping one highlights it (blue)
- 🟡 The top search bar is now a static "All treatments / Current location" pressable (no handler) — Explore lost free-text filtering when the old TextInput-based search bar was replaced; gender filter (from context) is the only thing still actually filtering the list
- 🟡 "Venues"/"Professionals" toggle, "Anytime" dropdown, and the sliders/list-filter icon buttons are all visual only; map is still the CSS-pattern placeholder, not a real map

### Cutit Go (`/(tabs)/cutit-go`, tab) → Booking Flow → Stylist Detail → Go Booking (4 steps) → Confirmation
- ✅ Cutit Go tab shows two cards ("At Home", "Events & Bridal") that each push (card, not modal) into `booking-flow.tsx?type=...`
- ✅ `booking-flow.tsx` has its own local "For Him"/"For Her" toggle (defaults from `activeGender` but never writes back to it) and lists `StylistCard`s filtered by `getStylistsByType(type)` + `servesGender` — verified both directions show different, correct stylists
- ✅ Tapping a stylist forwards `type` into `/stylist/[id]`, a full detail screen (photo, specialties, rating, bio, years of experience, "Available for" badges, portfolio grid, written reviews) — previously this route didn't exist; now it does, with a real "Book {name}" button
- ✅ "Book" pushes into the `go-booking` modal group (`stylistId`+`type` as route params) — a 4-step wizard: **Services** (multi-select, running subtotal) → **Address** (saved addresses + inline add-new form, optional event date/notes for `events-bridal`) → **Date & Time** (day picker + duration-aware slots via `generateStylistTimeSlots()`) → **Review** (full summary, `calculateTravelFee()`, "Confirm Booking")
- ✅ Confirming builds a real `Booking` (`bookingType: 'at-home' | 'events-bridal'`, `stylistId`, `addressId`, `travelFeeEGP`, computed `endTime`), calls `addBooking()`, and routes to the shared `/booking-confirmation` screen
- ✅ Verified end-to-end with Playwright — full guest → Cutit Go → stylist → all 4 steps → confirmation → Bookings tab run, zero console/page errors
- 🟡 The `Stylist` entity (see §6) is a real, dedicated data model now (not borrowed salon `staff`), but it's still only 7 hand-written mock rows — no real mobile-provider onboarding/CRUD exists
- 🟡 Wizard draft state (`GoBookingDraftContext`) is lost if the app reloads mid-flow — acceptable for a modal wizard, but worth knowing if deep-linking into a specific step is ever wanted

### Venue detail / booking (`/venue/[id]`)
- ✅ Stylist picker (with a placeholder avatar icon when a staff member has no photo), service multi-select with search, 7-day date strip, live total, Confirm gated on ≥1 service + a time
- ✅ Time slots are now availability-aware: `generateTimeSlots()` derives them from the venue's opening hours, the selected staff member's existing bookings, and the selected services' combined duration — a slot overlapping a booking (or landing in the standing lunch-break rule) renders disabled rather than always showing a fixed list
- ✅ Venue cover photo falls back to a bordered placeholder block (camera/image icon) if `venue.coverImageUrl` is ever null
- ✅ Written reviews list below the aggregate rating (initials avatar, star rating, text) sourced from `getVenueReviews(venue.id)`; Write a Review modal (rating + always-optional text)
- ✅ Header heart icon toggles real shared favorite state (fills red when favorited)
- ✅ Confirm now builds a real `bookingType: 'salon'` `Booking`, calls `addBooking()`, and routes to the shared `/booking-confirmation` screen — previously just showed a native `Alert` and saved nothing
- 🟡 Submitting a review still doesn't append to the reviews table

### Booking Confirmation (`/booking-confirmation`, modal)
- ✅ Shared by both salon bookings (venue detail) and Go bookings (the go-booking wizard); looks the booking up by `bookingId` from `useAppState().bookings` and renders a status icon, a summary card (venue+staff for salon, stylist+address+travel fee for Go), date/time, and total
- ✅ "View in Bookings" does `router.dismissAll()` then `replace('/(tabs)/bookings')`, correctly clearing the whole booking-flow/venue stack rather than leaving it underneath
- 🟡 "Add to Calendar" is a placeholder (no `expo-calendar` integration yet)

### Bookings
- ✅ Upcoming (live countdown banner computed from the booking's real `startTime`, confirmed card, stylist, Call Venue / Get Directions) / Past (completed + cancelled cards), Leave a Review modal, Rebook → Explore
- ✅ Sourced from `useAppState().bookings` (seeded from `lib/data.ts`'s mock table, but now a real stateful array that `addBooking()` appends to) joined against `venues`/`staff`/`stylists`/`services`/`addresses` by id
- ✅ "Need Help with this Booking?" now navigates to `/help`
- 🟡 The Upcoming tab shows a single representative booking via `.find(b => b.status === 'confirmed')`, not a list — a freshly-confirmed second booking is correctly added to `bookings` (confirmed with Playwright) but won't visibly appear here unless it's the *first* confirmed one found. This is a pre-existing simplification of this screen, not something the new booking flow changed; worth revisiting if multiple simultaneous upcoming bookings becomes a real scenario.
- 🟡 Still not persisted across reloads; Call / Directions have no handlers; no cancel or reschedule from this screen itself (WhatsApp Support button was removed — that entry point now lives in Help instead)

### Profile
- ✅ Dark-mode toggle (NativeWind `useColorScheme`), gender toggle (shared context), language toggle, reminder/offers toggles, Log Out (→ onboarding)
- ✅ "In-App Chat Support" row now navigates to `/chat-support`
- 🟡 Hardcoded "Amira Nabil" user, stats, addresses, wallet, cards; language toggle changes nothing; every other SettingRow, Add Address, Top up, Edit, Delete Account are inert

### Chat Support (`/chat-support`, modal)
- ✅ Message list seeded with one support greeting; typing and sending appends a right-aligned bubble to local `useState`, left-aligned bubbles for support
- 🟡 No backend — messages aren't sent anywhere, nothing persists, support never actually replies

### Help (`/help`, modal)
- ✅ "Reschedule Booking" / "Cancel Booking" buttons (styled from `bookings.tsx`'s button patterns) and a "Chat Support" row → `/chat-support`
- 🟡 Reschedule/Cancel just `console.log` a placeholder — no booking to act on yet, no real mutation

### Menu (`/menu`, modal)
- ✅ Opened from the header ≡ icon; Favorites (→ `/favorites`) / My Bookings (→ Bookings tab) / Help (→ `/help`) / Settings (→ Profile tab) / Sign Out (same pattern as Profile's Log Out)

### Favorites (`/favorites`, modal)
- ✅ Lists favorited venues via the reused `EstablishmentCard`; empty state (heart icon + message + "Browse venues" → Explore) when there are none
- ✅ Un-favoriting a card here (or anywhere else) updates this list immediately — all favorite state is shared through `lib/app-state.tsx`
- 🟡 Favorite state resets on reload — not persisted (same as most of `AppStateProvider`; only `language` is persisted so far)

---

## 6. State & data model

- **Server state**: none — `lib/data.ts` exports static, normalized mock tables. Screens read them through `useMemo` filters or the derived-data helpers below, not by reaching into nested objects.
- **App state** (`lib/app-state.tsx`): `hasOnboarded`, `isSignedIn`, `activeGender`, `favoriteVenueIds` (a `Set<string>`), `bookings` (+ `addBooking`), `addresses` (+ `addAddress`), `language` (persisted) in a React Context. **Resets on every app launch/reload** — nothing is persisted except `language` (written to `AsyncStorage` on change, re-applied via a hydration `useEffect` on startup, see §2.6). `bookings`/`addresses` are real `useState` seeded from the mock tables — `addBooking()`/`addAddress()` append to them, so a booking made in the go-booking wizard or on a venue page is immediately visible elsewhere in the same session (e.g. the Bookings tab), just not across a reload.
- **Theme**: NativeWind's built-in colour scheme (`useColorScheme()` from `nativewind`); follows the system by default, toggled from the header or Profile. Also not persisted.
- **Go-booking wizard draft** (`app/go-booking/_layout.tsx`'s `GoBookingDraftContext`): selected service ids, chosen address id, event date/notes, selected date/time — scoped to the 4-step flow only, deliberately **not** part of `AppStateProvider` since it's meaningless outside an in-progress booking. Only the finished `Booking` object crosses into shared state, via `addBooking()`.
- **Venue-detail booking selection** lives in local `useState` inside `venue/[id].tsx` (separate from the go-booking draft above, since salon booking is a single screen, not a wizard) and is discarded once `addBooking()` fires.

`lib/data.ts` types (deliberately shaped to match what a real Supabase backend would return — normalized tables keyed by `venueId`/`staffId`/etc., not deeply nested object literals):

```ts
type Venue = {
  id; name; coverImageUrl: string | null; address; area; city; latitude; longitude
  rating; reviewCount; category: 'Barbershop' | 'Beauty Salon'
  gender: 'Men' | 'Women' | 'Unisex'        // drives the For Her/For Him filter — not in the original spec, kept because Home/Explore depend on it
  servicesOffered: string[]                  // loose marketing tags (badges/search), separate from the Service catalog below
  description; openingHours: Record<DayOfWeek, { open; close } | null>
}
type Staff = { id; venueId; name; role; photoUrl: string | null; rating? }
type Stylist = {                             // a Cutit Go mobile/event provider — distinct from venue-scoped Staff
  id; name; isFreelancer; venueId: string | null
  serviceTypes: ('at-home' | 'events-bridal')[]
  servesGender: ('male' | 'female')[]        // who this stylist serves, not who they are
  specialties: string[]; rating; reviewCount; bio; photoUrl: string | null; portfolioPhotos: string[]
  priceFrom; yearsExperience?
  availability: OpeningHours                 // same shape as Venue.openingHours, no per-day exceptions yet
}
type Service = { id; venueId: string | null; stylistId?; name; durationMinutes; priceEGP; category }
type TimeSlot = { id; venueId; staffId; serviceId; startTime; endTime; status: 'available' | 'booked' | 'blocked' }
type Address = { id; label; area; details; latitude?; longitude? }
type Booking = {
  id; userId; bookingType: 'salon' | 'at-home' | 'events-bridal'
  venueId: string | null; staffId: string | null; stylistId: string | null; addressId: string | null
  travelFeeEGP?; eventDate?; eventNotes?
  serviceIds: string[]; startTime; endTime; status: 'confirmed' | 'completed' | 'cancelled'; priceEGP; createdAt
}
type Review = { id; bookingId; venueId; userId; rating; text: string | null; authorName; createdAt }
type User = { id; fullName; email; phone; avatarUrl: string | null; gender; addresses: Address[]; walletBalance }
type Favorite = { id; userId; venueId; createdAt }   // a user↔venue join, not an isFavorite field on Venue — matches the Booking/Review pattern
```

Mock tables: `venues`, `staff`, `stylists`, `services`, `reviews`, `bookings`, `favorites`, `currentUser`, plus `serviceFilters` (unchanged). `AppStateProvider` hydrates its live `favoriteVenueIds` Set from `favorites` once on mount, filtered to `currentUser.id`; `toggleFavorite(venueId)` then owns it from there (the `favorites` array itself isn't mutated). Derived-data helpers stand in for what would be backend queries/RPCs:
- `getVenueStaff/Services/Reviews(venueId)`, `getStylistServices/Reviews(stylistId)`, `getStylistsByType(type)` — the joins a real `select('*, staff(*), services(*)')` query would do.
- `getVenueStartingPrice(venueId)` — cheapest service, not a stored/guessed number (card prices dropped when this landed — they used to just show the first-listed service's price).
- `isVenueOpenNow(openingHours)` — live-computed "Open"/"Closed" badge instead of a static boolean (Maven Studio's hours are `null` every day to preserve its old always-closed demo state).
- `generateTimeSlots({ venueId, staffId, serviceId, date, durationMinutes? })` — availability from venue hours + existing `bookings` + service duration (a hardcoded lunch-break rule at hour 13 stands in for a real per-staff schedule exceptions table, which doesn't exist yet).
- `generateStylistTimeSlots({ stylistId, durationMinutes, date, bookingsList? })` — same idea for the go-booking wizard, reading the stylist's own `availability` instead of a venue's; no lunch-break rule (mobile stylists aren't modeled as needing one).
- `calculateTravelFee(area)` (`lib/travel-fee.ts`) — flat EGP 50 base fee plus a per-Cairo-area surcharge table (New Cairo 0, Zamalek/Maadi 20, Heliopolis 30, Sheikh Zayed 50, else 40) — a placeholder pricing rule, not distance-based.

Screen-local state that isn't in a shared context (each resets on unmount/reload, same as everything else): `chat-support.tsx`'s message list, `help.tsx`'s placeholder actions, `menu.tsx`'s row taps, `auth.tsx`'s selected country/OTP digits.

---

## 7. Design system & conventions

- **Palette** (Tailwind defaults): background `#f7f5f1` (light) / `zinc-950` (dark); surfaces `white` / `zinc-900`; text `stone-900` / `white`; muted `stone-500` / `zinc-400`; borders `stone-200` / `zinc-800`; primary actions `stone-900` (light) → `blue-600` (dark, and for CTAs like Confirm/Continue); accents `amber-400` (stars), `emerald` (confirmed/completed status badges), `blue-50/100` (info tints), `red-500` (destructive).
- **Typography**: headings use `font-serif` (Fraunces_600SemiBold, via `@expo-google-fonts/fraunces`), body/`font-sans` uses Inter_400Regular — both bundled with `expo-font` so they render identically on iOS and Android, replacing the old Georgia/system-font fallback. Section eyebrows: `text-[11px] uppercase tracking-[3px]`.
- **Shape**: cards `rounded-2xl`, inputs/buttons `rounded-xl`, chips `rounded-full`, consistent `px-5` page gutters.
- **Dark mode**: always pair light + `dark:` classes on `View`/`Text`. For icon colours use `useThemeColors()` (`lib/theme.ts`) because SVG props can't take classNames.
- **Components**: `Pressable` (not `TouchableOpacity`), `expo-image`'s `Image`, `SafeAreaView` with explicit `edges`, `ScrollView` with `contentContainerClassName`. Horizontal lists are `ScrollView horizontal` + `flex-row gap-*`.
- **Files**: kebab-case, one component per file, named exports for components, default exports only for routes.
- **Navigation**: `useRouter().push('/venue/${id}')` for detail; `replace` for auth/onboarding transitions so they're not in the back stack.
- **Modal screens** (`venue/[id]`, `chat-support`, `help`, `menu`) all share one header shape: a circular bordered back button (`ArrowLeft`, `size-9`, `accessibilityLabel="Close"` or `"Back"`) on the left, a centered `font-serif text-lg font-semibold` title, and either a matching action button or an empty `size-9` spacer on the right to keep the title centered. Reuse this shape for any new modal rather than inventing a new header.
- **Segmented digit input** (OTP in `auth.tsx`): an array of single-char `TextInput`s with a `ref` array, auto-advancing focus forward on entry and back on backspace-into-empty — not a library, hand-rolled since none was installed.
- **Fixed overlay + full-bleed background**: when a screen layers a fixed top/bottom control strip over a full-bleed background (Explore's map, any future full-bleed layout), the fixed strip needs its own opaque page-background color (`bg-[#f7f5f1] dark:bg-zinc-950`) — a transparent strip lets whatever's layered underneath bleed through the gaps between its child elements.
- **Multi-step modal flow** (`app/go-booking/`): when a flow has several internal steps that should all open as *one* modal (not one modal per step), give the group its own `_layout.tsx` with a nested `<Stack>` and register only the group itself as `presentation: 'modal'` in the root `_layout.tsx` — never register the individual step screens. Steps then push as normal card transitions inside the already-open modal. Carry step-to-step selections in a small React Context scoped to that group's `_layout.tsx` (e.g. `GoBookingDraftContext`), not in `AppStateProvider` — only the final committed result (here, the finished `Booking`) belongs in shared app state.

---

## 8. Known limitations & gotchas

- State and theme reset on reload (no AsyncStorage/MMKV yet).
- Map, location, calls, directions, notifications are all placeholders (the WhatsApp Support button was removed from Bookings this session — that entry point now lives in Help/Chat Support instead).
- App icon/splash/adaptive-icon are real Cutit branding now, but it's a quick mark derived from the wordmark's scissors motif, not final polished brand design — worth a real design pass later. `Logo` itself is still the text placeholder on purpose (the real wordmark SVG caused a native crash — "Element type is invalid" — most likely because the dev client needed a restart to pick up the new `metro.config.js` transformer; re-wire it via `assets/images/cutit-logo.svg` once that's confirmed fixed on-device).
- Images are hot-linked from Unsplash / pravatar — fine for demos, not for production.
- No ESLint/Prettier config (`expo lint` will prompt to create one), no tests, no CI.
- `expo-env.d.ts` is generated and gitignored; TypeScript needs it for `*.css` imports — it's created on first `expo start`.
- The Explore/Home duplication from v0 was intentionally split: Home = discovery + list, Explore = map/list. Explore lacks the service filter chips.
- **Testing dark mode**: NativeWind's color scheme on web is in-memory only. A full page reload (`page.goto`) or a browser context's emulated `prefers-color-scheme` does **not** reliably toggle it — the only reliable way is tapping the in-app dark-mode toggle and then navigating client-side (`router.push`, not `goto`) so the JS state survives. Bit us twice this session when verifying screens headlessly.
- **Testing the Explore bottom sheet**: synthetic mouse-drag gestures (e.g. Playwright) can land on an underlying list item instead of the sheet's drag handle and trigger a tap/navigation instead of a drag. Start the drag precisely on the handle, not generic mid-screen coordinates.

---

## 9. Recommendations

Ordered roughly by impact. **Replace** = swap a placeholder for the real thing; **Add** = missing capability.

### 9.1 Commit the migration first
Nothing here is in git yet. Commit the Expo migration as one baseline commit before building further so there's a clean diff for everything after.

### 9.2 Replace

| Placeholder today | Recommended replacement | Why |
|---|---|---|
| `lib/data.ts` mock tables (now Supabase-shaped, still in-memory) | **Supabase** (Postgres + Row-Level Security + Storage + phone OTP auth via Twilio/Vonage) accessed through **TanStack Query** | The types/normalization are already shaped for this (see §6) — the remaining work is a real Postgres schema + swapping the mock arrays for queries. Phone OTP fits the existing auth UI; RLS keeps the customer app safe without a custom API layer. Firebase is the alternative if you prefer NoSQL + FCM. |
| In-memory `AppStateProvider` (language now persisted, see §2.6) | Persist the rest with **react-native-mmkv** (or AsyncStorage, already a dependency): onboarding done, session, gender, favorites, theme | Users shouldn't re-onboard on every launch, and favorites/gender/theme resetting is an easy near-term win now that AsyncStorage is already wired for language. |
| Fake OTP flow in `auth.tsx` | Supabase Auth phone sign-in (or Firebase Auth) with a real resend timer | Currently anyone can "log in". |
| ~~`Alert` on Confirm Booking~~ | **Done** — both Venue detail and the go-booking wizard now call `addBooking()` and route to a shared `/booking-confirmation` screen (summary, add-to-calendar placeholder, "View in Bookings") | Still local-only: `addBooking()` writes to in-memory `AppStateProvider` state, not a real backend, so it resets on reload. The real remaining work is a Supabase insert once a backend exists. |
| `ExploreMap` pattern | **`react-native-maps`** (Google on Android, Apple on iOS) + **`expo-location`** for "near you" and "Search this area" | Location-based discovery is central to the product; `Venue` already carries `latitude`/`longitude`. |
| Hardcoded `Amira Nabil` user, stats, addresses, wallet | Wire Profile to the new `currentUser`/`Address` types in `lib/data.ts`, then back those with real backend tables | `User`/`Address` types and a matching mock `currentUser` now exist (§6) but `profile.tsx` doesn't consume them yet — everything in Profile is still inert/hardcoded inline. |
| Unsplash / pravatar images | Supabase Storage (or Cloudinary) with `expo-image` caching | Hot-linked images break and are unreliable. |

### 9.3 Add — product

1. ~~At-home and Events & Bridal booking flows.~~ **Done** (§2.9/§2.10, §5) — Cutit Go tab → gender toggle → stylist list → stylist detail → 4-step go-booking wizard (services, address, date/time, review) → confirmation, all working end-to-end with mock data. Still needed: **real payment** (nothing charges anything yet — Confirm Booking just writes a local record) and a **real mobile-provider dataset** (the 7 mock `Stylist` rows are hand-written, not a real onboarding/CRUD system).
2. **Booking lifecycle**: cancel, reschedule, no-show/late policies, status timeline (pending → confirmed → completed).
3. **Payments**: **Paymob** and/or **Fawry** for Egypt (cards, wallets, cash-on-service), plus Apple Pay/Google Pay; connect the existing wallet UI to real balance/top-ups.
4. **Arabic + RTL** — in progress: `i18next` + `expo-localization` infrastructure is built, the language toggle is wired to `i18n.changeLanguage()` and persists via AsyncStorage (survives restarts), and roughly **70–80% of the app's strings are translated** (all of `app/` is done; the `components/` group is not yet). **RTL layout mirroring itself is unverified** — `I18nManager.forceRTL` doesn't visually mirror the layout even after a full app restart in Expo Go, matching a currently unresolved upstream Expo/RN issue reported across iOS/Android/web ([expo/expo#39752](https://github.com/expo/expo/issues/39752)). Testing in a real dev-client/production build (to rule out an Expo-Go-only quirk) is blocked on not having an Apple Developer account for an iOS ad-hoc build; an Android EAS build remains a lower-friction untested alternative. Parked until build access is available, or until the decision is made to stop relying on automatic `flexDirection` mirroring and make direction explicit everywhere instead.
5. **Notifications**: `expo-notifications` for appointment reminders (the toggle exists) and booking status changes; deep links via the `cutit://` scheme already set in `app.json`.
6. ~~Favourites~~ **done** (§2.7) — still needed: persist `favoriteVenueIds` (currently resets on reload, like most of `AppStateProvider`) and add a heart to `recommendation-feed.tsx`'s bespoke card if that feed should support favoriting too. **Full reviews list** with photos, **real search & filters** (price range, rating, distance, open now, gender) remain open.
7. **Venue/partner side** (later): a separate dashboard or app for salons to manage calendar, staff, services, and confirm bookings. Without it, bookings have no one to fulfil them.
8. **Guest → account upgrade**: let a guest book by providing a phone number at checkout, then convert to a full account.

### 9.4 Add — engineering

- **Tooling**: ESLint (`eslint-config-expo`) + Prettier, `jest-expo` + React Native Testing Library for components and booking logic, GitHub Actions running `typecheck`, lint, tests.
- **EAS**: `eas build`, `eas submit`, and `eas update` (OTA) configured with a dev/preview/production profile; move secrets to EAS env vars.
- **Observability**: Sentry (`@sentry/react-native`) for crashes; PostHog or Amplitude for funnel analytics (onboarding → booking).
- **Loading/error states everywhere** once data is remote: extend `SkeletonCard`, add retry UI, offline handling.
- **Accessibility pass**: `accessibilityRole`/`Label` on all `Pressable`s (partially done), 44pt touch targets, dynamic type, colour contrast in dark mode.
- **Performance**: switch long lists to `FlatList`/`FlashList` once venue counts grow; memoise cards.
- **Persisted theme/language** alongside app state (see 9.2).

### 9.5 Suggested order
1. Commit baseline → 2. Supabase + auth + persisted state → 3. Real bookings (in-salon) with availability → 4. At-home / bridal flows → 5. Maps + location → 6. Payments → 7. Arabic/RTL + notifications → 8. Branding, fonts, EAS, store submission.

### 9.6 New since the last update (2026-09-12)

The baseline is now committed (see §2.4), which resolves 9.1. These are new observations from this session's work, additive to the sections above:

- **Explore's search bar regressed to non-functional.** The old free-text `TextInput` was replaced with a static "All treatments / Current location" pressable to match Fresha's pattern (tap → open a dedicated search screen), but that search screen was never built, so Explore currently has no text search at all, only the gender filter. Building that search screen is now a real gap, not just a nice-to-have.
- **Chat Support and Help are UI shells with no logic behind them.** Chat Support has no messaging backend (Supabase Realtime, Intercom, or similar) and no persistence — messages vanish on reload. Help's Reschedule/Cancel Booking buttons have nothing to act on since bookings aren't real records yet (depends on 9.2's "Alert on Confirm Booking → real booking record" item). Sequence these after real bookings exist.
- ~~Favorites now has a real entry point (Menu) but no screen or state.~~ **Done (§2.7)** — screen, shared state, and wired heart icons all landed.
- **Review submission still doesn't persist anywhere**, and this is more visible now that Venue detail shows a real written-reviews list pulled from `getVenueReviews()`. Once there's a backend, wire `ReviewModal`'s `onSubmit` to actually insert into the `reviews` table.
- **"Professionals" browsing mode (Explore) has no data model behind it.** If booking a specific professional across venues (not just per-venue staff) is a real product goal, `lib/data.ts` needs a top-level `Professional` entity independent of per-venue `Staff`.
- **`country-code-picker.tsx`'s list is a hand-maintained array of ~11 countries.** Fine for an Egypt-first MVP; if international expansion becomes real, swap for a maintained dataset (e.g. `react-native-country-codes-picker`) rather than growing the array by hand.
- **The OTP flow now looks fully production-ready** (polished 6-box auto-advance UI) **but still accepts any 6 digits.** The more convincing the UI, the higher the risk of shipping it unverified by accident — bump real OTP verification up in priority alongside phone auth in 9.2.

### 9.7 New since the last update (2026-09-12, session 2)

- **The real logo swap-in hit a native crash and was reverted on purpose.** Wiring `Logo` to import `cutit-logo.svg` via `react-native-svg-transformer` threw "Element type is invalid" on-device — almost certainly because a running dev client/Metro server needs a full restart to pick up a `metro.config.js` change (Metro only reads it at startup) rather than a real incompatibility. `Logo` currently renders the old text placeholder again; retry the swap after confirming a clean restart, and keep in mind a **real** logo asset was never provided this session — `cutit-logo.svg` is a placeholder wordmark, not final brand art.
- **The app icon/splash mark is programmatically derived, not designed.** It's a crop of the wordmark's scissors motif, picked and positioned by trial-render rather than by a designer — good enough to replace the Expo template defaults, but due for a real design pass before store submission.
- **"From EGP X" card prices changed** (e.g. The Grooming Society: 250 → 120) now that they're genuinely the cheapest service (`getVenueStartingPrice`) instead of an arbitrary stored number that happened to equal the first-listed service's price. Not a bug, but a visible number change worth knowing about if it comes up.
- **"Open"/"Closed" badges are now real-time**, computed from `openingHours` against the device clock via `isVenueOpenNow`, instead of a fixed boolean. This means a venue's badge can now legitimately flip closed outside its configured hours — expected, but different from before where it never changed within a session.
- **A `pnpm`/`npm` mismatch nearly shipped a stray lockfile.** New dependencies were installed with `npm` before realizing the project standardizes on `pnpm` (`.npmrc`'s `node-linker=hoisted`); this left a stray `package-lock.json` and an out-of-date `pnpm-lock.yaml`. Fixed by removing the former and running `pnpm install` to resync the latter — but a reminder to always check for `pnpm-lock.yaml`/`.npmrc` before running `npm install` in this repo.
- **`generateTimeSlots`' lunch-break rule and per-staff schedule are simplifications**, not modeled data: there's no `staff_schedules`/`schedule_exceptions` table, so every staff member effectively shares their venue's opening hours, and "lunch break" is a hardcoded "block whatever slot starts at hour 13" rule rather than a real per-day exception. Fine for a demo; a real schedule model is needed before this is trustworthy for actual staff availability.

### 9.8 left for later

So concretely, right now, your queue is:
✅ Housekeeping — done
✅ Entity shapes — done
⏸ MMKV/persistence — deferred (revisit at dev-client migration)
🔄 Maps — decision made (fake map now, real map later), no action needed today, just keep finishing Explore UI against the fake pattern
⏸ Backend — parked

### 9.9 New since the last update (2026-09-13 → 2026-09-14, Arabic/RTL + Favorites)

- **RTL layout mirroring is unverified, and I initially misreported it as working.** A web test after switching to Arabic appeared to show mirrored rows, but re-inspecting it showed that was just Arabic text right-aligning within its own text box (normal Unicode bidi behavior) — the actual row layouts (icon/chevron positions) never moved. `I18nManager.isRTL` reads `true` and translations are correct, but `flexDirection: 'row'` auto-mirroring hasn't been confirmed working on web *or* on-device in Expo Go, even after a full restart. This matches an open, unresolved upstream issue ([expo/expo#39752](https://github.com/expo/expo/issues/39752)). Don't trust a screenshot showing right-aligned Arabic text as proof of mirroring — check whether icon/button *positions* actually swapped sides.
- **Testing a real dev-client build is blocked, not abandoned.** `expo-dev-client` and `eas.json` are in place; the blocker is Apple Developer account access for an iOS ad-hoc build. An Android EAS build (no paid account needed) is the untried lower-friction path if this needs unblocking before an Apple account is available.
- **`@react-native-async-storage/async-storage` must go through `npx expo install`, not `pnpm add`/`npm install` directly.** Learned this the hard way — a plain install grabbed the latest npm version, whose native module didn't match what's bundled in Expo Go for SDK 57, crashing with "Native module is null" on-device (invisible on web, which has no native module for it). Applies to any future native-module dependency in this repo.
- **Favorites doesn't persist across reloads.** Same rule as everything else in `AppStateProvider` except `language` — expected given the current state architecture, but worth fixing alongside the broader persistence work in §9.2 since `AsyncStorage` is already a dependency now.
- **`recommendation-feed.tsx` has no heart/favorite button at all** — it was listed as a place to wire favorites, but it uses a bespoke card layout, not `EstablishmentCard`. Add one there if favoriting from the home feed (not just Explore/Home list/venue detail) is wanted.

### 9.10 New since the last update (2026-09-16, Cutit Go)

- ~~`/booking-flow` is now referenced from four places ... and still doesn't exist.~~ **Resolved in §2.9** — `booking-flow.tsx` was built (replacing `at-home.tsx`/`events-bridal.tsx` entirely) and now leads all the way through to a working booking.
- ~~The stylist list under the For Her/For Him toggle is borrowed salon data, not real mobile providers.~~ **Resolved in §2.9** — `Stylist` is now its own entity in `lib/data.ts`, independent of venue `Staff`.
- **`components/service-shortcuts.tsx` is gone.** All four of its original chips (At Home, Events & Bridal, Hair & Barbering, Beauty & Care) are now removed — the first two moved to the Cutit Go tab, the remaining two were dropped with no replacement. Home currently has no service-type filter chips at all; if that filtering capability is still wanted, it needs a new home.
- ~~Each of `at-home.tsx`/`events-bridal.tsx` keeps its own local toggle state...~~ **Superseded by §2.9** — those two screens no longer exist; the replacement `booking-flow.tsx` still keeps its gender toggle local (not shared `activeGender`) for the same reason, so the underlying question (should it be shared?) still stands.

### 9.11 New since the last update (2026-09-16, sessions 2–3 — Stylist model + full go-booking flow)

- **Booking data now genuinely branches three ways.** `Booking.bookingType` (`'salon' | 'at-home' | 'events-bridal'`) plus the nullable `venueId`/`staffId` vs. `stylistId`/`addressId` pairs mean any code that reads `bookings` (currently just `bookings.tsx` and the new `booking-confirmation.tsx`) has to branch on `bookingType` rather than assuming a venue booking shape. Keep this in mind for any future screen that lists or summarizes bookings.
- **The Bookings tab's "Upcoming" card is a single `.find()`, not a list** — confirmed via Playwright that a freshly-added second confirmed booking (from the go-booking flow) doesn't visibly appear there because an earlier mock booking is found first. This is a pre-existing simplification of `bookings.tsx` from before this session, surfaced now because `addBooking()` finally makes a second simultaneous confirmed booking possible. Worth a real fix (show all upcoming bookings, or at least the most recent) before this matters for a real user.
- **The go-booking wizard's draft state is intentionally ephemeral.** `GoBookingDraftContext` (services/address/date/time selections) lives only in memory for the lifetime of the `go-booking` route group and is discarded on `router.back()` past step 1 or a reload — matches the instruction to keep it out of `AppStateProvider`, but means there's no "resume where you left off" if the app is killed mid-booking. Fine for a mock-data prototype; would need reconsidering (e.g. persisted draft, or a single-screen wizard) if drop-off during a multi-step native flow becomes a real concern.
- **`calculateTravelFee()` is a flat lookup table, not distance-based.** It maps `Address.area` (a free-text string on `Address`, not a controlled enum) to a surcharge via exact string match, falling back to a default surcharge for anything unrecognized (including new user-entered areas from the "add address" form, which are never validated against the known area list). Fine for a demo; a real implementation would need either a controlled area picker or real geocoding + distance calculation.
- **End-to-end Playwright verification for this flow is now on record**: guest onboarding → Cutit Go tab → At Home → gender-filtered stylist list → stylist detail → 4 go-booking steps (with a real new address typed in and saved) → review totals math-checked (services subtotal + area travel fee) → confirm → confirmation screen → View in Bookings, all with zero console/page errors. This is the first booking flow in the app verified this thoroughly end-to-end rather than screen-by-screen.
