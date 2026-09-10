# Cutit — App Context

> Single source of truth for what this app is, how it's built, where it stands, and what should change next. Keep it updated as the app evolves.

_Last updated: 2026-09-10 (day of the Expo migration)_

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
`Onboarding (3 slides)` → `Auth (phone → OTP → profile)` or `Continue as Guest` → `Home` → pick a venue → `Venue detail` (stylist → services → date → time) → `Confirm Booking` → `Bookings` tab.

---

## 2. Project history

1. **v0 (Vercel) phase** — the first ~40–50% of the UI was generated in v0 as a **Next.js + Tailwind web app**: one 700-line `app/page.tsx` that faked a phone frame with `max-w-md` centred in the browser. It had responsiveness problems (mismatched fixed widths, no safe-area handling, blocked pinch-zoom) because it was a web page pretending to be an app.
2. **Expo migration (2026-09-10)** — since the real target is native iOS/Android, the project was rebuilt as an **Expo + expo-router + NativeWind** app. The v0 screens were used as a design/copy reference only; every screen was rewritten with native primitives and real navigation. The old web scaffold was deleted.
3. **Current state** — UI-first prototype with mock data. No backend, no persistence, no payments. **The migration is not yet committed** (~50 changed files in the working tree; last commit `a84abb8` is still the v0 version).

---

## 3. Tech stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | Expo SDK 57 (managed), React Native 0.86, React 19.2 | New Architecture (default in SDK 57) |
| Routing | `expo-router` ~57 | File-based; Stack + Tabs; typed routes enabled |
| Styling | NativeWind 4.2 + Tailwind CSS **3.4** | `darkMode: 'class'`; do **not** upgrade to Tailwind 4 (NativeWind 4 targets v3) |
| Icons | `lucide-react-native` (+ `react-native-svg`) | Same icon set the v0 design used |
| Images | `expo-image` | Remote Unsplash / pravatar URLs for now |
| Safe areas | `react-native-safe-area-context` | Every screen wraps in `SafeAreaView` |
| Language | TypeScript 6 (strict) | `pnpm typecheck` |
| Package manager | pnpm 10 with **`node-linker=hoisted`** (`.npmrc`) | Required: Metro can't resolve `react-native-css-interop` under pnpm's strict layout |

### Commands
```bash
pnpm install
pnpm start            # expo start → QR / i / a / w
pnpm ios | android | web
pnpm typecheck        # tsc --noEmit
npx expo-doctor       # 21/21 checks pass as of migration
```

---

## 4. Project structure

```
app/                      expo-router routes
  _layout.tsx             Root Stack + providers (GestureHandlerRootView, SafeAreaProvider, AppStateProvider, StatusBar)
  index.tsx               Redirect → /onboarding or /(tabs) based on hasOnboarded
  onboarding.tsx          3-slide carousel; "Get Started" → /auth, "Continue as Guest" → /(tabs)
  auth.tsx                phone → OTP → profile steps (all client-side, no real OTP)
  (tabs)/
    _layout.tsx           Bottom tabs: Home / Explore / Bookings / Profile (lucide icons, theme-aware)
    index.tsx             Home
    explore.tsx           Explore (map placeholder ⇄ list)
    bookings.tsx          Upcoming / Past History
    profile.tsx           Profile & settings
  venue/[id].tsx          Venue detail + booking flow (presented as a modal)
components/
  app-header.tsx          Logo, dark-mode toggle, bell, menu, "Discover in Cairo", guest/user avatar toggle
  establishment-card.tsx  Venue card (cover, open/closed, rating, services, price, Book)
  recommendation-feed.tsx Horizontal "Recommended for You" (gender-filtered when signed in)
  service-shortcuts.tsx   At Home / Events & Bridal / Hair & Barbering / Beauty & Care chips (no handlers)
  explore-map.tsx         Fake map: diagonal-line pattern + absolutely positioned pins + selected-pin card
  review-modal.tsx        Bottom-sheet star rating (+ optional text) used by Bookings and Venue
  settings-rows.tsx       SettingRow / ToggleRow for Profile
  skeleton-card.tsx       Loading placeholder
  logo.tsx                Text wordmark "cut**it**" (the SVG logo in assets/images is unused)
lib/
  data.ts                 Establishment/Staff/Service types, 5 mock venues, serviceFilters, timeSlots
  app-state.tsx           React Context: hasOnboarded, isSignedIn, activeGender (+ actions)
  theme.ts                useThemeColors() → hex colours for icons (icons can't use `dark:` classes)
assets/images/            Expo template icon/splash placeholders + cutit-logo.svg
global.css                Tailwind directives (imported once in app/_layout.tsx)
tailwind.config.js        NativeWind preset; fontFamily.serif = Georgia
babel.config.js / metro.config.js   NativeWind wiring
scripts/reset-project.js  Leftover from the Expo template (targets src/); safe to delete
```

~1,800 lines of app code.

---

## 5. Screens & feature inventory

Legend: ✅ works (with mock data) · 🟡 visual only, no handler · ❌ missing

### Onboarding / Auth
- ✅ Slide carousel with dots, Continue / Get Started, Continue as Guest
- ✅ Phone → OTP → profile steps with disabled-state validation (`+20`, ≥10 digits, ≥4-digit OTP, non-empty name)
- 🟡 "Resend code in 30s" is static text; OTP is never verified; email field is unbound

### Home
- ✅ Header (dark-mode toggle, guest/user avatar toggle that flips `isSignedIn`)
- ✅ Gender toggle, search, service filter chips, "Near you" list with skeleton + empty state + Refresh
- ✅ Recommended for You feed (gender-aware when signed in)
- 🟡 Service shortcuts (At Home, Events & Bridal, …), bell, menu, "Cairo, Egypt" picker, filters button, rebook banner, heart/save

### Explore
- ✅ Search, gender filter (from context), Map ⇄ List toggle, pin selection → "View Shop"
- 🟡 Map is a CSS-style pattern, not a real map; "Search this area" and locate buttons do nothing; no service filter chips here

### Venue detail / booking (`/venue/[id]`)
- ✅ Stylist picker, service multi-select with search, 7-day date strip, time slots grouped by period, live total, Confirm gated on ≥1 service + a time
- ✅ Write a Review modal (rating + text)
- 🟡 Confirm shows a native `Alert` then jumps to Bookings — nothing is saved; heart/save; only a rating summary, no review list; slots aren't availability-aware

### Bookings
- ✅ Upcoming (countdown banner, confirmed card, stylist, action buttons) / Past (completed + cancelled cards), Leave a Review modal, Rebook → Explore
- 🟡 Everything is hardcoded (two bookings); Call / Directions / WhatsApp / Help have no handlers; no cancel or reschedule

### Profile
- ✅ Dark-mode toggle (NativeWind `useColorScheme`), gender toggle (shared context), language toggle, reminder/offers toggles, Log Out (→ onboarding)
- 🟡 Hardcoded "Amira Nabil" user, stats, addresses, wallet, cards; language toggle changes nothing; every SettingRow, Add Address, Top up, Edit, Delete Account are inert

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
}
```

---

## 7. Design system & conventions

- **Palette** (Tailwind defaults): background `#f7f5f1` (light) / `zinc-950` (dark); surfaces `white` / `zinc-900`; text `stone-900` / `white`; muted `stone-500` / `zinc-400`; borders `stone-200` / `zinc-800`; primary actions `stone-900` (light) → `blue-600` (dark, and for CTAs like Confirm/Continue); accents `amber-400` (stars), `emerald` (confirmed/WhatsApp), `blue-50/100` (info tints), `red-500` (destructive).
- **Typography**: headings use `font-serif` (Georgia on iOS; falls back to the system serif/Roboto on Android). Section eyebrows: `text-[11px] uppercase tracking-[3px]`.
- **Shape**: cards `rounded-2xl`, inputs/buttons `rounded-xl`, chips `rounded-full`, consistent `px-5` page gutters.
- **Dark mode**: always pair light + `dark:` classes on `View`/`Text`. For icon colours use `useThemeColors()` (`lib/theme.ts`) because SVG props can't take classNames.
- **Components**: `Pressable` (not `TouchableOpacity`), `expo-image`'s `Image`, `SafeAreaView` with explicit `edges`, `ScrollView` with `contentContainerClassName`. Horizontal lists are `ScrollView horizontal` + `flex-row gap-*`.
- **Files**: kebab-case, one component per file, named exports for components, default exports only for routes.
- **Navigation**: `useRouter().push('/venue/${id}')` for detail; `replace` for auth/onboarding transitions so they're not in the back stack.

---

## 8. Known limitations & gotchas

- State and theme reset on reload (no AsyncStorage/MMKV yet).
- Georgia isn't on Android → headings look different per platform.
- Map, location, calls, directions, WhatsApp, notifications are all placeholders.
- App icon, splash, and adaptive icon are Expo template defaults, not Cutit branding.
- Images are hot-linked from Unsplash / pravatar — fine for demos, not for production.
- No ESLint/Prettier config (`expo lint` will prompt to create one), no tests, no CI.
- `expo-env.d.ts` is generated and gitignored; TypeScript needs it for `*.css` imports — it's created on first `expo start`.
- The Explore/Home duplication from v0 was intentionally split: Home = discovery + list, Explore = map/list. Explore lacks the service filter chips.

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
