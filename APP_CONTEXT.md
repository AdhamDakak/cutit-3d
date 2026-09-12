# Cutit — App Context

> Single source of truth for what this app is, how it's built, where it stands, and what should change next. Keep it updated as the app evolves.

_Last updated: 2026-09-12 (auth redesign, Explore rebuild, new support screens, venue detail polish)_

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

---

## 3. Tech stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | Expo SDK 57 (managed), React Native 0.86, React 19.2 | New Architecture (default in SDK 57) |
| Routing | `expo-router` ~57 | File-based; Stack + Tabs; typed routes enabled |
| Styling | NativeWind 4.2 + Tailwind CSS **3.4** | `darkMode: 'class'`; do **not** upgrade to Tailwind 4 (NativeWind 4 targets v3) |
| Icons | `lucide-react-native` (+ `react-native-svg`) | Same icon set the v0 design used |
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
  logo.tsx                Text wordmark "cut**it**" (the SVG logo in assets/images is unused)
lib/
  data.ts                 Establishment/Staff/Service/Review types, 5 mock venues (each with a reviewList), serviceFilters, timeSlots
  app-state.tsx           React Context: hasOnboarded, isSignedIn, activeGender (+ actions)
  theme.ts                useThemeColors() → hex colours for icons (icons can't use `dark:` classes)
assets/images/            Expo template icon/splash placeholders + cutit-logo.svg
global.css                Tailwind directives (imported once in app/_layout.tsx)
tailwind.config.js        NativeWind preset; fontFamily.serif = Georgia
babel.config.js / metro.config.js   NativeWind wiring
scripts/reset-project.js  Leftover from the Expo template (targets src/); safe to delete
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
- ✅ Stylist picker (with a placeholder avatar icon when a staff member has no photo), service multi-select with search, 7-day date strip, time slots grouped by period, live total, Confirm gated on ≥1 service + a time
- ✅ Venue cover photo falls back to a bordered placeholder block (camera/image icon) if `establishment.image` is ever missing
- ✅ Written reviews list below the aggregate rating (initials avatar, star rating, text) sourced from `establishment.reviewList`; Write a Review modal (rating + always-optional text)
- 🟡 Confirm shows a native `Alert` then jumps to Bookings — nothing is saved; heart/save; submitting a review doesn't append to the reviews list; slots aren't availability-aware

### Bookings
- ✅ Upcoming (countdown banner, confirmed card, stylist, Call Venue / Get Directions) / Past (completed + cancelled cards), Leave a Review modal, Rebook → Explore
- ✅ "Need Help with this Booking?" now navigates to `/help`
- 🟡 Everything is hardcoded (two bookings); Call / Directions have no handlers; no cancel or reschedule from this screen itself (WhatsApp Support button was removed — that entry point now lives in Help instead)

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

- **Server state**: none. `lib/data.ts` exports a static `establishments` array. Screens filter it with `useMemo`.
- **App state** (`lib/app-state.tsx`): `hasOnboarded`, `isSignedIn`, `activeGender` in a React Context. **Resets on every app launch/reload** — nothing is persisted.
- **Theme**: NativeWind's built-in colour scheme (`useColorScheme()` from `nativewind`); follows the system by default, toggled from the header or Profile. Also not persisted.
- **Booking selection** lives in local `useState` inside `venue/[id].tsx` and is discarded on confirm.

```ts
type Establishment = {
  id; name; district; category: 'Barbershop' | 'Beauty Salon'
  gender: 'Men' | 'Women' | 'Unisex'; isOpen; rating; reviews; price
  services: string[]; image: string
  staff: { id; name; role; photo? }[]
  serviceList: { name; price; duration }[]
  reviewList: { id; author; rating; text }[]   // added for the venue-detail written reviews list
}
```

Screen-local state that isn't in a shared context (each resets on unmount/reload, same as everything else): `chat-support.tsx`'s message list, `help.tsx`'s placeholder actions, `menu.tsx`'s row taps, `auth.tsx`'s selected country/OTP digits.

---

## 7. Design system & conventions

- **Palette** (Tailwind defaults): background `#f7f5f1` (light) / `zinc-950` (dark); surfaces `white` / `zinc-900`; text `stone-900` / `white`; muted `stone-500` / `zinc-400`; borders `stone-200` / `zinc-800`; primary actions `stone-900` (light) → `blue-600` (dark, and for CTAs like Confirm/Continue); accents `amber-400` (stars), `emerald` (confirmed/completed status badges), `blue-50/100` (info tints), `red-500` (destructive).
- **Typography**: headings use `font-serif` (Georgia on iOS; falls back to the system serif/Roboto on Android). Section eyebrows: `text-[11px] uppercase tracking-[3px]`.
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
- Georgia isn't on Android → headings look different per platform.
- Map, location, calls, directions, notifications are all placeholders (the WhatsApp Support button was removed from Bookings this session — that entry point now lives in Help/Chat Support instead).
- App icon, splash, and adaptive icon are Expo template defaults, not Cutit branding.
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
| `lib/data.ts` mock array | **Supabase** (Postgres + Row-Level Security + Storage + phone OTP auth via Twilio/Vonage) accessed through **TanStack Query** | Fastest path to a real backend for a small team; phone OTP fits the existing auth UI; RLS keeps the customer app safe without a custom API layer. Firebase is the alternative if you prefer NoSQL + FCM. |
| In-memory `AppStateProvider` | Persist with **react-native-mmkv** (or AsyncStorage): onboarding done, session, gender, theme, language | Users shouldn't re-onboard on every launch. |
| Fake OTP flow in `auth.tsx` | Supabase Auth phone sign-in (or Firebase Auth) with a real resend timer | Currently anyone can "log in". |
| `Alert` on Confirm Booking | A real **booking record** + a confirmation screen (summary, add-to-calendar, "View in Bookings") | The core action currently saves nothing. |
| `ExploreMap` pattern | **`react-native-maps`** (Google on Android, Apple on iOS) + **`expo-location`** for "near you" and "Search this area" | Location-based discovery is central to the product. |
| Hardcoded `Amira Nabil` user, stats, addresses, wallet | Profile / addresses / wallet tables in the backend; make `SettingRow`s navigate to edit screens | Everything in Profile is inert today. |
| Text wordmark `Logo` | The real `assets/images/cutit-logo.svg` via `react-native-svg-transformer` | Brand asset exists but isn't used. |
| Expo template icon/splash | Proper Cutit app icon, adaptive icon, splash (`app.json` already points at the right paths) | Store-readiness and first impression. |
| Georgia `font-serif` | Bundle a serif + sans pair with **`expo-font`** (e.g. Fraunces/Playfair Display + Inter) and wire into `tailwind.config.js` | Consistent typography across iOS and Android. |
| Unsplash / pravatar images | Supabase Storage (or Cloudinary) with `expo-image` caching | Hot-linked images break and are unreliable. |
| Hardcoded time slots | Availability computed from staff schedules + existing bookings + service duration | Slots must reflect real capacity. |
| `scripts/reset-project.js` | Delete it (and the `reset-project` npm script) | Leftover from the template; targets `src/`, doesn't apply. |

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
- **Review submission still doesn't persist anywhere**, and this is more visible now that Venue detail shows a real written-reviews list pulled from `reviewList` — a submitted review won't appear in it. Once there's a backend, wire `ReviewModal`'s `onSubmit` to actually insert into that list.
- **"Professionals" browsing mode (Explore) has no data model behind it.** If booking a specific professional across venues (not just per-venue staff) is a real product goal, `lib/data.ts` needs a top-level `Professional` entity independent of `Establishment.staff`.
- **`country-code-picker.tsx`'s list is a hand-maintained array of ~11 countries.** Fine for an Egypt-first MVP; if international expansion becomes real, swap for a maintained dataset (e.g. `react-native-country-codes-picker`) rather than growing the array by hand.
- **The OTP flow now looks fully production-ready** (polished 6-box auto-advance UI) **but still accepts any 6 digits.** The more convincing the UI, the higher the risk of shipping it unverified by accident — bump real OTP verification up in priority alongside phone auth in 9.2.
