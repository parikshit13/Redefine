# Redefine — Habit Tracking App

## Project Overview
Redefine is a lifestyle habit tracking app that helps users improve and maintain their ideal lifestyle. Users manually add habits and track them daily. The primary stat is current streaks. The design language is dark, elegant, liquid glass with soft muted accent colors — inspired by Ultrahuman, Tide, How We Feel, and Timespent.

## Tech Stack
- **Framework**: React Native with Expo (managed workflow)
- **Navigation**: @react-navigation/native with @react-navigation/bottom-tabs
- **State**: React Context + useReducer (no external state library for now)
- **Storage**: @react-native-async-storage/async-storage for local persistence
- **Fonts**: Google Fonts via expo-font — `DM Sans` (body) + `Playfair Display` (display headings)
- **Icons**: Custom SVG icons via react-native-svg (no icon library)
- **Animations**: react-native-reanimated for micro-interactions

## Install these dependencies
```bash
npx expo install react-native-svg react-native-reanimated @react-navigation/native @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage expo-font expo-linear-gradient
```

---

## Design System — FOLLOW EXACTLY

### Color Tokens
```typescript
export const colors = {
  // Backgrounds
  bgDeep: '#0B0D11',
  bgCard: 'rgba(255,255,255,0.04)',
  bgGlass: 'rgba(255,255,255,0.06)',
  bgGlassHover: 'rgba(255,255,255,0.10)',
  
  // Borders
  glassBorder: 'rgba(255,255,255,0.08)',
  glassHighlight: 'rgba(255,255,255,0.12)',
  glassBorderActive: 'rgba(255,255,255,0.15)',
  
  // Text
  textPrimary: 'rgba(255,255,255,0.92)',
  textSecondary: 'rgba(255,255,255,0.55)',
  textMuted: 'rgba(255,255,255,0.32)',
  
  // Accent palette — soft, muted tones
  sage: '#8BAF8B',
  sageDim: 'rgba(139,175,139,0.15)',
  sageBorder: 'rgba(139,175,139,0.12)',
  sageGlow: 'rgba(139,175,139,0.20)',
  
  lavender: '#A99BCC',
  lavenderDim: 'rgba(169,155,204,0.12)',
  
  peach: '#D4A589',
  peachDim: 'rgba(212,165,137,0.12)',
  
  sky: '#7BAFD4',
  skyDim: 'rgba(123,175,212,0.12)',
  
  rose: '#CC9BAF',
  roseDim: 'rgba(204,155,175,0.12)',
};
```

### Typography
```typescript
export const typography = {
  displayLarge: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 28,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  displayMedium: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 24,
    letterSpacing: -0.4,
    color: colors.textPrimary,
  },
  heading: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 17,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: colors.textPrimary,
  },
  body: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  caption: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
  },
  overline: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    color: colors.textMuted,
  },
  micro: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10,
    color: colors.textMuted,
  },
};
```

### Spacing Scale (8-point grid)
```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};
```

### Border Radii
```typescript
export const radii = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};
```

### Liquid Glass Surface Styles
Every card and surface uses this "liquid glass" pattern. **This is critical to the aesthetic.**

```typescript
// Primary glass surface (most cards, habit cards, stat cards)
export const glassSurface = {
  backgroundColor: colors.bgGlass,        // rgba(255,255,255,0.06)
  borderWidth: 1,
  borderColor: colors.glassBorder,         // rgba(255,255,255,0.08)
  borderRadius: radii.md,                  // 16
};

// Recessed surface (inputs, secondary panels)
export const glassRecessed = {
  backgroundColor: colors.bgCard,          // rgba(255,255,255,0.04)
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.05)',
  borderRadius: radii.sm,                  // 10 (actually 14 for inputs)
};

// Elevated surface (buttons, floating actions)
export const glassElevated = {
  backgroundColor: colors.bgGlassHover,    // rgba(255,255,255,0.10)
  borderWidth: 1,
  borderColor: colors.glassBorderActive,   // rgba(255,255,255,0.15)
  borderRadius: radii.md,
};

// Accent-tinted surface (streak banner, featured stats, active states)
// Use the accent color at 8% opacity for bg, 12% for border
// Example for sage:
export const glassAccentSage = {
  backgroundColor: 'rgba(139,175,139,0.08)',
  borderWidth: 1,
  borderColor: colors.sageBorder,
  borderRadius: radii.lg,                  // 20 for banner
};
```

### Top Edge Highlight
Every glass card has a subtle top-edge highlight — a horizontal gradient line at the top. In React Native, implement this as a `LinearGradient` component (from expo-linear-gradient) positioned absolutely at the top of each card:
```
height: 1px, left-to-right, colors: ['transparent', 'rgba(255,255,255,0.08)', 'transparent']
```
For accent cards (streak banner), use the accent color instead:
```
colors: ['transparent', 'rgba(139,175,139,0.20)', 'transparent']
```

---

## App Structure

### File Organization
```
src/
├── theme/
│   └── tokens.ts          # All color, typography, spacing, radii tokens above
├── components/
│   ├── GlassCard.tsx       # Reusable glass surface wrapper with top highlight
│   ├── HabitCard.tsx       # Individual habit row (icon, name, meta, check button)
│   ├── StreakBanner.tsx     # Big streak display on home with week dots
│   ├── StatCard.tsx        # Metric card for stats screen
│   ├── StreakItem.tsx       # Streak leaderboard row
│   ├── BarChart.tsx         # Weekly completion bar chart
│   ├── HeatmapGrid.tsx     # Activity heatmap (GitHub-style)
│   ├── IconPicker.tsx       # Grid of selectable SVG icons
│   ├── ColorPicker.tsx      # Row of color circles
│   ├── DayPicker.tsx        # Row of day-of-week toggle buttons
│   ├── FrequencyPills.tsx   # Daily / Weekdays / Custom selector
│   └── GoalStepper.tsx      # +/- counter for goals
├── screens/
│   ├── HomeScreen.tsx       # Main dashboard
│   ├── StatsScreen.tsx      # Statistics & streaks
│   ├── AddHabitScreen.tsx   # Create new habit form
│   └── SettingsScreen.tsx   # Placeholder settings
├── navigation/
│   └── TabNavigator.tsx     # Bottom tab bar
├── context/
│   └── HabitsContext.tsx    # Global habit state + persistence
└── data/
    └── sampleHabits.ts     # Pre-populated demo data
```

### Navigation — Bottom Tab Bar
4 tabs: Home, Stats, Add (+), Settings

Tab bar styles:
- Background: `rgba(11,13,17,0.92)` (near-opaque deep)
- Top border: `1px solid rgba(255,255,255,0.06)`
- Active icon color: `#8BAF8B` (sage)
- Inactive icon color: `rgba(255,255,255,0.32)` (textMuted)
- Label font: DM Sans Medium 10px
- Tab bar height: 80px (including safe area)
- Icons: 22x22, stroke-width 1.5, no fill

---

## Screen Specifications

### 1. HOME SCREEN (HomeScreen.tsx)
Background: `#0B0D11` (bgDeep), full screen, ScrollView

**Greeting section** (top, below status bar):
- Overline: date string, e.g. "MONDAY, MARCH 30" — overline style, textMuted
- Heading: "Good morning, Parikshit" — displayLarge (Playfair 28px)
- Margin bottom: 24px

**Streak Banner** (StreakBanner.tsx):
- Glass accent sage surface (see glassAccentSage above), borderRadius: 20
- Top-edge highlight with sage color
- Layout: flex-row, space-between
  - Left: streak number "14" (fontSize: 42, fontWeight 300, color: sage), "Day streak" caption, "Personal best: 21 days" micro
  - Right: "71%" (fontSize: 24, fontWeight 300, sage), "Today's progress" caption
- Below: row of 7 week dots
  - Completed: 6px circle, filled sage at 70% opacity
  - Today: 6px circle, 1.5px sage border, transparent fill
  - Day labels below: Mon–Sun, micro font
- Margin bottom: 24px

**Today's Habits section**:
- Section header: "Today's habits" (sectionTitle) + "+ Add" (caption, sage color) — flex-row space-between
- List of HabitCard components, 10px gap between

**HabitCard** (HabitCard.tsx):
- Glass surface (glassSurface), borderRadius: 16, padding: 16
- Top-edge highlight (white)
- Layout: flex-row, alignItems center, gap: 14
  - **Icon container**: 44x44, borderRadius: 14, background: accent color at 12% opacity
    - SVG icon inside: 22x22, stroke: accent color, strokeWidth: 1.5
  - **Info column** (flex: 1):
    - Habit name: sectionTitle style (DM Sans 14px medium)
    - Meta row: time label (caption) + streak indicator (small pulse icon + "14 days")
  - **Check button**: 36x36 circle
    - Unchecked: 1.5px border `rgba(255,255,255,0.15)`, transparent fill
    - Checked: filled sage, checkmark icon in bgDeep color
    - Animate with scale spring on press

**Sample habits to pre-populate** (in this exact order):
1. Morning workout — sage — 6:30 AM — 14 day streak — checked
2. Read 30 minutes — lavender — Evening — 9 day streak — checked
3. Meditate — peach — 10 min — 6 day streak — unchecked
4. Drink 2L water — sky — All day — 22 day streak — checked
5. Journal before bed — rose — 10 PM — 3 day streak — unchecked

**Quote card** (bottom of scroll):
- Glass surface, Playfair italic 15px for text, micro for author
- Top-edge highlight with lavender tint
- "We are what we repeatedly do. Excellence, then, is not an act, but a habit." — Aristotle

### 2. STATS SCREEN (StatsScreen.tsx)
Background: bgDeep, ScrollView

**Page title**: "Statistics" — displayMedium (Playfair 24px), margin top 20, bottom 20

**Stat grid** (2 columns):
- **Featured card** (spans full width): current streak
  - Accent sage glass surface
  - Left: "CURRENT STREAK" overline (sage color at 70%), "14 days" (fontSize: 48, weight 300, sage + "days" smaller), "Best: 21 days (Feb 2026)" micro
  - Right: circular progress ring SVG (48x48), sage stroke, 67% text center
- Row of 2 cards:
  - "87%" (lavender) — "Completion rate" — "This month"
  - "142" (peach) — "Habits completed" — "All time"
- StatCard: glass surface, stat value (fontSize: 32, weight 300, accent color), label (caption), sub (micro)

**Streak leaderboard**:
- Section label: "STREAK LEADERBOARD" overline
- Glass card containing list of StreakItem rows
- Each row: 10px colored dot, habit name (13px medium), streak count (18px weight 300, accent color), "days" micro
- Sorted by streak descending: Water (22, sky), Workout (14, sage), Read (9, lavender), Meditate (6, peach), Journal (3, rose)
- Rows separated by 1px `rgba(255,255,255,0.04)` border

**Weekly completion chart**:
- Glass card with header: "Weekly completion" (sectionTitle) + pill group (Week/Month/Year)
- Pill buttons: 10px font, 4px 10px padding, borderRadius: 20, glass bg, active = sage dim bg + sage text
- 7 vertical bars, flex-row, equal width, 120px height area
- Bar style: borderRadius top 6px, linear gradient from sage at 30% to sage at 100%
- Today (Sunday) bar at reduced opacity
- Day labels below each bar (micro font)
- Bar heights: Mon 85%, Tue 100%, Wed 70%, Thu 90%, Fri 60%, Sat 80%, Sun 40%

**Activity heatmap**:
- Section label: "ACTIVITY HEATMAP — MARCH"
- 7-column grid (Mon–Sun), ~4 weeks of cells
- Cell: square, borderRadius: 4, gap: 3
- Levels: empty = `rgba(255,255,255,0.04)`, l1 = sage 15%, l2 = sage 30%, l3 = sage 50%, l4 = sage 75%
- Legend row below: "Less" [5 squares] "More"

**Insight card**:
- Lavender accent glass surface
- "INSIGHT" overline in lavender at 70%
- Body: "You're most consistent on Tuesdays and Thursdays. Morning habits have a 92% completion rate vs 68% for evening ones."

### 3. ADD HABIT SCREEN (AddHabitScreen.tsx)
Background: bgDeep, ScrollView

**Top bar**: flex-row, space-between
- Left: "← Cancel" (back arrow + text, textSecondary)
- Right: "Save habit" button — sage accent, sageDim bg, sageBorder, borderRadius: 20, padding 8x18

**Page title**: "New habit" — displayMedium

**Form fields** (each with overline label + 24px margin-bottom):

1. **Habit name input**: full width, glassRecessed style, borderRadius: 14, padding: 14x16, 15px font, placeholder "e.g. Morning run, Gratitude journal..."

2. **Icon picker** (IconPicker.tsx): 6-column grid, each cell is square with glass bg + borderRadius: 14
   - Selected state: sage border + sage dim bg
   - 12 icons total — use these SVG paths:
     - Dumbbell, Book, Leaf, Water drop, Heart, Clock, Pulse, Flag, Layers, Sun, Infinity, Wrench
   - Each icon 22x22, appropriate accent color stroke

3. **Color picker** (ColorPicker.tsx): horizontal row of 5 circles (36x36)
   - Colors: sage, lavender, peach, sky, rose
   - Selected: 2px white border + outer ring (1.5px `rgba(255,255,255,0.2)` at -5px inset)

4. **Frequency pills** (FrequencyPills.tsx): row of 3 pills
   - "Daily", "Weekdays", "Custom"
   - Default state: glass bg + glassBorder, textSecondary
   - Selected: sageDim bg, sageBorder, sage text
   - borderRadius: 20, padding: 10x18

5. **Day picker** (DayPicker.tsx): row of 7 circles (40x40)
   - Labels: M, T, W, T, F, S, S
   - Default: glass bg + glassBorder, textSecondary
   - Selected: sage 15% bg, sage 25% border, sage text
   - All selected by default when "Daily" is chosen

6. **Reminder row**: glass surface card, flex-row space-between
   - Left: "Remind me at" (14px), "Push notification" (micro below)
   - Right: "7:00 AM" (sage, 14px medium) + toggle switch
   - Toggle: 44x26, track = `rgba(255,255,255,0.12)`, on = sage 50%, thumb = white 20px circle

7. **Goal stepper** (GoalStepper.tsx): glass card with two rows
   - "Times per day": − [1] + buttons
   - "Duration (min)": − [5] + buttons
   - Stepper buttons: 28x28 circle, glass bg, glassBorder
   - Value: 16px medium, centered

### 4. SETTINGS SCREEN (SettingsScreen.tsx)
Placeholder with page title "Settings" and a few static rows (Profile, Notifications, Theme, Export data) — glass surface rows with chevron icons. This is a scaffold for later.

---

## Component Patterns

### GlassCard Component
A reusable wrapper that applies the glass surface + top-edge highlight:
```
Props: children, style?, accentColor?, borderRadius?
- Wraps children in a View with glassSurface styles
- Renders a LinearGradient (height: 1, position absolute top) for the highlight
- If accentColor is provided, uses that color's dim/border variants instead
```

### SVG Icons
All icons are custom SVG components using react-native-svg. Each icon:
- Default size: 22x22
- stroke={color}, strokeWidth={1.5}, fill="none"
- strokeLinecap="round", strokeLinejoin="round"

---

## Interaction Notes (for later — scaffold structure now)
- Tapping a habit's check button toggles its completion for today
- Streak counts are calculated from consecutive completed days
- All habit data persists locally via AsyncStorage
- The Add screen navigates back to Home on save
- Stats are computed from habit completion history

---

## Critical Aesthetic Rules
1. **NEVER use pure white backgrounds** — always use rgba overlays on the deep bg
2. **NEVER use sharp/bright colors** — all accents are soft and muted
3. **Every card gets the top-edge linear gradient highlight** — this is the "liquid glass" signature
4. **Large numbers are always fontWeight: 300 (light)** — gives the elegant thin feel
5. **Generous padding everywhere** — 16-24px card padding, 24px screen margins
6. **Dark backgrounds only** — the entire app is dark theme, no light mode
7. **Playfair Display ONLY for display/page headings** — never for UI elements
8. **DM Sans for everything else** — body, labels, buttons, captions

# Redefine — Backend & Functionality Integration

## Overview
This document extends the existing Redefine habit tracking app with real functionality:
- **Authentication**: Clerk (email/password + OAuth via custom flows)
- **Database**: Neon Postgres (serverless) via Drizzle ORM
- **Backend**: Expo Router API Routes (`+api.ts` files)
- **State management**: React Context + async fetch calls to API routes

The app already has all UI screens built. This phase wires them to real data.

---

## Architecture

```
┌──────────────────────────────────┐
│  React Native App (Expo)         │
│  ┌────────────┐ ┌──────────────┐ │
│  │ Clerk      │ │ Screens      │ │
│  │ Provider   │ │ (Home, Stats,│ │
│  │ (Auth UI)  │ │  Add, etc.)  │ │
│  └────────────┘ └──────┬───────┘ │
│                        │ fetch()  │
│  ┌─────────────────────▼───────┐ │
│  │ Expo API Routes (+api.ts)   │ │
│  │ - Clerk token verification  │ │
│  │ - Drizzle ORM queries       │ │
│  │ - Neon Postgres connection   │ │
│  └─────────────────────────────┘ │
└──────────────────────────────────┘
                │
        ┌───────▼───────┐
        │  Neon Postgres │
        │  (serverless)  │
        └───────────────┘
```

**Why Expo API Routes?** They run server-side so Neon credentials stay secure (no DB connection string in the client). They ship in the same codebase and deploy to EAS Hosting. The client calls them via `fetch()`.

---

## Prerequisites — Manual Setup Steps

Before running Claude Code prompts, do these steps yourself:

### 1. Clerk Setup
1. Go to https://clerk.com and create an account
2. Create a new application called "Redefine"
3. In the Clerk Dashboard, go to **Configure > Native applications** and ensure the **Native API** toggle is **enabled**
4. Enable **Email/Password** as a sign-in method under **Configure > Email, phone, username**
5. Copy your **Publishable Key** from **Configure > API keys**

### 2. Neon DB Setup
1. Go to https://neon.tech and create an account
2. Create a new project called "redefine"
3. Copy the **connection string** (it looks like `postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`)

### 3. Environment Variables
Create a `.env` file in your project root:
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
DATABASE_URL=postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
```
**IMPORTANT**: `EXPO_PUBLIC_` prefix makes the variable available on the client. `DATABASE_URL` has NO prefix so it stays server-side only (accessible in +api.ts files).

Add `.env` to `.gitignore`.

---

## Dependencies to Install

```bash
# Clerk for auth
npx expo install @clerk/clerk-expo expo-secure-store

# Neon + Drizzle for database
npm install drizzle-orm @neondatabase/serverless --legacy-peer-deps
npm install -D drizzle-kit dotenv --legacy-peer-deps

# Expo Router (for API routes) — if not already using expo-router
npx expo install expo-router expo-constants expo-linking

# Utilities
npm install zod --legacy-peer-deps
```

---

## Database Schema (Drizzle)

### File: `server/db/schema.ts`

```typescript
import { pgTable, uuid, text, boolean, timestamp, integer, date } from 'drizzle-orm/pg-core';

// Users table — synced with Clerk user IDs
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Habits table
export const habits = pgTable('habits', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  icon: text('icon').notNull().default('clock'),          // icon key string
  color: text('color').notNull().default('sage'),          // sage | lavender | peach | sky | rose
  timeLabel: text('time_label').default(''),               // "6:30 AM", "Evening", etc.
  frequency: text('frequency').notNull().default('daily'), // daily | weekdays | custom
  days: text('days').notNull().default('0,1,2,3,4,5,6'),  // comma-separated day indices
  reminderTime: text('reminder_time'),                     // "07:00" or null
  reminderEnabled: boolean('reminder_enabled').default(false),
  goalCount: integer('goal_count').default(1),
  goalDuration: integer('goal_duration').default(0),       // minutes
  isArchived: boolean('is_archived').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Completions table — one row per habit per day
export const completions = pgTable('completions', {
  id: uuid('id').defaultRandom().primaryKey(),
  habitId: uuid('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),                            // YYYY-MM-DD
  completed: boolean('completed').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Types inferred from schema
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Habit = typeof habits.$inferSelect;
export type InsertHabit = typeof habits.$inferInsert;
export type Completion = typeof completions.$inferSelect;
export type InsertCompletion = typeof completions.$inferInsert;
```

### File: `server/db/index.ts`

```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema });
```

### File: `drizzle.config.ts` (project root)

```typescript
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './server/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

After schema is created, run:
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

---

## File Structure (additions to existing project)

```
Redefine/
├── .env                          # Clerk + Neon keys (git-ignored)
├── drizzle.config.ts             # Drizzle Kit config
├── drizzle/                      # Generated migrations
├── server/
│   └── db/
│       ├── schema.ts             # Drizzle schema (tables above)
│       └── index.ts              # Neon + Drizzle client
├── app/                          # Expo Router file-based routing
│   ├── _layout.tsx               # Root layout with ClerkProvider
│   ├── (auth)/                   # Auth screens (unauthenticated)
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (tabs)/                   # Main app (authenticated)
│   │   ├── _layout.tsx           # Tab navigator
│   │   ├── index.tsx             # Home screen
│   │   ├── stats.tsx             # Stats screen
│   │   ├── add.tsx               # Add habit screen
│   │   └── settings.tsx          # Settings screen
│   └── api/                      # Server-side API routes
│       ├── habits+api.ts         # GET all / POST new habit
│       ├── habits/
│       │   └── [id]+api.ts       # PUT / DELETE single habit
│       ├── completions+api.ts    # POST toggle / GET completions
│       ├── stats+api.ts          # GET streak & stat computations
│       └── auth/
│           └── sync-user+api.ts  # POST sync Clerk user to DB
├── src/
│   ├── theme/                    # Existing design tokens
│   ├── components/               # Existing UI components
│   ├── hooks/
│   │   ├── useHabits.ts          # Fetch & mutate habits
│   │   ├── useCompletions.ts     # Toggle completions
│   │   └── useStats.ts           # Fetch stats/streaks
│   ├── lib/
│   │   ├── api.ts                # API client helper (fetch wrapper)
│   │   └── auth.ts               # Clerk token cache + helpers
│   └── types/
│       └── index.ts              # Shared TypeScript types
```

---

## Authentication Flow (Clerk)

### Root Layout: `app/_layout.tsx`

```typescript
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Slot } from 'expo-router';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export default function RootLayout() {
  // Load fonts here too (DM Sans + Playfair Display)
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <Slot />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
```

### Auth Guard Pattern

In the `(auth)/_layout.tsx`: if signed in, redirect to `/(tabs)`.
In the `(tabs)/_layout.tsx`: if NOT signed in, redirect to `/(auth)/sign-in`.

Use `useAuth()` from `@clerk/clerk-expo` to check `isSignedIn`.

### Sign In Screen: `app/(auth)/sign-in.tsx`

Use Clerk's `useSignIn()` hook with custom React Native UI matching the Redefine design system:
- Dark background (#0B0D11)
- Glass card inputs (glassRecessed style)
- Sage accent button for "Sign In"
- "Don't have an account? Sign up" link below
- Email/password fields using the custom text input style from the existing Add Habit screen

The sign-in flow:
1. Call `signIn.create({ identifier: email, password })`
2. On success: `await setActive({ session: createdSessionId })`
3. Router navigates to `/(tabs)` automatically

### Sign Up Screen: `app/(auth)/sign-up.tsx`

Use `useSignUp()` hook. Flow:
1. Collect name, email, password
2. Call `signUp.create({ emailAddress, password })`
3. Handle email verification: `signUp.prepareEmailAddressVerification({ strategy: 'email_code' })`
4. Show code input screen, verify with `signUp.attemptEmailAddressVerification({ code })`
5. On success: `setActive({ session })` → redirect to tabs
6. After first sign-in, call POST `/api/auth/sync-user` to create the user record in Neon

### Auth Screen Styling

Both auth screens must match the Redefine liquid glass aesthetic:
- Background: `#0B0D11`
- Center the form card vertically
- App logo/name "Redefine" at top using Playfair Display, 32px
- Subtitle in textSecondary
- Input fields: backgroundColor `rgba(255,255,255,0.04)`, border `rgba(255,255,255,0.08)`, borderRadius 14
- Primary button: sage background at 15%, sage text, sage border at 20%, borderRadius 14, full width
- Secondary link: textSecondary color, 13px

---

## API Routes

### Helper: `src/lib/api.ts`

```typescript
import { useAuth } from '@clerk/clerk-expo';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || '';

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  token?: string | null,
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || res.statusText);
  }
  return res.json();
}
```

Every screen calls API routes using the Clerk session token:
```typescript
const { getToken } = useAuth();
const token = await getToken();
const data = await apiFetch('/api/habits', {}, token);
```

### API Route: `app/api/auth/sync-user+api.ts`

Called once after sign-up to create the user record:
```typescript
import { db } from '../../../server/db';
import { users } from '../../../server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  const { clerkId, name, email } = await request.json();
  
  // Upsert — create if not exists
  const existing = await db.select().from(users).where(eq(users.clerkId, clerkId));
  if (existing.length === 0) {
    const [user] = await db.insert(users).values({ clerkId, name, email }).returning();
    return Response.json(user);
  }
  return Response.json(existing[0]);
}
```

### API Route: `app/api/habits+api.ts`

```
GET  /api/habits        → Returns all habits for authenticated user (not archived)
POST /api/habits        → Creates a new habit
```

**GET handler:**
1. Extract Clerk token from `Authorization` header
2. Decode token to get `clerkId` (or pass clerkId as a query param verified server-side)
3. Look up user by clerkId → get user.id
4. Query habits where userId = user.id AND isArchived = false
5. For each habit, compute: `completedToday` (check completions for today's date), `currentStreak`, `bestStreak`
6. Return habits array with computed fields

**POST handler:**
1. Parse body: { name, icon, color, timeLabel, frequency, days, reminderTime, reminderEnabled, goalCount, goalDuration }
2. Look up user by Clerk token
3. Insert into habits table with userId
4. Return created habit

### API Route: `app/api/habits/[id]+api.ts`

```
PUT    /api/habits/:id  → Update habit fields
DELETE /api/habits/:id  → Soft delete (set isArchived = true)
```

### API Route: `app/api/completions+api.ts`

```
POST /api/completions   → Toggle completion for a habit on a date
GET  /api/completions   → Get completions for a date range (for heatmap, stats)
```

**POST body:** `{ habitId, date }` (date as "YYYY-MM-DD")
- If a completion exists for this habitId + date → DELETE it (un-complete)
- If no completion exists → INSERT one (complete)
- Return the new state: `{ completed: true/false }`

**GET query params:** `?from=2026-03-01&to=2026-03-31`
- Returns all completions for the user in that date range
- Used by the heatmap and weekly chart

### API Route: `app/api/stats+api.ts`

```
GET /api/stats → Returns computed statistics for the user
```

Returns JSON:
```json
{
  "currentOverallStreak": 14,
  "bestOverallStreak": 21,
  "completionRateThisMonth": 87,
  "totalCompletionsAllTime": 142,
  "habitStreaks": [
    { "habitId": "...", "name": "Drink 2L water", "color": "sky", "currentStreak": 22, "bestStreak": 22 },
    { "habitId": "...", "name": "Morning workout", "color": "sage", "currentStreak": 14, "bestStreak": 21 }
  ],
  "weeklyCompletion": [85, 100, 70, 90, 60, 80, 40],
  "todayProgress": { "completed": 3, "total": 5, "percentage": 60 }
}
```

**Streak calculation logic** (implement in a helper function `server/db/streaks.ts`):
```
For a given habit:
1. Get all completions sorted by date DESC
2. Starting from today, walk backwards:
   - If today has no completion, currentStreak starts from yesterday
   - Count consecutive days with completions (skipping days the habit isn't scheduled)
3. For bestStreak: find the longest consecutive run in all history
```

**Overall streak**: a day counts toward the overall streak if the user completed ALL scheduled habits for that day.

---

## Hooks (Client-Side Data Fetching)

### `src/hooks/useHabits.ts`

```typescript
- Exports: habits, isLoading, error, createHabit, toggleCompletion, deleteHabit, refetch
- Uses useAuth() to get token
- Fetches from /api/habits on mount and after mutations
- createHabit() → POST /api/habits → refetch
- toggleCompletion(habitId, date) → POST /api/completions → refetch
- deleteHabit(id) → DELETE /api/habits/:id → refetch
```

### `src/hooks/useStats.ts`

```typescript
- Exports: stats, isLoading, refetch
- Fetches from /api/stats
- Used by StatsScreen
```

### `src/hooks/useCompletions.ts`

```typescript
- Exports: completions, isLoading, fetchRange
- fetchRange(from, to) → GET /api/completions?from=...&to=...
- Used by HeatmapGrid and BarChart
```

---

## Screen Wiring

### HomeScreen Changes
- Replace sample habits with `useHabits()` hook data
- Greeting: use `useUser()` from Clerk to get first name
- Streak banner: read from `useStats()` → `currentOverallStreak`, `todayProgress`
- HabitCard `onPress` check button → call `toggleCompletion(habitId, todayDateString)`
- "+ Add" button → navigate to `/add`

### StatsScreen Changes
- All data from `useStats()` hook
- Heatmap from `useCompletions()` hook with current month range
- Bar chart from `stats.weeklyCompletion`
- Streak leaderboard from `stats.habitStreaks` (sorted by currentStreak DESC)

### AddHabitScreen Changes
- On "Save habit" press → call `createHabit()` with form data → navigate back to Home
- All pickers remain the same visually but their values feed into the `createHabit()` payload

### SettingsScreen
- Add "Sign out" button using `useAuth().signOut()`
- Show user email from `useUser().user.emailAddresses`
- Profile section shows name from Clerk

---

## Migration from @react-navigation to expo-router

The app currently uses `@react-navigation/bottom-tabs`. To use API routes, we need Expo Router. The migration:

1. Move screens into `app/(tabs)/` as route files
2. The tab layout goes in `app/(tabs)/_layout.tsx`
3. Auth screens go in `app/(auth)/`
4. Root layout at `app/_layout.tsx` wraps with ClerkProvider
5. All existing component files stay in `src/components/` — they're imported by route files
6. The existing `src/theme/tokens.ts` is unchanged
7. Update `package.json` main field to `"expo-router/entry"`

---

## Important Implementation Notes

1. **Clerk token in API routes**: In each API route, verify the user by:
   - Reading the `Authorization: Bearer <token>` header
   - For now, decode the JWT to extract `sub` (which is the Clerk user ID)
   - Look up the user in the `users` table by `clerkId`
   - You can use `@clerk/backend` package's `verifyToken()` for proper verification in production

2. **Date handling**: All dates should be in "YYYY-MM-DD" format. Use the user's local date (not UTC) when checking "today". Pass the date from the client.

3. **Optimistic updates**: For toggling completions, update the UI immediately (flip the checkbox) and call the API in background. Revert if the API call fails.

4. **Loading states**: Show skeleton/shimmer versions of HabitCards while data loads. Use the existing glass card style with animated opacity pulse.

5. **Error handling**: Show a subtle toast at the bottom of the screen for API errors. Use the rose accent color for error states.

6. **Expo Router output**: Set `output: 'server'` in app.json web config for API routes to work:
   ```json
   {
     "expo": {
       "web": {
         "bundler": "metro",
         "output": "server"
       }
     }
   }
   ```

7. **Testing locally**: Run `npx expo start` for the client and API routes will be served from the same dev server. For native devices, use `npx expo serve` to test server routes.

---

## Design Continuity

All new screens (sign-in, sign-up) MUST follow the existing design system exactly:
- Background: `#0B0D11`
- Fonts: Playfair Display for headings, DM Sans for everything else
- Inputs: glassRecessed style (rgba(255,255,255,0.04) bg, rgba(255,255,255,0.08) border, borderRadius 14)
- Primary buttons: sage-tinted glass (rgba(139,175,139,0.15) bg, sage text)
- All cards: GlassCard component with top-edge linear gradient highlight
- Large numbers: fontWeight 300
- No light mode, no white backgrounds