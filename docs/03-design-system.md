# OneXDeal Design System

**Mobile-first visual language and interaction rules**

- Date: 17 November 2026
- Version: v1.1 - Owner-Approved Engineering Baseline
- Status: Approved v1 baseline (`@onexdeal/ui`)

> Purpose: Provides reusable design tokens and component behaviour for the React Native app (`apps/mobile`) and Next.js web surfaces (`apps/web`) via `@onexdeal/ui`.

> Decision labels: **Approved** = confirmed by project owner; **Deferred** = intentionally outside MVP; **Open** = pending later phase selection.

## 1. Status and design intent

This v1 design system provides the approved foundational tokens in `@onexdeal/ui`. Final brand wordmark and custom illustrations remain open and can update token values without restructuring application components.

- Personable and local, not cluttered or overly promotional.
- Listings and photography take priority over decoration.
- Clear prices (including `"Free"` for `₹0` items), locality context and seller trust signals.
- Accessible touch targets and predictable navigation.
- Consistent mobile and web language with platform-appropriate controls.

## 2. Brand and colour tokens (`@onexdeal/ui`)

| Token                      | Light value | Use                                     |
| -------------------------- | ----------- | --------------------------------------- |
| color.brand.primary        | #155EEF     | Primary action, selected tabs and links |
| color.brand.primaryPressed | #004EEB     | Pressed state                           |
| color.brand.secondary      | #0E9384     | Supportive accent, optional             |
| color.text.primary         | #101828     | Main text                               |
| color.text.secondary       | #475467     | Descriptions and metadata               |
| color.surface.base         | #F8FAFC     | App background                          |
| color.surface.card         | #FFFFFF     | Cards and sheets                        |
| color.border.default       | #D0D5DD     | Dividers and input borders              |
| color.success              | #067647     | Success state                           |
| color.warning              | #B54708     | Warnings                                |
| color.danger               | #B42318     | Destructive/error state                 |

Dark mode is a later design-system extension. Do not invert colours mechanically; define semantic dark tokens and verify contrast before shipping.

> **NOTE:** Accessibility rule: never rely on colour alone to communicate status. Verify foreground/background contrast against WCAG 2.2 AA before finalising the palette.

## 3. Typography

| Style      | Mobile size / line height | Use                               |
| ---------- | ------------------------- | --------------------------------- |
| Display    | 28 / 34                   | Home headline or major page title |
| Heading 1  | 24 / 30                   | Screen title                      |
| Heading 2  | 20 / 26                   | Section title                     |
| Heading 3  | 16 / 22                   | Card or form section              |
| Body       | 16 / 24                   | Primary reading text              |
| Body small | 14 / 20                   | Descriptions and metadata         |
| Caption    | 12 / 16                   | Timestamps and supporting labels  |
| Button     | 14-16 / 20, semibold      | Actions                           |

Use Inter if licensing/build setup is approved, otherwise use platform system fonts. Avoid custom font downloads as a first-render dependency. Support system font scaling.

## 4. Spacing, shape and elevation

| Token               | Value              | Rule                               |
| ------------------- | ------------------ | ---------------------------------- |
| space.1 / 2 / 3 / 4 | 4 / 8 / 12 / 16 px | Base spacing scale                 |
| space.5 / 6 / 8     | 20 / 24 / 32 px    | Section and screen spacing         |
| radius.sm / md / lg | 8 / 12 / 16 px     | Inputs, cards and sheets           |
| radius.pill         | 999 px             | Chips and tags                     |
| control.height.md   | 44-48 px           | Minimum comfortable control height |
| touch.target.min    | 44 x 44 pt         | Interactive mobile target          |
| elevation.card      | Subtle             | Use borders before strong shadows  |

## 5. Navigation and key screens

- Authentication: Continue with Google button, Email/Password sign-in & registration forms, "Verify your email" banner/screen with resend cooldown, and Forgot/Reset Password flows.
- Mobile bottom navigation: Home, Search, Sell/Post, Inbox, Profile. The Post action may use a visually distinct centre action but must remain accessible.
- Home: locality/radius selector (default 10 km; 2, 5, 10, 25, 50 km), search entry, category shortcuts, recent nearby listings and useful empty state.
- Search: query, filter sheet (category, radius, price range including Free, condition), sort selector, active filter chips, paginated results.
- Listing detail: image gallery, title, price (`₹` formatted or `"Free"` badge), negotiable label (hidden when price is `₹0`), condition (hidden if `categories.requires_condition = false`), approximate locality, description, seller summary, report and primary chat action.
- Post listing: step-based or grouped form for details, photos, category, price (`>= ₹0`) & negotiability, and curated Hosur locality / GPS selection; preview before submit (`pending_review`).
- Inbox/chat: clear conversation list with per-participant unread badge counters, message delivery/read state, block/report entry points.
- Profile: user information, email verification badge, My Listings (showing `active`, `pending_review`, `rejected` with reason, `sold`, `expired`, `archived`), Favorites, settings, help, safety and sign out.
- Admin web: persistent navigation for listing moderation queue, reports, users, categories, localities, metrics and audit log.

## 6. Components and states

| Component           | Variants / states                                                      | Behaviour                                                                        |
| ------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Button              | Primary, secondary, ghost, danger; default, pressed, disabled, loading | One primary action per region; loading prevents duplicate submit.                |
| Text field          | Default, focused, error, disabled, helper                              | Always label fields; validation text explains how to fix.                        |
| Listing card        | Grid/list, sold, pending/rejected/expired (owner view)                 | Show image, title, price (`₹` or `"Free"`), locality, time; avoid tiny metadata. |
| Filter chip         | Default, selected, removable                                           | Selected state is textual and accessible.                                        |
| Image picker        | Empty, uploading, success, failed, reorder                             | Show progress and retry; preserve form on failure.                               |
| Bottom sheet/modal  | Default, loading, error                                                | Dismiss predictably; focus and accessibility semantics.                          |
| Toast/banner        | Success, information, warning, error                                   | Do not use to replace persistent validation or critical warnings.                |
| Avatar/user summary | Image, initials, unavailable                                           | Never display private email or optional phone number publicly by default.        |

## 7. Listing and photo presentation

- Prioritise a clear first image; maintain consistent image aspect ratio in cards (recommend 4:3 crop) while preserving original aspect ratio for detail gallery.
- Never stretch images; use cover for cards and contain/zoom for detail view as appropriate.
- Display price with Indian number formatting (`en-IN`) and `₹` symbol; display `"Free"` when `price_paise === 0`; hide the `"Negotiable"` badge on Free listings.
- Location shows the curated locality name / approximate area, never exact coordinates or full street address.
- Use clear `Sold`, `Pending Review`, `Rejected` (with reason), and `Expired` labels in owner/admin surfaces.

## 8. Responsive web rules

| Breakpoint         | Layout guidance                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| Small < 640 px     | Single-column flow; mobile navigation; stacked filters.                                                  |
| Medium 640-1023 px | Two-column listing grid where space permits; compact navigation.                                         |
| Large >= 1024 px   | Three/four-column listing grid; persistent filter rail where useful; admin tables with readable density. |

## 9. Accessibility and motion

- [ ] Use semantic labels, roles and accessible names for all controls.
- [ ] Support dynamic type/font scaling without clipping essential actions.
- [ ] Keep focus order logical; provide visible keyboard focus on web.
- [ ] Respect reduced-motion settings; transitions should be brief and non-essential.
- [ ] Use alt text for meaningful listing photos where available; decorative icons are hidden from screen readers.
- [ ] Validate text contrast and non-text control contrast with automated and manual checks.

## 10. Design handoff rules

- Design tokens in `@onexdeal/ui` are the source of truth; do not scatter raw colours and spacing values through components.
- Each interactive component must have documented states and empty/error/loading variants.
- Prototype one complete buyer journey and one seller journey before polishing secondary screens.
- Record design decisions and unresolved questions in the project decision log.

---

This document is part of the OneXDeal engineering documentation set. Update this document through a reviewed change; do not let an AI agent silently change product or architecture decisions.
