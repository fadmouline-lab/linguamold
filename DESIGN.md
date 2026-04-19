# Design System — LinguaMold

## Product Context
- **What this is:** A gamified language learning app in the style of Duolingo — daily lessons, XP streaks, and a scrollable adventure path of module nodes.
- **Who it's for:** Adult casual learners who want to pick up French (or other languages) in 5-minute daily sessions.
- **Space/industry:** Consumer language learning — peers include Duolingo, Babbel, Busuu.
- **Project type:** React Native / Expo mobile app (iOS + Android).

---

## Aesthetic Direction
- **Direction:** Playful/Premium ("Warm Academy")
- **Decoration level:** Intentional — clean surfaces with warm texture; decoration lives in gamification elements (nodes, XP bursts, streaks), not in chrome.
- **Mood:** Duolingo's cooler older sibling. Same gamified energy, more visual personality. Warm, inviting, distinctly *not* a dark productivity tool. When you open the app you should feel: "I want to do a quick lesson right now."
- **Key differentiation:** Teal primary (nobody in language learning owns teal), warm cream background (not clinical white), Cabinet Grotesk display font (instant visual personality vs. the generic rounded fonts the category defaults to).

---

## Typography

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| Display / Brand / Scores | Cabinet Grotesk | 800 | Headlines, gamification numbers, app name |
| Body / Exercise Text | DM Sans | 400 / 600 | Everything the user reads during lessons |
| UI Labels / Captions | DM Sans | 500 / 700 | Nav labels, badges, metadata |
| Tabular Numbers | DM Sans (tabular-nums) | 700 | XP counts, streaks, leaderboard scores |

**Loading:** Cabinet Grotesk from Fontshare (`https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,700,500&display=swap`). DM Sans from Google Fonts. In React Native, load both via `expo-font`.

**Type Scale (React Native px):**

| Token | Size | Weight | Use |
|-------|------|--------|-----|
| `display` | 32 | 800 | App name, section heroes |
| `h1` | 28 | 800 | Screen titles |
| `h2` | 22 | 700 | Card headers, module names |
| `h3` | 18 | 700 | Exercise prompts |
| `body` | 16 | 400 | Exercise text, options |
| `bodyBold` | 16 | 600 | Emphasized body |
| `label` | 14 | 600 | Buttons, badges |
| `caption` | 12 | 500 | Metadata, hints |
| `micro` | 11 | 700 | Nav labels, tags |

---

## Color

**Approach:** Restrained with intentional accent pops. Color is rare and meaningful — teal signals "interactive," amber signals "reward," red signals "streak/urgency."

```ts
export const colors = {
  // Backgrounds
  background:       '#FAFAF7',  // warm cream — not clinical white
  surface:          '#FFFFFF',  // cards, sheets, inputs
  surfaceRaised:    '#F4F2ED',  // pressed states, locked nodes, alt rows

  // Primary — deep sky teal (nobody in language learning owns this)
  primary:          '#0891B2',
  primaryDark:      '#066E8A',  // 3D button shadow
  primaryLight:     '#E0F2FE',  // tinted backgrounds, selected states
  primaryText:      '#0E7490',  // primary-colored text on light BG

  // Accent — warm amber (XP, gems, premium)
  accent:           '#F59E0B',
  accentDark:       '#D97706',  // 3D button shadow
  accentLight:      '#FEF3C7',  // tinted backgrounds

  // Semantic
  success:          '#16A34A',  // correct answer
  successLight:     '#DCFCE7',
  error:            '#EF4444',  // wrong answer, hearts
  errorLight:       '#FEE2E2',
  fire:             '#EF4444',  // streak flame color (same as error — intentional)
  warning:          '#F59E0B',  // same as accent

  // Text
  textPrimary:      '#1C1917',  // warm near-black (not pure #000)
  textSecondary:    '#78716C',  // labels, captions, descriptions
  textFaint:        '#A8A29E',  // placeholders, disabled

  // Borders
  border:           '#E7E5E0',
  borderStrong:     '#D6D3CE',

  // Node states
  nodeCompleted:    '#F59E0B',  // gold fill for completed modules
  nodeLocked:       '#D6D3CE',  // border of locked nodes
  nodeLockedBg:     '#F4F2ED',  // fill of locked nodes

  // Overlays
  overlay:          'rgba(28, 25, 23, 0.5)',
  correctGlow:      'rgba(22, 163, 74, 0.25)',
  errorGlow:        'rgba(239, 68, 68, 0.25)',
  primaryGlow:      'rgba(8, 145, 178, 0.3)',
  accentGlow:       'rgba(245, 158, 11, 0.3)',
} as const;
```

**Dark mode:** Surfaces shift to deep navy (`#0F172A` bg, `#1E293B` surface). Primary shifts to neon cyan `#22D3EE`. Text inverts to `#F8FAFC`. Do not use in v1 — establish the light mode first.

---

## Spacing

**Base unit: 4px.** Scale in multiples.

```ts
export const spacing = {
  xxs:  2,   // hairline gaps
  xs:   4,   // tight internal padding
  sm:   8,   // component internal gaps
  md:   12,  // standard gap
  lg:   16,  // section padding, card padding
  xl:   20,
  xxl:  24,  // generous card padding
  xxxl: 32,  // section margins
  huge: 48,  // screen top padding
  max:  64,  // hero spacing
} as const;
```

**Density:** Comfortable. Language learning requires focused reading — don't crowd exercise text. Min 16px padding inside any interactive element.

---

## Layout

- **Approach:** Grid-disciplined for exercise screens; creative-editorial for the adventure path.
- **Screen horizontal padding:** 16px (tight enough to show content, roomy enough to breathe).
- **Max content width:** Full-screen on mobile; 480px on tablet.
- **Border radius:** Use a clear hierarchy — don't use the same radius for everything.

```ts
export const radii = {
  xs:   8,    // small chips, tags
  sm:   12,   // inputs, small buttons
  md:   16,   // standard buttons, cards
  lg:   20,   // large cards, bottom sheets
  xl:   28,   // phone-corner-level rounding
  full: 9999, // pills, avatars, badges
} as const;
```

---

## Adventure Path — Node Design

The primary screen. Nodes must communicate state instantly.

| State | Fill | Border | Icon | Extra |
|-------|------|--------|------|-------|
| `completed` | `#F59E0B` amber | none | Module emoji/icon | Small crown badge top-right |
| `active` | `#0891B2` teal | none | Module emoji/icon | Animated pulse ring (repeating) |
| `locked` | `#F4F2ED` | `#D6D3CE` 2.5px | Module emoji (50% opacity) | Lock icon overlay |

**Node size:** 80px diameter.
**Node labels:** DM Sans 12px/600 below each node. Active node label is teal + bold.
**Path connectors:** Dashed vertical line, 3px wide, `border-strong` color for future nodes, `accent` amber for completed trail. Slight rotation alternates left/right (winding path feel).
**Module icons:** Use themed emoji or custom SVG icons — never single letters. Icon map:
- Proficiency test: 🏆
- Greetings: 👋
- Numbers: 🔢
- Family: 👨‍👩‍👧
- Colors & shapes: 🎨
- Food: 🍽️
- Travel: ✈️
- Animals: 🐾

---

## Motion

- **Approach:** Intentional — every animation aids comprehension or delivers reward.
- **Easing:** enter `ease-out`, exit `ease-in`, move `ease-in-out`.

| Token | Duration | Use |
|-------|----------|-----|
| `micro` | 80ms | Button press, toggle |
| `short` | 180ms | State transitions, feedback strips |
| `medium` | 280ms | Screen transitions, node unlock |
| `long` | 500ms | XP burst, lesson complete animation |
| `pulse` | 1000ms per cycle | Active node breathing ring |

---

## 3D Button Shadow System

Buttons have a bottom shadow that compresses on press. This is a core gamification affordance — it makes tapping feel physical.

```ts
export const button3D = {
  primaryBottom:  '#066E8A',  // teal shadow
  accentBottom:   '#D97706',  // amber shadow
  successBottom:  '#15803D',  // green shadow
  errorBottom:    '#B91C1C',  // red shadow
  ghostBottom:    'transparent',
} as const;
```

Shadow offset: `0 4px 0` (rest state) → `0 2px 0` (pressed). Always pair with `translateY(2px)` on press via Reanimated.

---

## Gamification Visual Language

- **XP numbers:** Cabinet Grotesk 800, teal color. Feel weighty — every XP should feel earned.
- **Streak:** Fire emoji `🔥` + Cabinet Grotesk 700, red color. Pill badge with red tint background.
- **Gems:** `💎` + Cabinet Grotesk 700, teal. Pill badge with teal tint background.
- **Hearts:** `❤️` row — 3 hearts displayed in the exercise header. Lost heart fades and shrinks.
- **Lesson complete screen:** Full-screen celebration. XP burst animation + confetti. Cabinet Grotesk "Parfait! +50 XP" hero heading.

---

## Anti-Patterns (never do these)

- Single letters in module nodes — use real icons always
- `borderRadius: 999` on everything — use the hierarchy scale
- Pure black `#000000` text — use `#1C1917`
- Pure white `#FFFFFF` as page background — use `#FAFAF7`
- Diagonal line path connectors — use dashed vertical lines
- Inter or Roboto as primary font — use Cabinet Grotesk + DM Sans
- Dark green-black background (`#131F24`) — this was the original; the entire palette has changed

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-17 | Switched from dark theme to light (warm cream) | Gamification physics require light — bright colors on dark suppress energy rather than amplifying it |
| 2026-04-17 | Teal primary instead of lime green | Lime green is owned by Duolingo; teal is distinctive and unclaimed in the language app space |
| 2026-04-17 | Cabinet Grotesk display + DM Sans body | Duolingo/Babbel/Busuu all use generic rounded sans-serifs; this combination is immediately recognizable |
| 2026-04-17 | Themed emoji icons in module nodes | Single letters give no affordance and zero delight; emoji icons are universally understood |
| 2026-04-17 | Amber accent for XP/gems (vs. flat yellow) | Flat `#FFD900` reads as highlight/warning; amber `#F59E0B` reads as premium/reward |
| 2026-04-17 | Initial design system created | Created by /design-consultation after visual research of Duolingo, Babbel, and Busuu |
