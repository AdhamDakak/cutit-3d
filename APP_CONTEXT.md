# Cutit — App Context

> Single source of truth for what this app is, how it's built, where it stands, and what should change next. Keep it updated as the app evolves.

_Last updated: 2026-09-12 (menu-close navigation fix, branding pass — icon/splash/fonts, mock data normalized into Supabase-shaped types)_

---

## 1. Product overview

**Cutit** is a mobile booking app for salons and barbershops in Egypt (launching with Cairo). Customers discover venues, pick a stylist + services + date/time, and book. The product vision covers three booking modes:

| Mode | Description | Status in app |
|---|---|---|
| **In-salon** | Book a slot at a venue (barbershop / beauty salon) | UI built end-to-end (mock data) |
| **At-home** | A barber / stylist / coiffeur comes to the customer | Shortcut chip only — no flow |
| **Events & Bridal** | Makeup artists, bridal packages, event styling | Shortcut chip only — no flow |

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
  _layout.tsx             Root Stack + providers (GestureHandlerRootView, SafeAreaProvider, AppStateProvider, StatusBar)
  index.tsx               Redirect → /onboarding or /(tabs) based on hasOnboarded
  onboarding.tsx          3-slide carousel; "Get Started" → /auth, "Continue as Guest" → /(tabs)
  auth.tsx                Country code picker + phone → 6-box auto-advancing OTP → profile (all client-side, no real OTP)
  chat-support.tsx        Modal: local-state chat UI (seeded support greeting, send appends to a list, no backend)
  help.tsx                Modal: Reschedule/Cancel Booking (placeholder actions) + a Chat Support row
  menu.tsx                Modal: Favorites (placeholder) / My Bookings / Help / Settings / Sign Out, opened from the header ≡ icon
  (tabs)/
    _layout.tsx           Bottom tabs: Home / Explore / Bookings / Profile (lucide icons, theme-aware)
    index.tsx             Home
    explore.tsx           Fresha-style rebuild: full-bleed map background + draggable `@gorhom/bottom-sheet` list (3 snap points), fixed search bar / Venues-Professionals-Anytime filter row / day-picker row on top
    bookings.tsx          Upcoming / Past History
    profile.tsx           Profile & settings
  venue/[id].tsx          Venue detail + booking flow (modal): stylist/service/date/time picker, written reviews list
components/
  app-header.tsx          Logo, dark-mode toggle, bell, menu (→ /menu), "Discover in Cairo", guest/user avatar toggle
  country-code-picker.tsx Pressable segment + modal list of ~11 country dial codes, used by auth.tsx
  establishment-card.tsx  Venue card (cover, open/closed, rating, services, price, Book)
  recommendation-feed.tsx Horizontal "Recommended for You" (gender-filtered when signed in)
  service-shortcuts.tsx   At Home / Events & Bridal / Hair & Barbering / Beauty & Care chips (no handlers)
  explore-map.tsx         Pure background layer now: diagonal-line pattern + pins rendered as star+rating badges (no popup card)
  review-modal.tsx        Bottom-sheet star rating + always-optional text field, used by Bookings and Venue (no more requireText)
  settings-rows.tsx       SettingRow / ToggleRow, used by Profile and now Menu/Help too
  skeleton-card.tsx       Loading placeholder
  logo.tsx                Text wordmark "cut**it**" — intentionally still a placeholder; the SVG import path (`assets/images/cutit-logo.svg` via react-native-svg-transformer) is wired but unused until a final logo asset is ready
lib/
  data.ts                 Venue/Staff/Service/TimeSlot/Booking/Review/User types; normalized mock tables (venues, staff, services, reviews, bookings, currentUser) plus derived helpers (getVenueStaff/Services/Reviews, getVenueStartingPrice, isVenueOpenNow, generateTimeSlots) — see §6
  app-state.tsx           React Context: hasOnboarded, isSignedIn, activeGender (+ actions)
  theme.ts                useThemeColors() → hex colours for icons (icons can't use `dark:` classes)
assets/images/            Cutit-branded icon.png / android-icon-*.png / favicon.png / splash-icon(-dark).png (derived from cutit-mark.svg, a crop of the wordmark's scissors motif) + the full cutit-logo.svg wordmark
global.css                Tailwind directives (imported once in app/_layout.tsx)
tailwind.config.js        NativeWind preset; fontFamily.serif = Fraunces_600SemiBold, fontFamily.sans = Inter_400Regular
babel.config.js / metro.config.js   NativeWind wiring + react-native-svg-transformer (.svg → component)
svg.d.ts                  Types `*.svg` imports as React components
```

~2,200 lines of app code.

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
- 🟡 Service shortcuts (At Home, Events & Bridal, …), bell, "Cairo, Egypt" picker, filters button, rebook banner, heart/save

### Explore
- ✅ Full-bleed map background with a draggable `@gorhom/bottom-sheet` list on top (peeks at ~22%, drags down to ~14% to reveal the map, up to ~92% to cover the screen — scrolling the list also expands it via the sheet's built-in gesture handoff)
- ✅ Fixed top chrome (search bar, Venues/Professionals toggle, "Anytime" dropdown, sliders icon, horizontal day-picker) stays pinned above the sheet at every drag position
- ✅ Map pins render as star + rating badges; tapping one highlights it (blue)
- 🟡 The top search bar is now a static "All treatments / Current location" pressable (no handler) — Explore lost free-text filtering when the old TextInput-based search bar was replaced; gender filter (from context) is the only thing still actually filtering the list
- 🟡 "Venues"/"Professionals" toggle, "Anytime" dropdown, and the sliders/list-filter icon buttons are all visual only; map is still the CSS-pattern placeholder, not a real map

### Venue detail / booking (`/venue/[id]`)
- ✅ Stylist picker (with a placeholder avatar icon when a staff member has no photo), service multi-select with search, 7-day date strip, live total, Confirm gated on ≥1 service + a time
- ✅ Time slots are now availability-aware: `generateTimeSlots()` derives them from the venue's opening hours, the selected staff member's existing bookings, and the selected services' combined duration — a slot overlapping a booking (or landing in the standing lunch-break rule) renders disabled rather than always showing a fixed list
- ✅ Venue cover photo falls back to a bordered placeholder block (camera/image icon) if `venue.coverImageUrl` is ever null
- ✅ Written reviews list below the aggregate rating (initials avatar, star rating, text) sourced from `getVenueReviews(venue.id)`; Write a Review modal (rating + always-optional text)
- 🟡 Confirm shows a native `Alert` then jumps to Bookings — nothing is saved as a real `Booking` record; heart/save; submitting a review doesn't append to the reviews table

### Bookings
- ✅ Upcoming (live countdown banner computed from the booking's real `startTime`, confirmed card, stylist, Call Venue / Get Directions) / Past (completed + cancelled cards), Leave a Review modal, Rebook → Explore
- ✅ Sourced from `lib/data.ts`'s `bookings` mock table joined against `venues`/`staff`/`services` by id (one confirmed, one completed, one cancelled) instead of ad-hoc local objects
- ✅ "Need Help with this Booking?" now navigates to `/help`
- 🟡 Still mock data, not persisted or interactive; Call / Directions have no handlers; no cancel or reschedule from this screen itself (WhatsApp Support button was removed — that entry point now lives in Help instead)

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
- ✅ Opened from the header ≡ icon; Favorites / My Bookings (→ Bookings tab) / Help (→ `/help`) / Settings (→ Profile tab) / Sign Out (same pattern as Profile's Log Out)
- 🟡 Favorites just `console.log`s — no Favorites screen or persisted favorite state exists yet

---

## 6. State & data model

- **Server state**: none — `lib/data.ts` exports static, normalized mock tables. Screens read them through `useMemo` filters or the derived-data helpers below, not by reaching into nested objects.
- **App state** (`lib/app-state.tsx`): `hasOnboarded`, `isSignedIn`, `activeGender` in a React Context. **Resets on every app launch/reload** — nothing is persisted.
- **Theme**: NativeWind's built-in colour scheme (`useColorScheme()` from `nativewind`); follows the system by default, toggled from the header or Profile. Also not persisted.
- **Booking selection** lives in local `useState` inside `venue/[id].tsx` and is discarded on confirm.

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
type Service = { id; venueId; name; durationMinutes; priceEGP; category }
type TimeSlot = { id; venueId; staffId; serviceId; startTime; endTime; status: 'available' | 'booked' | 'blocked' }
type Booking = { id; userId; venueId; staffId; serviceId; startTime; endTime; status: 'confirmed' | 'completed' | 'cancelled'; priceEGP; createdAt; locationType: 'in-salon' | 'at-home' }
type Review = { id; bookingId; venueId; userId; rating; text: string | null; authorName; createdAt }
type User = { id; fullName; email; phone; avatarUrl: string | null; gender; addresses: Address[]; walletBalance }
```

Mock tables: `venues`, `staff`, `services`, `reviews`, `bookings`, `currentUser`, plus `serviceFilters` (unchanged). Derived-data helpers stand in for what would be backend queries/RPCs:
- `getVenueStaff/Services/Reviews(venueId)` — the join a real `select('*, staff(*), services(*)')` query would do.
- `getVenueStartingPrice(venueId)` — cheapest service, not a stored/guessed number (card prices dropped when this landed — they used to just show the first-listed service's price).
- `isVenueOpenNow(openingHours)` — live-computed "Open"/"Closed" badge instead of a static boolean (Maven Studio's hours are `null` every day to preserve its old always-closed demo state).
- `generateTimeSlots({ venueId, staffId, serviceId, date, durationMinutes? })` — availability from venue hours + existing `bookings` + service duration (a hardcoded lunch-break rule at hour 13 stands in for a real per-staff schedule exceptions table, which doesn't exist yet).

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
| In-memory `AppStateProvider` | Persist with **react-native-mmkv** (or AsyncStorage): onboarding done, session, gender, theme, language | Users shouldn't re-onboard on every launch. |
| Fake OTP flow in `auth.tsx` | Supabase Auth phone sign-in (or Firebase Auth) with a real resend timer | Currently anyone can "log in". |
| `Alert` on Confirm Booking | Actually insert into the `bookings` table + a confirmation screen (summary, add-to-calendar, "View in Bookings") | The core action currently saves nothing — `generateTimeSlots()` already reads from `bookings`, so a real insert would immediately start affecting availability. |
| `ExploreMap` pattern | **`react-native-maps`** (Google on Android, Apple on iOS) + **`expo-location`** for "near you" and "Search this area" | Location-based discovery is central to the product; `Venue` already carries `latitude`/`longitude`. |
| Hardcoded `Amira Nabil` user, stats, addresses, wallet | Wire Profile to the new `currentUser`/`Address` types in `lib/data.ts`, then back those with real backend tables | `User`/`Address` types and a matching mock `currentUser` now exist (§6) but `profile.tsx` doesn't consume them yet — everything in Profile is still inert/hardcoded inline. |
| Unsplash / pravatar images | Supabase Storage (or Cloudinary) with `expo-image` caching | Hot-linked images break and are unreliable. |

### 9.3 Add — product

1. **At-home and Events & Bridal booking flows.** These are two of the three pillars of the product and currently only exist as chips. They need: service type selection, address picker (Profile already models Home/Work addresses), travel-fee logic, and different provider types (mobile barbers, makeup artists).
2. **Booking lifecycle**: cancel, reschedule, no-show/late policies, status timeline (pending → confirmed → completed).
3. **Payments**: **Paymob** and/or **Fawry** for Egypt (cards, wallets, cash-on-service), plus Apple Pay/Google Pay; connect the existing wallet UI to real balance/top-ups.
4. **Arabic + RTL**: `i18next` + `expo-localization`, `I18nManager.forceRTL`, and RTL-aware layouts. The language toggle already exists — it must actually work for the Egyptian market.
5. **Notifications**: `expo-notifications` for appointment reminders (the toggle exists) and booking status changes; deep links via the `cutit://` scheme already set in `app.json`.
6. **Favourites** (all the heart buttons), **full reviews list** with photos, **real search & filters** (price range, rating, distance, open now, gender).
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
- **Favorites now has a real entry point (Menu) but no screen or state.** Worth prioritizing now that it's one tap away instead of a theoretical heart icon — needs a `favorites: Set<id>` (or backend table) shared via `lib/app-state.tsx` or a new context, plus the actual screen.
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
