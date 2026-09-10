# Cutit

A Cairo salon & barbershop booking app — browse venues, book in-salon or at-home services (barbering, beauty, bridal/events), manage bookings, and a profile/wallet section.

Built with [Expo](https://expo.dev) + [expo-router](https://docs.expo.dev/router/introduction/) + [NativeWind](https://www.nativewind.dev/) (Tailwind for React Native).

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the app:

```bash
pnpm start
```

Then open it in an iOS Simulator, Android Emulator, or the Expo Go app on a physical device.

## Project structure

- `app/` — expo-router routes: `onboarding`, `auth`, the `(tabs)` group (Home, Explore, Bookings, Profile), and `venue/[id]` for the booking flow, presented as a modal.
- `components/` — shared UI building blocks (venue cards, review modal, settings rows, etc).
- `lib/` — mock data (`data.ts`) and app-wide state (`app-state.tsx`).

This is UI-first: all data is currently mocked in `lib/data.ts`. Backend, auth, and payments are not wired up yet.
