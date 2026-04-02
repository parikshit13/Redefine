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