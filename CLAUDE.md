# LinguaMold — Claude Code Instructions

## Design System
Always read `DESIGN.md` before making any visual or UI decisions.
All font choices, colors, spacing, border radii, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match `DESIGN.md`.

Key rules:
- Primary color is `#0891B2` (teal) — not `#58CC02` (old lime green)
- Background is `#FAFAF7` (warm cream) — not `#131F24` (old dark)
- Display font is Cabinet Grotesk — not system default
- Body font is DM Sans
- Module nodes use themed emoji icons — never single letters
- All token names are in `components/ui/theme.ts`
