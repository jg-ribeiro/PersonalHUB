# Design System Specification: The Kinetic Architect

## 1. Overview & Creative North Star
The "Kinetic Architect" is the creative North Star for this design system. It moves away from the static, "boxy" nature of traditional dashboards toward a living, breathing command center. In a homelab environment—where data is fluid and services are always-on—the UI must feel like a high-end editorial piece rather than a spreadsheet.

We achieve this through **Intentional Asymmetry** and **Tonal Depth**. By breaking the rigid 12-column grid with varied card widths and overlapping header elements, we create a layout that feels curated. This system rejects the "standard" admin template in favor of an interface that looks like a bespoke piece of hardware software.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep Indigos (`primary`) and Cyber Blues (`secondary`), optimized for high-performance monitoring.

### The "No-Line" Rule
**Standard 1px solid borders are strictly prohibited for sectioning.** To define boundaries, designers must use background color shifts.
*   **Example:** A `surface-container-low` navigation panel sitting against a `surface` background.
*   **Why:** Lines create visual noise; tonal shifts create "atmosphere."

### Surface Hierarchy & Nesting
Treat the dashboard as a series of physical layers. Use the `surface-container` tiers to define "importance" through depth:
1.  **Base Layer:** `surface` (#060e20)
2.  **Sectional Wrappers:** `surface-container-low` (#091328)
3.  **Active Cards:** `surface-container` (#0f1930)
4.  **Floating Modals/Popovers:** `surface-container-highest` (#192540)

### The Glass & Gradient Rule
To provide "visual soul," use **Glassmorphism** for the sidebar and global headers. Apply a background blur (12px–20px) to `surface-variant` at 60% opacity. For primary CTAs, use a linear gradient from `primary` (#a7a5ff) to `primary-dim` (#645efb) at a 135-degree angle.

---

## 3. Typography
We utilize a high-contrast dual-font pairing to establish an editorial hierarchy.

*   **Display & Headlines (Manrope):** The "Voice." Used for page titles and high-level metrics. It feels technical yet approachable.
    *   *Headline-LG:* 2rem. Use for "Server Status" or "Dashboard Home."
*   **Body & Labels (Inter):** The "Utility." Used for status messages, logs, and service descriptions. Inter’s high x-height ensures readability at small scales on high-density monitors.
*   **The Hierarchy Rule:** Never use more than three type scales on a single card. Use `label-md` in all-caps with 0.05em tracking for metadata to create an "instrument panel" aesthetic.

---

## 4. Elevation & Depth
In this system, depth is a function of light, not structure.

### The Layering Principle
Achieve lift by "stacking." A `surface-container-lowest` card placed on a `surface-container-low` background creates a natural inset look. This mimics precision-milled hardware.

### Ambient Shadows
Shadows must be invisible until noticed. 
*   **Value:** `0px 20px 40px rgba(0, 0, 0, 0.4)` (in Dark Theme) or a tinted shadow using `on-surface` at 5% opacity.
*   **Execution:** Only use shadows for "Hover" states on service cards to signal interactivity.

### The "Ghost Border" Fallback
If a visual separator is required for accessibility (e.g., input fields), use a **Ghost Border**: `outline-variant` (#40485d) at 20% opacity. 100% opaque borders are forbidden.

---

## 5. Components

### Service Cards
*   **Layout:** No dividers. Use `spacing-6` (1.5rem) to separate the service icon from the title.
*   **State:** On hover, the card should transition from `surface-container` to `surface-container-high` and scale by 1.02.
*   **Footer:** Use `surface-container-lowest` as a subtle footer strip within the card for "uptime" stats.

### Primary Action Buttons
*   **Shape:** `rounded-md` (0.375rem).
*   **Style:** Gradient fill (`primary` to `primary-dim`). No border.
*   **Typography:** `title-sm` (Inter), semi-bold.

### Input Fields
*   **Style:** Minimalist. `surface-container-highest` background. 
*   **Focus:** Instead of a thick border, use a 2px bottom-glow using the `secondary` (#34b5fa) color.

### Status Chips
*   **Execution:** Small, pill-shaped (`rounded-full`). Use `error-container` for offline status and `primary-container` for online. Text should be `on-error-container` or `on-primary-container` respectively.

### Metric Sparklines
*   **Design:** Avoid axes or labels. Use a raw `primary` colored line with a subtle `primary_container` area fill beneath it.

---

## 6. Do's and Don'ts

### Do:
*   **Use White Space as a Tool:** Use `spacing-10` or `spacing-12` between major dashboard sections to allow the UI to "breathe."
*   **Color as Information:** Use the `tertiary` (#ff9dd1) color exclusively for "Warnings" or "Action Required" to ensure it stands out against the Indigo base.
*   **Responsive Grids:** Use a 4-column grid for desktop, but shift to a 1-column "Feed" view for mobile, maintaining the editorial typography sizes.

### Don't:
*   **No Dividers:** Never use `<hr>` or border-bottom to separate list items. Use a background shift of 2% or 16px of vertical padding.
*   **No Pure Black:** Never use `#000000` for backgrounds. Use `surface-dim` (#060e20) to maintain tonal depth and reduce eye strain.
*   **No Default Icons:** Ensure all icons (Lucide/FontAwesome) use a consistent stroke weight (1.5px or 2px). Never mix weights.