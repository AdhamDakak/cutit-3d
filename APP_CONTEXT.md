# Cutit — App Context

> Single source of truth for what this app is, how it's built, where it stands, and what should change next. Keep it updated as the app evolves.

_Last updated: 2026-09-20 (booking lifecycle — cancel, reschedule, a Pending→Confirmed→Completed timeline; the mock data layer moved behind a `lib/api` + `lib/hooks` repository seam so `lib/data.ts`'s tables are no longer imported directly by screens; and guests can now walk the entire booking flow and only create an account at the moment they hit Confirm)_

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
`Onboarding (3 slides)` → `Auth (country code + phone → 6-digit OTP → profile)` or `Continue as Guest` → `Home` → pick a venue or a Cutit Go stylist → services → date/time → `Confirm`. **A guest reaches Confirm with the same rights as a signed-in user** — the account (phone → OTP → name/email/gender) is created in an in-flow sheet at that exact moment, not before; the booking then completes with the same handler. → `Bookings` tab, where the new booking shows under Upcoming with a Pending→Confirmed→Completed status timeline (auto-advances from Pending to Confirmed after a few seconds, mocking the venue/stylist accepting it).

Auxiliary support flow, reachable from the header menu icon, Bookings' "Need Help" link (now booking-aware), or Profile: `Menu` → `Help` (booking summary + Reschedule / Cancel with a confirm dialog / Chat Support) or `Chat Support` directly. Reschedule opens a dedicated `/reschedule` screen reusing the same day-pill/time-slot picker as booking; Cancel and Reschedule are real mutations now, Chat Support is still local-state only, see §5.

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
11. **Mandatory stylist selection + booking lifecycle (2026-09-17 → 2026-09-18, committed `1832c1b`/`68725dc`-adjacent/`00ef4ea`)** — three related passes:
    - Venue detail's stylist picker gained an explicit "Any Stylist" card (generic `Users` icon, "First available") as its first item; picking a staff member is now **mandatory** (`canConfirm` requires `selectedStaff !== null`), with an amber hint shown until one is chosen. The old convention of a per-venue mock `Staff` row named "Any Stylist" (id `${venueId}-any`) was deleted — there is now exactly one sentinel, `ANY_STAFF_ID` (`lib/data.ts`), used both for the UI selection state and for `generateTimeSlots`' "no staff filter, but still check every venue staff member's bookings" branch.
    - `BookingStatus` gained `'pending'`; salon and Go bookings now start `pending` and a `setTimeout`-based **mock auto-confirm** (documented as MOCK ONLY, meant to be deleted whole) flips them to `confirmed` after 5s, standing in for the venue/stylist accepting the job. `cancelBooking(id)` and `rescheduleBooking(id, startTime, endTime)` were added.
    - `app/help.tsx` became booking-aware (reads a `bookingId` param, shows a summary card + status pill, Cancel with a real confirm `Alert` and Reschedule opening a new `app/reschedule.tsx` screen that reuses the day-pill/slot-grid pattern), and `components/booking-timeline.tsx` (a Pending→Confirmed→Completed strip, single muted "Cancelled" state otherwise) now renders on every upcoming `BookingCard`. `app/(tabs)/bookings.tsx` was rewritten from a hardcoded "one card per status" screen into real `FlatList`s (sorted, with empty states) over `components/booking-card.tsx`, extracted from the old inline JSX.
12. **`lib/api` + `lib/hooks` repository layer (2026-09-18 → 2026-09-19, committed `00ef4ea`, `0a76211`, `04efc40`)** — introduced specifically so a later Supabase swap only touches one folder. Every mock table in `lib/data.ts` is now wrapped in an async `lib/api/*` function (`venues.ts`, `stylists.ts`, `slots.ts`, `bookings.ts`, `user.ts`, `favorites.ts`) with a tiny fake `delay()` so screens are genuinely forced to handle loading/error states, not just typed as if they might. `bookings.ts`/`user.ts`/`favorites.ts` each own a mutable in-memory store (seeded once from `lib/data.ts`, mutated independently of it) plus a `subscribe`/`invalidate` pub-sub pair, standing in for query-library cache invalidation. `lib/hooks/*` wraps these in `useAsync`/`useMutation` — two small generic hooks written to the exact `{ data, isLoading, error, refetch }` / `{ mutate, isPending, error }` shape a real TanStack Query hook would have, so adopting Query later means rewriting those two files, not any call site. `lib/app-state.tsx` was slimmed to only session/UI state (onboarding, sign-in, gender, language, hydration) — `bookings`, `addresses`, `favoriteVenueIds` and their mutators moved out entirely. Every screen that used to import `venues`/`stylists`/`services`/`staff`/`reviews`/`bookings`/`favorites`/`currentUser` or a `generate*`/`get(Venue|Stylist)*` helper directly from `lib/data.ts` was migrated to the matching hook, in four reviewed groups (confirmation+favorites+stylist-card → venue/stylist-detail+booking-flow → the go-booking wizard → Home+Explore); a guardrail comment at the top of `lib/data.ts` (there's no ESLint config to enforce it automatically, see §8) documents the rule and the exact grep to verify it. `ANY_STAFF_ID` also changed shape here: `createBooking` now maps it to `{ staffId: null, anyStaff: true }` on the stored `Booking` rather than persisting the sentinel string itself, so a real backend's contract doesn't have a magic value baked into it.
13. **Guest checkout with in-flow account creation (2026-09-20, committed `953e62e`)** — per the product requirement that a guest can walk the entire salon or Cutit Go flow and only create an account at Confirm. `app/auth.tsx`'s three steps were extracted into reusable `components/phone-step.tsx`, `otp-step.tsx`, `profile-step.tsx` (auth.tsx still composes them for normal sign-in, unchanged visually); `lib/api/user.ts` gained `requestOtp`/`verifyOtp` (mock: any 10+-digit phone, any 6 digits) and `completeProfile` (overwrites the single mock user record in place, keeping its `id` so a guest's just-created booking stays attached once they're no longer a guest). Both `venue/[id].tsx`'s and `go-booking/review.tsx`'s Confirm handlers now check `isSignedIn`: signed-in users book directly; guests get a new `components/checkout-auth-sheet.tsx` (a `Modal` presented *over* the current screen, composing the same three step components, with the venue/review screen visibly dimmed underneath rather than unmounted) that walks phone→OTP→profile (gender prefilled from `activeGender`) and, on success, runs the exact same booking-submit code the signed-in path uses. Dismissing the sheet creates nothing and leaves the draft/selections untouched. Surfaced and fixed a real pre-existing bug while testing this: `components/settings-rows.tsx`'s `{value && <Text>...}` rendered a literal empty text node whenever `value` was `''` (the classic React falsy-empty-string gotcha) — invisible before since `value` was always a hardcoded non-empty string, first triggered by Profile's name field being genuinely `''` for the brief window before the new `useCurrentUser()` hook resolves. Verified end-to-end with Playwright as two independent guest sessions (salon booking including a dismiss-and-retry, and a Cutit Go booking) — both created an account, both bookings landed under Upcoming, zero console errors after the settings-rows fix.

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
  _layout.tsx             Root Stack + providers (GestureHandlerRootView, SafeAreaProvider, AppStateProvider, StatusBar); registers go-booking and booking-confirmation as modal route groups, reschedule as a plain card route
  index.tsx               Redirect → /onboarding or /(tabs) based on hasOnboarded
  onboarding.tsx          3-slide carousel; "Get Started" → /auth, "Continue as Guest" → /(tabs)
  auth.tsx                Composes PhoneStep → OtpStep → ProfileStep (see components/) for normal sign-in; "Continue as Guest" just completes onboarding — the guest's account, if any, is created later at checkout (see #13, §5)
  chat-support.tsx        Modal: local-state chat UI (seeded support greeting, send appends to a list, no backend)
  help.tsx                Modal, booking-aware: reads a `bookingId` param via useBooking(), shows a summary card (name/staff/date/status pill) and Reschedule/Cancel actions (hidden once completed/cancelled or with no bookingId) + a Chat Support row
  reschedule.tsx          Card push: current-appointment reference + the same day-pill/slot-grid pattern as booking, via useSlots(); confirm calls rescheduleBooking() and dismissTo's back to Bookings
  favorites.tsx           Modal: favorited venues (via EstablishmentCard) or an empty state with a "Browse venues" CTA; loading/error states via useVenues()+useFavorites()
  booking-flow.tsx        Card push (not modal): "For Him"/"For Her" toggle (local-only) + StylistCard list filtered by type (`at-home`/`events-bridal`) and gender via useStylists(); forwards `type` into /stylist/[id]
  stylist/[id].tsx        Card push: stylist detail (bio, specialties, portfolio, reviews) via useStylist()/useStylistReviews(); "Book" pushes into the go-booking modal group with stylistId+type
  go-booking/             Nested Stack, opened as one modal group (presentation set once on the group in the root layout, not per-step)
    _layout.tsx           Declares the 4-step <Stack> + GoBookingDraftContext (selected services, address, event date/notes, date/time) — scoped to this flow only, not AppStateProvider
    services.tsx          Step 1: stylist's services (useStylistServices()) as multi-select rows, running subtotal, Continue disabled until ≥1 selected
    address.tsx           Step 2: saved addresses (useAddresses()) as selectable cards + inline "add new address" form (useAddAddress()); optional event date/notes when type is events-bridal
    datetime.tsx          Step 3: day picker + time-slot grid sized to the selected services' total duration, via useSlots()
    review.tsx            Step 4: full summary + calculateTravelFee(); "Confirm Booking" — signed-in users book directly via useCreateBooking(), guests get CheckoutAuthSheet first (see #13)
  booking-confirmation.tsx  Root-level modal shared by both salon and Go bookings: looks up the booking via useBooking(bookingId), renders a status-aware summary, "Add to Calendar" (placeholder), "View in Bookings" (dismissAll + replace); swipe-to-dismiss and Android back are both disabled so the two buttons are the only way out
  menu.tsx                Modal: Favorites (→ /favorites) / My Bookings / Help / Settings / Sign Out, opened from the header ≡ icon
  (tabs)/
    _layout.tsx           Bottom tabs: Home / Explore / Cutit Go / Bookings / Profile (lucide icons, theme-aware)
    index.tsx             Home — venues via useVenues(); the old fake setTimeout "refresh" is now a real refetch()
    explore.tsx           Fresha-style rebuild: full-bleed map background + draggable `@gorhom/bottom-sheet` list (3 snap points) over useVenues(), fixed search bar / Venues-Professionals-Anytime filter row / day-picker row on top
    cutit-go.tsx           "At Home" / "Events & Bridal" selection cards → /booking-flow?type=...
    bookings.tsx          Upcoming / Past History as real FlatLists (sorted, empty states) over useBookings(), rendering components/booking-card.tsx per row
    profile.tsx           Profile & settings; name/phone/email now come from useCurrentUser() instead of a hardcoded string
  venue/[id].tsx          Venue detail + booking flow (modal): useVenue/useVenueStaff/useVenueServices/useVenueReviews + useSlots() for availability; stylist selection is mandatory (an explicit "Any Stylist" card, see #11); Confirm builds a real Booking via useCreateBooking(), gated through CheckoutAuthSheet for guests (see #13)
components/
  app-header.tsx          Logo, dark-mode toggle, bell, menu (→ /menu), "Discover in Cairo", guest/user avatar toggle
  country-code-picker.tsx Pressable segment + modal list of ~11 country dial codes, used by phone-step.tsx
  phone-step.tsx          Extracted from auth.tsx: country picker + phone number entry, LTR-pinned row; shared by auth.tsx and checkout-auth-sheet.tsx
  otp-step.tsx            Extracted from auth.tsx: 6-box auto-advancing OTP input, auto-submits on the 6th digit; shared the same way
  profile-step.tsx        Extracted from auth.tsx: name/email form, with an optional For Her/For Him toggle (auth.tsx omits it, checkout-auth-sheet.tsx shows it prefilled from activeGender)
  checkout-auth-sheet.tsx Modal presented *over* the current venue/review screen (never navigates away) composing the three step components above for guest checkout — phone → OTP → profile → onAuthenticated, which the caller uses to run its own booking-submit code (see §2.13)
  establishment-card.tsx  Venue card (cover, open/closed, rating, services, price, Book, wired favorite heart)
  recommendation-feed.tsx Horizontal "Recommended for You" (gender-filtered when signed in) — its own bespoke card, does NOT use EstablishmentCard, so it has no heart/favorite button at all
  stylist-card.tsx        Stylist row (photo/initials, specialties, rating, "From EGP X") used by booking-flow.tsx; takes an optional `venueName` prop, falling back to its own useVenue() fetch when the caller doesn't supply one
  booking-card.tsx        Extracted from bookings.tsx: one booking row (salon or Go), `variant: 'upcoming' | 'past'` controlling which actions show; renders BookingTimeline under the date/time row for upcoming bookings
  booking-timeline.tsx    Horizontal Pending → Confirmed → Completed strip (ticked/current/muted), or a single muted "Cancelled" state; built start→end so it mirrors correctly under RTL
  error-state.tsx         Shared "something went wrong" block + Retry button, used by every screen migrated to lib/hooks (see §2.12)
  explore-map.tsx         Pure background layer now: diagonal-line pattern + pins rendered as star+rating badges (no popup card)
  review-modal.tsx        Bottom-sheet star rating + always-optional text field, used by Bookings and Venue (no more requireText)
  settings-rows.tsx       SettingRow / ToggleRow, used by Profile and now Menu/Help too — SettingRow's `value` prop rendering had a latent empty-string bug fixed in §2.13
  skeleton-card.tsx       Loading placeholder, now backing real (not fake) loading states across Home/Favorites/Explore/etc.
  logo.tsx                Text wordmark "cut**it**" — intentionally still a placeholder; the SVG import path (`assets/images/cutit-logo.svg` via react-native-svg-transformer) is wired but unused until a final logo asset is ready
lib/
  data.ts                 Venue/Staff/Stylist/Service/TimeSlot/Booking/Address/Review/User/Favorite types + the mock tables themselves; a guardrail comment at the top says only lib/api/* may import the tables/generate*/get* helpers as values (see §2.12, §8) — everything else may only `import type`. `ANY_STAFF_ID` is a client-side selection sentinel only (see §6); `Booking.anyStaff?: boolean` is the persisted flag.
  api/                    The repository layer (see §2.12) — every function is async, wraps a mock table, and is the only code that imports lib/data.ts's tables as values
    venues.ts             listVenues(filters?)/getVenue/getVenueStaff/getVenueServices/getVenueReviews; also re-exports the sync getVenueStartingPrice/isVenueOpenNow
    stylists.ts           listStylists({type,gender})/getStylist/getStylistServices/getStylistReviews
    slots.ts              listSlots({venueId?,staffId?,serviceId?,stylistId?,date,durationMinutes?,excludeBookingId?}) — wraps generateTimeSlots/generateStylistTimeSlots; the seam where a real backend would compute availability server-side
    bookings.ts           listBookings/getBooking/createBooking/cancelBooking/rescheduleBooking over an in-memory store; owns the mock auto-confirm timer (see §2.11) and the ANY_STAFF_ID→anyStaff translation (see §2.12)
    user.ts                getCurrentUser/requestOtp/verifyOtp/completeProfile (see §2.13) + listAddresses/addAddress, each over their own in-memory store
    favorites.ts           listFavorites/toggleFavorite over an in-memory store
    _internal/             delay() (fake network latency) and a tiny createInvalidationBus() (subscribe/invalidate pub-sub) shared by the stateful modules above
    index.ts               Re-exports everything, plus ANY_STAFF_ID and getBookingDetails from lib/data.ts
  hooks/                  useAsync/useMutation (two generic hooks shaped exactly like a query library's useQuery/useMutation, so swapping in TanStack Query later only touches these two files) + one file per api module (venues/stylists/slots/bookings/user/favorites) exposing the read hooks (useVenue, useBookings, useSlots, ...) and mutation hooks (useCreateBooking, useToggleFavorite, useRequestOtp, ...)
  travel-fee.ts           calculateTravelFee(area) — flat base fee + a per-Cairo-area surcharge table, used by the go-booking review step
  app-state.tsx           React Context, now session/UI state only: hasOnboarded, isSignedIn, activeGender, language (persisted), isHydrated. bookings/addresses/favorites moved to lib/api+lib/hooks in §2.12.
  i18n.ts                 i18next + react-i18next init, loads locales/en.json and locales/ar.json as resources
  theme.ts                useThemeColors() → hex colours for icons (icons can't use `dark:` classes)
locales/
  en.json / ar.json       i18next translation resources — nested by screen (onboarding, auth, menu, help, reschedule, checkoutAuth, chatSupport, tabs, home, explore, bookings, profile, venue, favorites, cutitGo, bookingFlow, stylist, goBooking, bookingConfirmation) plus shared "common"/"gender" namespaces
assets/images/            Cutit-branded icon.png / android-icon-*.png / favicon.png / splash-icon(-dark).png (derived from cutit-mark.svg, a crop of the wordmark's scissors motif) + the full cutit-logo.svg wordmark
global.css                Tailwind directives (imported once in app/_layout.tsx)
tailwind.config.js        NativeWind preset; fontFamily.serif = Fraunces_600SemiBold, fontFamily.sans = Inter_400Regular
babel.config.js / metro.config.js   NativeWind wiring + react-native-svg-transformer (.svg → component)
svg.d.ts                  Types `*.svg` imports as React components
eas.json                  `development` build profile (developmentClient + internal distribution) for testing outside Expo Go — no build run yet
```

~5,960 lines of app code.

---

## 5. Screens & feature inventory

Legend: ✅ works (with mock data) · 🟡 visual only, no handler · ❌ missing

### Onboarding / Auth
- ✅ Slide carousel with dots, Continue / Get Started, Continue as Guest
- ✅ Country code picker (pressable segment + modal list, defaults to Egypt `+20`) prefixed onto the phone number
- ✅ 6-box OTP input with auto-advancing focus, backspace-to-previous, and auto-submit the instant all 6 digits are filled
- ✅ Profile step (name/email) with disabled-state validation; "Continue as Guest" is a pinned, underlined footer on both the phone and OTP screens
- ✅ The three steps are now `lib/api/user.ts` calls (`requestOtp`/`verifyOtp`/`completeProfile`) via `lib/hooks`, not local-only state — `verifyOtp` is what actually flips `isSignedIn`. Same three step components also power guest checkout (see the Venue/Go Booking sections below and §2.13).
- 🟡 "Resend code in 30s" is static text; OTP still accepts any well-formed 6 digits (mock, not real Twilio/Vonage verification, see §9.2)

### Home
- ✅ Header (dark-mode toggle, guest/user avatar toggle that flips `isSignedIn`, menu icon → `/menu`)
- ✅ Gender toggle, search, service filter chips, "Near you" list with skeleton + empty state + Refresh
- ✅ Recommended for You feed (gender-aware when signed in)
- ✅ "Near you" list cards' heart icon now toggles real shared favorite state (see §6) — the Recommended for You feed above it has no heart at all (bespoke card, doesn't use `EstablishmentCard`)
- ✅ Venues now come from `useVenues()` (real loading/error states) instead of a static import; the "Refresh" button, which used to just fake a 1.2s spinner, now calls the hook's real `refetch()`
- 🟡 Bell, "Cairo, Egypt" picker, filters button, rebook banner
- The service-shortcuts chip row (At Home / Events & Bridal / Hair & Barbering / Beauty & Care) that used to sit here is gone — At Home/Events & Bridal moved to the new Cutit Go tab below, and the remaining two chips were removed with it (no replacement filter chips on Home currently)

### Explore
- ✅ Full-bleed map background with a draggable `@gorhom/bottom-sheet` list on top (peeks at ~22%, drags down to ~14% to reveal the map, up to ~92% to cover the screen — scrolling the list also expands it via the sheet's built-in gesture handoff)
- ✅ Fixed top chrome (search bar, Venues/Professionals toggle, "Anytime" dropdown, sliders icon, horizontal day-picker) stays pinned above the sheet at every drag position
- ✅ Map pins render as star + rating badges; tapping one highlights it (blue)
- ✅ Venues now come from `useVenues()`; the `BottomSheetFlatList` gained a `ListEmptyComponent` for loading (skeletons) and error+retry — this screen had no loading affordance at all before
- 🟡 The top search bar is now a static "All treatments / Current location" pressable (no handler) — Explore lost free-text filtering when the old TextInput-based search bar was replaced; gender filter (from context) is the only thing still actually filtering the list
- 🟡 "Venues"/"Professionals" toggle, "Anytime" dropdown, and the sliders/list-filter icon buttons are all visual only; map is still the CSS-pattern placeholder, not a real map

### Cutit Go (`/(tabs)/cutit-go`, tab) → Booking Flow → Stylist Detail → Go Booking (4 steps) → Confirmation
- ✅ Cutit Go tab shows two cards ("At Home", "Events & Bridal") that each push (card, not modal) into `booking-flow.tsx?type=...`
- ✅ `booking-flow.tsx` has its own local "For Him"/"For Her" toggle (defaults from `activeGender` but never writes back to it) and lists `StylistCard`s via `useStylists({ type, gender })` — verified both directions show different, correct stylists
- ✅ Tapping a stylist forwards `type` into `/stylist/[id]`, a full detail screen (photo, specialties, rating, bio, years of experience, "Available for" badges, portfolio grid, written reviews) via `useStylist`/`useStylistReviews`, with a real "Book {name}" button
- ✅ "Book" pushes into the `go-booking` modal group (`stylistId`+`type` as route params) — a 4-step wizard: **Services** (multi-select, running subtotal) → **Address** (saved addresses + inline add-new form, optional event date/notes for `events-bridal`) → **Date & Time** (day picker + duration-aware slots via `useSlots()`) → **Review** (full summary, `calculateTravelFee()`, "Confirm Booking")
- ✅ Confirming builds a real `Booking` (`bookingType: 'at-home' | 'events-bridal'`, `stylistId`, `addressId`, `travelFeeEGP`, computed `endTime`, starts `pending`) via `useCreateBooking()`, and routes to the shared `/booking-confirmation` screen — **guests get `CheckoutAuthSheet` first** (phone → OTP → profile, over this same screen) and the identical booking-submit code runs once they're signed in (§2.13)
- ✅ Verified end-to-end with Playwright, both signed-in and as a fresh guest — full flow → confirmation → Bookings tab, zero console/page errors
- 🟡 The `Stylist` entity (see §6) is a real, dedicated data model now (not borrowed salon `staff`), but it's still only 7 hand-written mock rows — no real mobile-provider onboarding/CRUD exists
- 🟡 Wizard draft state (`GoBookingDraftContext`) is lost if the app reloads mid-flow — acceptable for a modal wizard, but worth knowing if deep-linking into a specific step is ever wanted

### Venue detail / booking (`/venue/[id]`)
- ✅ Stylist picker: an explicit **"Any Stylist"** card (generic icon, "First available") is always the first option, and picking someone — a named staff member or "Any Stylist" — is now **mandatory**; Confirm stays disabled with an amber hint until one is chosen. Service multi-select with search, 7-day date strip, live total.
- ✅ Time slots are availability-aware via `useSlots()` (wrapping `generateTimeSlots()`): derived from the venue's opening hours, the selected staff member's (or, for "Any Stylist", the whole venue's) existing bookings, and the selected services' combined duration — a slot overlapping a booking (or landing in the standing lunch-break rule) renders disabled
- ✅ Venue cover photo falls back to a bordered placeholder block (camera/image icon) if `venue.coverImageUrl` is ever null
- ✅ Written reviews list below the aggregate rating (initials avatar, star rating, text) via `useVenueReviews()`; Write a Review modal (rating + always-optional text)
- ✅ Header heart icon toggles real shared favorite state (fills red when favorited)
- ✅ Confirm builds a real `bookingType: 'salon'` `Booking` via `useCreateBooking()` and routes to the shared `/booking-confirmation` screen — **guests get `CheckoutAuthSheet` first**, same pattern as Go Booking above (§2.13)
- ✅ The whole screen now has real loading (all four parallel fetches — venue, staff, services, reviews — gated together) and error+retry states, distinct from the pre-existing "bad id → redirect home" case
- 🟡 Submitting a review still doesn't append to the reviews table

### Booking Confirmation (`/booking-confirmation`, modal)
- ✅ Shared by both salon bookings (venue detail) and Go bookings (the go-booking wizard); looks the booking up via `useBooking(bookingId)` and renders a status icon, a summary card (venue+staff for salon — "Any Stylist" shown with no parentheses when `booking.anyStaff` — stylist+address+travel fee for Go), date/time, and total
- ✅ "View in Bookings" does `router.dismissAll()` then `replace('/(tabs)/bookings')`, correctly clearing the whole booking-flow/venue stack rather than leaving it underneath; swipe-to-dismiss and Android hardware back are both disabled at the route level so this is a true terminal screen
- 🟡 "Add to Calendar" is a placeholder (no `expo-calendar` integration yet)

### Bookings
- ✅ Upcoming and Past History are real `FlatList`s (via `components/booking-card.tsx`) over `useBookings()` — sorted (soonest-first / most-recent-first) with proper empty states, not the old "one hardcoded card per status" screen
- ✅ Every upcoming card shows a **Pending → Confirmed → Completed timeline** (`components/booking-timeline.tsx`) under the date/time row; a cancelled booking (always shown under Past History) gets a single muted "Cancelled" state instead
- ✅ The countdown banner uses only the *soonest* upcoming booking and doesn't render at all when there are none
- ✅ "Need Help with this Booking?" now passes `bookingId` into `/help`, which shows a summary for that specific booking
- 🟡 Still not persisted across reloads (in-memory `lib/api` store, see §6); Call / Directions have no handlers

### Profile
- ✅ Dark-mode toggle (NativeWind `useColorScheme`), gender toggle (shared context), language toggle, reminder/offers toggles, Log Out (→ onboarding)
- ✅ Name, phone, and email now come from `useCurrentUser()` (backed by `lib/api/user.ts`'s in-memory record) instead of a hardcoded "Amira Nabil" string — this is what makes a just-created guest account visible here immediately after checkout (§2.13)
- ✅ "In-App Chat Support" row now navigates to `/chat-support`
- 🟡 Stats, addresses (list), wallet, cards are still hardcoded; language toggle changes nothing; every other SettingRow, Add Address, Top up, Edit, Delete Account are inert

### Chat Support (`/chat-support`, modal)
- ✅ Message list seeded with one support greeting; typing and sending appends a right-aligned bubble to local `useState`, left-aligned bubbles for support
- 🟡 No backend — messages aren't sent anywhere, nothing persists, support never actually replies

### Help (`/help`, modal)
- ✅ Booking-aware: reads a `bookingId` param, resolves it via `useBooking()`, and shows a compact summary card (name, "Any Stylist"/staff name, date/time, status pill) at the top
- ✅ Reschedule Booking navigates to `/reschedule?bookingId=...`; Cancel Booking runs a real confirm `Alert` → `cancelBooking()` → back to Bookings, where the card now shows Cancelled. Both actions are hidden once the booking is completed/cancelled, or when there's no `bookingId` at all (Menu's generic Help entry point still works as before)
- ✅ Chat Support row → `/chat-support`, unchanged

### Reschedule (`/reschedule`, card push)
- ✅ New screen: shows the current appointment for reference, then the same day-pill + time-slot-grid pattern as booking (via `useSlots()`), scoped to the same venue+staff or stylist and the booking's total service duration (excluding the booking's own current slot from its own conflict check when rescheduling a Go booking)
- ✅ Confirm calls `rescheduleBooking(id, startTime, endTime)` (status goes back to `pending`, so the timeline and mock auto-confirm both replay) and returns to Bookings via `dismissTo`

### Menu (`/menu`, modal)
- ✅ Opened from the header ≡ icon; Favorites (→ `/favorites`) / My Bookings (→ Bookings tab) / Help (→ `/help`) / Settings (→ Profile tab) / Sign Out (same pattern as Profile's Log Out)

### Favorites (`/favorites`, modal)
- ✅ Lists favorited venues via `useVenues()` + `useFavorites()` combined, rendered with the reused `EstablishmentCard`; loading (skeletons), error+retry, and the existing empty state (heart icon + message + "Browse venues" → Explore) all render in that priority order
- ✅ Un-favoriting a card here (or anywhere else) updates this list immediately via the shared `lib/api` invalidation bus
- 🟡 Favorite state still resets on reload — it's a `lib/api` in-memory store now (moved off `AppStateProvider`, see §2.12), not yet persisted

---

## 6. State & data model

- **Server state**: fully behind `lib/api/*` + `lib/hooks/*` (see §2.12 and §4). `lib/data.ts` exports the static mock tables and the pure derivation helpers, but a guardrail comment at its top says only `lib/api/*` may import them as values — every screen goes through a hook instead. Concretely:
  - **Pure reads** (`venues`, `stylists`, `services`, `reviews`) are just wrapped in `delay()` + returned — nothing to mutate, so `lib/api/venues.ts`/`stylists.ts` have no store of their own.
  - **Mutable resources** (`bookings`, `addresses`, `favorites`, the current `user`) each own a private in-memory array/object inside their `lib/api/*` module, seeded once from `lib/data.ts` at import time and never touching the original export again. Each pairs with a `subscribe`/`invalidate` bus (`lib/api/_internal/bus.ts`) so a mutation (`createBooking`, `addAddress`, `toggleFavorite`, `completeProfile`, ...) tells every hook watching that resource to refetch — this is exactly the job a query library's cache invalidation does, and is meant to be deleted wholesale (along with `useAsync`/`useMutation`) the day TanStack Query goes in, without touching any call site.
  - **`lib/api/slots.ts`** is the availability seam: `listSlots(...)` wraps `generateTimeSlots`/`generateStylistTimeSlots`, so a real backend computing this server-side only changes this one function's body.
- **App state** (`lib/app-state.tsx`): now genuinely just session/UI state — `hasOnboarded`, `isSignedIn`, `activeGender`, `language` (persisted), `isHydrated`. **Resets on every app launch/reload** except `language` (written to `AsyncStorage` on change, re-applied via a hydration `useEffect` on startup, see §2.6). Everything that used to live here (`bookings`, `addresses`, `favoriteVenueIds`) moved to the `lib/api` stores above in §2.12 — they still reset on reload today (the stores are just module-level variables), but that's now a one-place fix (swap the seed + persistence inside each `lib/api/*` module) rather than an `AppStateProvider` change.
- **Theme**: NativeWind's built-in colour scheme (`useColorScheme()` from `nativewind`); follows the system by default, toggled from the header or Profile. Also not persisted.
- **Go-booking wizard draft** (`app/go-booking/_layout.tsx`'s `GoBookingDraftContext`): selected service ids, chosen address id, event date/notes, selected date/time — scoped to the 4-step flow only, deliberately **not** part of shared state since it's meaningless outside an in-progress booking. Only the finished `Booking` crosses into the shared `lib/api` store, via `useCreateBooking()`.
- **Venue-detail booking selection** lives in local `useState` inside `venue/[id].tsx` (separate from the go-booking draft above, since salon booking is a single screen, not a wizard) and is discarded once `useCreateBooking()` resolves.
- **Guest checkout draft** (`components/checkout-auth-sheet.tsx`): phone/OTP/name/email/gender fields live in the sheet's own `useState`, reset on close or success — never touches the booking draft it's layered over, and the underlying venue/review screen is never unmounted while it's open (see §2.13).

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
  venueId: string | null; staffId: string | null
  anyStaff?: boolean                         // true when staffId is null because the customer chose "Any Stylist" — see ANY_STAFF_ID below
  stylistId: string | null; addressId: string | null
  travelFeeEGP?; eventDate?; eventNotes?
  serviceIds: string[]; startTime; endTime; status: 'pending' | 'confirmed' | 'completed' | 'cancelled'; priceEGP; createdAt
}
type Review = { id; bookingId; venueId; userId; rating; text: string | null; authorName; createdAt }
type User = { id; fullName; email; phone; avatarUrl: string | null; gender; addresses: Address[]; walletBalance }
type Favorite = { id; userId; venueId; createdAt }   // a user↔venue join, not an isFavorite field on Venue — matches the Booking/Review pattern
```

`ANY_STAFF_ID` (`lib/data.ts`, re-exported via `lib/api`) is a **client-side selection sentinel only** — it's what `selectedStaff` holds in `venue/[id].tsx` and what `listSlots(...)`'s `staffId` param recognizes as "no specific staff, check the whole venue's bookings instead." It is *never* what a stored `Booking.staffId` equals: `createBooking` translates it to `{ staffId: null, anyStaff: true }` at write time, so the "any stylist" case is an explicit, typed part of the `Booking` contract rather than a magic string a future backend would have to special-case.

Mock tables: `venues`, `staff`, `stylists`, `services`, `reviews`, `bookings`, `favorites`, `currentUser`, plus `serviceFilters` (unchanged, still a plain array screens read directly — it's a static list of labels, not something a backend would ever serve dynamically). `lib/api`'s in-memory stores (see above) seed from these once; `AppStateProvider` no longer touches any of them. Derived-data helpers stand in for what would be backend queries/RPCs — all now called from inside `lib/api/*`, not from screens directly:
- `getVenueStaff/Services/Reviews(venueId)`, `getStylistServices/Reviews(stylistId)`, `getStylistsByType(type)` — the joins a real `select('*, staff(*), services(*)')` query would do.
- `getVenueStartingPrice(venueId)` — cheapest service, not a stored/guessed number; and `isVenueOpenNow(openingHours)` — live-computed "Open"/"Closed" badge. Both are pure/synchronous and re-exported from `lib/api/index.ts` unwrapped (no `delay()`) since they're formatting derivations over data a screen already has in hand, not their own fetch.
- `generateTimeSlots({ venueId, staffId, serviceId, date, durationMinutes? })` — availability from venue hours + existing `bookings` + service duration (a hardcoded lunch-break rule at hour 13 stands in for a real per-staff schedule exceptions table, which doesn't exist yet). Still only checks the **static seed** `bookings`, not the live `lib/api/bookings.ts` store — it has no `bookingsList` override, unlike its stylist counterpart below; a pre-existing simplification carried over as-is during the `lib/api` migration rather than fixed, to keep that migration a pure relocation.
- `generateStylistTimeSlots({ stylistId, durationMinutes, date, bookingsList? })` — same idea for the go-booking wizard and reschedule, reading the stylist's own `availability` instead of a venue's; no lunch-break rule. `lib/api/slots.ts` now always passes the **live** `lib/api/bookings.ts` store as `bookingsList` (optionally minus the booking being rescheduled, via `excludeBookingId`) — this unifies what used to be two different behaviors (the go-booking wizard checked only static seed data, reschedule checked a live list) into one.
- `getBookingDetails(booking, addresses)` — resolves the venue/staff/stylist/address/services for a booking in one call; still synchronous (kept that way to avoid a second round of hook plumbing), re-exported via `lib/api/index.ts` so it's never imported from `lib/data.ts` directly.
- `calculateTravelFee(area)` (`lib/travel-fee.ts`) — flat EGP 50 base fee plus a per-Cairo-area surcharge table (New Cairo 0, Zamalek/Maadi 20, Heliopolis 30, Sheikh Zayed 50, else 40) — a placeholder pricing rule, not distance-based.

The booking lifecycle's mock auto-confirm (`lib/api/bookings.ts`'s `scheduleMockAutoConfirm`, a `setTimeout` that flips a `pending` booking to `confirmed` after 5s) is explicitly commented **MOCK ONLY** — delete the whole function and its two call sites (`createBooking`, `rescheduleBooking`) once a real backend confirms bookings itself.

Screen-local state that isn't in a shared context (each resets on unmount/reload, same as everything else): `chat-support.tsx`'s message list, `menu.tsx`'s row taps, `reschedule.tsx`'s selected date/time.

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
- **Segmented digit input** (`components/otp-step.tsx`): an array of single-char `TextInput`s with a `ref` array, auto-advancing focus forward on entry and back on backspace-into-empty — not a library, hand-rolled since none was installed.
- **Fixed overlay + full-bleed background**: when a screen layers a fixed top/bottom control strip over a full-bleed background (Explore's map, any future full-bleed layout), the fixed strip needs its own opaque page-background color (`bg-[#f7f5f1] dark:bg-zinc-950`) — a transparent strip lets whatever's layered underneath bleed through the gaps between its child elements.
- **Multi-step modal flow** (`app/go-booking/`): when a flow has several internal steps that should all open as *one* modal (not one modal per step), give the group its own `_layout.tsx` with a nested `<Stack>` and register only the group itself as `presentation: 'modal'` in the root `_layout.tsx` — never register the individual step screens. Steps then push as normal card transitions inside the already-open modal. Carry step-to-step selections in a small React Context scoped to that group's `_layout.tsx` (e.g. `GoBookingDraftContext`), not in shared app state — only the final committed result (here, the finished `Booking`) belongs there.
- **In-flow auth over a booking screen** (`components/checkout-auth-sheet.tsx`): when a flow needs to interrupt itself for a short side-task (here: sign-up) without losing the user's place, present it as a `Modal` *over* the current screen rather than navigating to a new route — the screen underneath stays mounted (just visibly dimmed by the modal backdrop), so nothing about its draft state needs saving/restoring. Compose the same step components (`phone-step.tsx`/`otp-step.tsx`/`profile-step.tsx`) the full-screen version uses rather than duplicating the UI; the modal's only job is sequencing them and calling back into the screen's own submit logic on success.
- **Reusable wizard steps as components, not routes**: `PhoneStep`/`OtpStep`/`ProfileStep` accept only data + callbacks (`onSubmit`, `isPending`, optional `title`/`subtitle` overrides) — no navigation, no data fetching of their own — so the exact same UI works both as a full route (`app/auth.tsx`) and inside a modal (`checkout-auth-sheet.tsx`) with different copy and an extra gender toggle in the latter.
- **Falsy-empty-string JSX gotcha**: `{value && <Text>...}` renders a literal (invalid) empty text node when `value` is `''` rather than `undefined`/`false` — bit `components/settings-rows.tsx` once real (possibly-empty-while-loading) data replaced a hardcoded string. Always write conditionals over a possibly-`''` string as `{value ? <X/> : null}`, never `{value && <X/>}`.

---

## 8. Known limitations & gotchas

- State and theme reset on reload (no AsyncStorage/MMKV yet).
- Map, location, calls, directions, notifications are all placeholders (the WhatsApp Support button was removed from Bookings this session — that entry point now lives in Help/Chat Support instead).
- App icon/splash/adaptive-icon are real Cutit branding now, but it's a quick mark derived from the wordmark's scissors motif, not final polished brand design — worth a real design pass later. `Logo` itself is still the text placeholder on purpose (the real wordmark SVG caused a native crash — "Element type is invalid" — most likely because the dev client needed a restart to pick up the new `metro.config.js` transformer; re-wire it via `assets/images/cutit-logo.svg` once that's confirmed fixed on-device).
- Images are hot-linked from Unsplash / pravatar — fine for demos, not for production.
- No ESLint/Prettier config (`expo lint` will prompt to create one), no tests, no CI — the `lib/api` guardrail (§2.12, §4) is therefore a comment + a manual grep, not an enforced lint rule; see §9.4 to add one.
- `expo-env.d.ts` is generated and gitignored; TypeScript needs it for `*.css` imports — it's created on first `expo start`.
- The Explore/Home duplication from v0 was intentionally split: Home = discovery + list, Explore = map/list. Explore lacks the service filter chips.
- **Testing dark mode**: NativeWind's color scheme on web is in-memory only. A full page reload (`page.goto`) or a browser context's emulated `prefers-color-scheme` does **not** reliably toggle it — the only reliable way is tapping the in-app dark-mode toggle and then navigating client-side (`router.push`, not `goto`) so the JS state survives.
- **Testing the Explore bottom sheet**: synthetic mouse-drag gestures (e.g. Playwright) can land on an underlying list item instead of the sheet's drag handle and trigger a tap/navigation instead of a drag. Start the drag precisely on the handle, not generic mid-screen coordinates.
- **Testing with Playwright after the `lib/api` migration**: `page.goto(...)` is a full reload and wipes every in-memory `lib/api` store (bookings, addresses, favorites, the user record) just like a real app relaunch would — to verify a mutation actually persisted within a session, navigate client-side (tap through the app) rather than reloading between steps. Also, ambiguous text like `getByText('Explore')` can match "Explore both" on Home before it ever reaches the Explore tab label — prefer `{ exact: true }` for short nav labels.
- **`react-native-web`'s `Alert.alert()` is a no-op stub** (confirmed by reading its source) — it neither shows anything nor invokes callbacks. The Cancel-booking confirm dialog in `help.tsx` and any future `Alert`-based confirm can only be verified for real on a native device/simulator; on web, tapping the button that triggers it is silently inert.

---

## 9. Recommendations

Ordered roughly by impact. **Replace** = swap a placeholder for the real thing; **Add** = missing capability.

### 9.1 Commit the migration first
Nothing here is in git yet. Commit the Expo migration as one baseline commit before building further so there's a clean diff for everything after.

### 9.2 Replace

| Placeholder today | Recommended replacement | Why |
|---|---|---|
| `lib/api/*` mock modules (already Supabase-shaped and already behind an async seam, see §2.12) | **Supabase** (Postgres + Row-Level Security + Storage + phone OTP auth via Twilio/Vonage) accessed through **TanStack Query** | This is now much closer than before: swap each `lib/api/*` function's body for a real Supabase call and delete `_internal/{delay,bus}.ts` + `useAsync`/`useMutation` for real `useQuery`/`useMutation` — no screen changes needed, since every screen already goes through `lib/hooks/*`. Phone OTP fits the existing auth UI (`requestOtp`/`verifyOtp` already have the right shape, just mocked); RLS keeps the customer app safe without a custom API layer. Firebase is the alternative if you prefer NoSQL + FCM. |
| In-memory `lib/api/*` stores (language still the only thing persisted, see §2.6) | Persist with **react-native-mmkv** (or AsyncStorage, already a dependency): onboarding done, session, gender, bookings, addresses, favorites, the user record, theme | Users shouldn't re-onboard on every launch, and everything else resetting is an easy near-term win now that AsyncStorage is already wired for language — and now that this state lives in a handful of `lib/api/*` modules instead of scattered across `AppStateProvider`, persisting it is a smaller, more contained change (§2.12). |
| Mock `requestOtp`/`verifyOtp` in `lib/api/user.ts` (any 6 digits succeed, see §2.13) | Supabase Auth phone sign-in (or Firebase Auth) with a real resend timer | Currently anyone can "log in" (or, since §2.13, complete guest checkout) with any 6-digit code. |
| ~~`Alert` on Confirm Booking~~ | **Done** — both Venue detail and the go-booking wizard call `useCreateBooking()` and route to a shared `/booking-confirmation` screen (summary, add-to-calendar placeholder, "View in Bookings"); guests get an in-flow sign-up sheet first (§2.13) rather than being blocked | Still local-only: `createBooking()` writes to an in-memory `lib/api` store, not a real backend, so it resets on reload. The real remaining work is a Supabase insert once a backend exists — the seam is already there. |
| `ExploreMap` pattern | **`react-native-maps`** (Google on Android, Apple on iOS) + **`expo-location`** for "near you" and "Search this area" | Location-based discovery is central to the product; `Venue` already carries `latitude`/`longitude`. |
| ~~Hardcoded `Amira Nabil` user~~ | **Partially done** — Profile's name/phone/email now come from `useCurrentUser()` (§2.13), populated for real once a guest completes checkout | Stats, addresses (list), wallet, and cards are still hardcoded; back those with real backend tables once Supabase exists. |
| Unsplash / pravatar images | Supabase Storage (or Cloudinary) with `expo-image` caching | Hot-linked images break and are unreliable. |

### 9.3 Add — product

1. ~~At-home and Events & Bridal booking flows.~~ **Done** (§2.9/§2.10, §5) — Cutit Go tab → gender toggle → stylist list → stylist detail → 4-step go-booking wizard (services, address, date/time, review) → confirmation, all working end-to-end with mock data. Still needed: **real payment** (nothing charges anything yet — Confirm Booking just writes a local record) and a **real mobile-provider dataset** (the 7 mock `Stylist` rows are hand-written, not a real onboarding/CRUD system).
2. ~~Booking lifecycle: cancel, reschedule, status timeline.~~ **Done** (§2.11, §5) — `cancelBooking`/`rescheduleBooking`, a `pending → confirmed → completed` timeline on every upcoming card, and a mock auto-confirm timer standing in for the venue/stylist accepting the job. Still open: **no-show/late policies** (nothing tracks or penalizes these yet).
3. **Payments**: **Paymob** and/or **Fawry** for Egypt (cards, wallets, cash-on-service), plus Apple Pay/Google Pay; connect the existing wallet UI to real balance/top-ups.
4. **Arabic + RTL** — in progress: `i18next` + `expo-localization` infrastructure is built, the language toggle is wired to `i18n.changeLanguage()` and persists via AsyncStorage (survives restarts), and roughly **70–80% of the app's strings are translated** (all of `app/` is done; the `components/` group is not yet). **RTL layout mirroring itself is unverified** — `I18nManager.forceRTL` doesn't visually mirror the layout even after a full app restart in Expo Go, matching a currently unresolved upstream Expo/RN issue reported across iOS/Android/web ([expo/expo#39752](https://github.com/expo/expo/issues/39752)). Testing in a real dev-client/production build (to rule out an Expo-Go-only quirk) is blocked on not having an Apple Developer account for an iOS ad-hoc build; an Android EAS build remains a lower-friction untested alternative. Parked until build access is available, or until the decision is made to stop relying on automatic `flexDirection` mirroring and make direction explicit everywhere instead.
5. **Notifications**: `expo-notifications` for appointment reminders (the toggle exists) and booking status changes; deep links via the `cutit://` scheme already set in `app.json`.
6. ~~Favourites~~ **done** (§2.7) — still needed: persist `favoriteVenueIds` (currently resets on reload, like most of `AppStateProvider`) and add a heart to `recommendation-feed.tsx`'s bespoke card if that feed should support favoriting too. **Full reviews list** with photos, **real search & filters** (price range, rating, distance, open now, gender) remain open.
7. **Venue/partner side** (later): a separate dashboard or app for salons to manage calendar, staff, services, and confirm bookings. Without it, bookings have no one to fulfil them.
8. ~~Guest → account upgrade: let a guest book by providing a phone number at checkout, then convert to a full account.~~ **Done** (§2.13, §5) — a guest can walk the entire salon or Cutit Go flow and only creates an account (phone → OTP → name/email/gender) at the moment they hit Confirm, via an in-flow sheet over the booking screen. Still mock auth underneath (see the OTP row above), but the product flow itself is real.

### 9.4 Add — engineering

- **Tooling**: ESLint (`eslint-config-expo`) + Prettier, `jest-expo` + React Native Testing Library for components and booking logic, GitHub Actions running `typecheck`, lint, tests. The very first custom rule to add once ESLint exists: a `no-restricted-imports` entry forbidding value imports of `lib/data.ts`'s tables/`generate*`/`get(Venue|Stylist)*` helpers from anywhere outside `lib/api/**` — today that's just a comment + a manual grep (§2.12, §8).
- **EAS**: `eas build`, `eas submit`, and `eas update` (OTA) configured with a dev/preview/production profile; move secrets to EAS env vars.
- **Observability**: Sentry (`@sentry/react-native`) for crashes; PostHog or Amplitude for funnel analytics (onboarding → booking).
- ~~Loading/error states everywhere once data is remote.~~ **Done for the read side** (§2.12) — every screen migrated off `lib/data.ts` now has real loading (`SkeletonCard` for lists, a simple message otherwise) and error+retry (`components/error-state.tsx`) states, even though the "backend" is still mock. Still open: **offline handling** (nothing detects or reacts to a lost connection, since there's no real network call yet to fail that way).
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
- ~~The Bookings tab's "Upcoming" card is a single `.find()`, not a list~~ — **Resolved in §2.11**: `bookings.tsx` is now a real, sorted `FlatList` over every upcoming booking.
- **The go-booking wizard's draft state is intentionally ephemeral.** `GoBookingDraftContext` (services/address/date/time selections) lives only in memory for the lifetime of the `go-booking` route group and is discarded on `router.back()` past step 1 or a reload — matches the instruction to keep it out of `AppStateProvider`, but means there's no "resume where you left off" if the app is killed mid-booking. Fine for a mock-data prototype; would need reconsidering (e.g. persisted draft, or a single-screen wizard) if drop-off during a multi-step native flow becomes a real concern.
- **`calculateTravelFee()` is a flat lookup table, not distance-based.** It maps `Address.area` (a free-text string on `Address`, not a controlled enum) to a surcharge via exact string match, falling back to a default surcharge for anything unrecognized (including new user-entered areas from the "add address" form, which are never validated against the known area list). Fine for a demo; a real implementation would need either a controlled area picker or real geocoding + distance calculation.
- **End-to-end Playwright verification for this flow is now on record**: guest onboarding → Cutit Go tab → At Home → gender-filtered stylist list → stylist detail → 4 go-booking steps (with a real new address typed in and saved) → review totals math-checked (services subtotal + area travel fee) → confirm → confirmation screen → View in Bookings, all with zero console/page errors. This is the first booking flow in the app verified this thoroughly end-to-end rather than screen-by-screen.

### 9.12 New since the last update (2026-09-17 → 2026-09-20 — lifecycle, the lib/api migration, and guest checkout)

- **`ANY_STAFF_ID` changed what it means twice in quick succession.** First it went from "not modeled at all" (venue staff selection was optional) to a mandatory choice with its own sentinel stored directly on `Booking.staffId`. Then, during the `lib/api` migration, it became purely a client-side query sentinel — `createBooking` now converts it to `{ staffId: null, anyStaff: true }` at write time, and the one seed booking that used to store the sentinel string (`bk3`) was migrated to match. Any code (or memory) that still says "staffId can equal ANY_STAFF_ID on a stored Booking" is out of date — check `booking.anyStaff` instead.
- **The `lib/api` migration was scoped in four reviewed groups on purpose** (confirmation+favorites+stylist-card → venue/stylist-detail+booking-flow → go-booking wizard → Home+Explore), each one typechecked, guardrail-grepped, and Playwright-verified before moving on. Mid-migration, some files legitimately still imported `lib/data.ts` values directly (later groups hadn't landed yet) — the guardrail grep in §2.12 is only meaningful as a *final* check across all groups, not a per-group one.
- **A real, pre-existing bug surfaced only because data became genuinely async**, not introduced by the migration itself: `components/settings-rows.tsx`'s `{value && <Text>}` falsy-empty-string text-node bug (§2.13, §7) — invisible while `value` was always a hardcoded non-empty string, first triggered by Profile's name field being legitimately `''` for the brief window before `useCurrentUser()` resolves.
- **Every "if no data, treat as not-found" branch needed a second look during the migration**, not just a mechanical swap. `venue/[id].tsx`'s original `if (!establishment) return <Redirect>` (for a bad venue id) would have also fired during the brief `isLoading` window once `establishment` came from `useVenue()` instead of a synchronous array lookup — it was rewritten up front to check `isLoading`/`hasError` first, falling through to the redirect only once loading has genuinely finished with nothing found. The same pattern was applied to `stylist/[id].tsx` and the go-booking screens. Worth remembering for any future screen added on top of `lib/hooks`.
- **`useSlots` unified two previously-inconsistent behaviors.** Before the migration, the go-booking wizard's `datetime.tsx` checked availability against only the static seed `bookings`, while `reschedule.tsx` (built slightly later, in the lifecycle pass) already checked a live list. `lib/api/slots.ts` now always uses the live `lib/api/bookings.ts` store for stylist slots — a deliberate, small behavior improvement inherent to centralizing state behind one repository, not an accidental side effect. Salon slots (`generateTimeSlots`) still only check the static seed data (see §6) — that inconsistency between salon and Go availability checking is now a known, named gap rather than an invisible one.
- **`react-native-web`'s `Alert.alert()` being a no-op stub (§8) means the Cancel-booking confirm dialog has never actually been exercised in any of this session's testing** — only that tapping the button that triggers it doesn't crash. Budget real device/simulator time to confirm the dialog itself, and that `cancelBooking()` fires from its destructive button, before trusting that flow.
- **Guest checkout reuses `activeGender` as the sign-up form's default, not a fresh choice.** `CheckoutAuthSheet`'s gender toggle is prefilled from the shared context and can be changed before submitting, but if a guest never touches Home's own toggle first, they'll see whatever the app's default ("For Her") is — worth knowing if a future product decision wants sign-up to force an explicit pick instead of a silent default.
