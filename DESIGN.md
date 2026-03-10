# Design System: Evastur Premium Experience

## 1. Visual Theme & Atmosphere
The core aesthetic is **"Futuristic Minimalist Glassmorphism."** The interface feels premium, leveraging depth, background blurs, and subtle glows. It supports both **Dark** and **Light** modes seamlessly using Tailwind CSS.

## 2. Color Palette & Roles (Tailwind Tokens)
*   **Primary (Electric Blue):** `bg-primary` (#3B82F6). Used for key actions and active states.
*   **Backgrounds:** 
    *   Light: `bg-slate-50`
    *   Dark: `bg-[#020617]` (Deep Midnight)
*   **Surface/Cards:**
    *   `glass-container` or `glass-card`: Uses `backdrop-blur-xl` and low-opacity borders.
    *   Light: `bg-white/70 border-white/20`
    *   Dark: `bg-black/20 border-white/5`
*   **Success:** `text-success` (#10B981)

## 3. Typography Rules
*   **Font Family:** **Inter**, Sans-serif.
*   **Headers:** ExtraBold weights with tight letter-spacing.
*   **Body:** Regular to Medium with high line-height for readability.

## 4. Nuxt 4 Layout & Component Principles
*   **Layout Wrapper:** All pages should rely on the default layout via `app.vue`.
*   **Component Structure:**
    *   ID fixo para evitar problemas de hidratação.
    *   Imports explícitos em cada arquivo.
    *   `lang="ts"` em todos os componentes.
*   **Glassmorphism:** Mandatory use of `backdrop-blur` and `ring-1 ring-inset`.

## 5. Design Interaction
*   **Hover Effects:** Subtle brightness increase and soft glows (`shadow-glow-primary`).
*   **Responsivity:** 3-column architecture (Sidebars + Main Timeline) adapted for mobile via flex-col.
