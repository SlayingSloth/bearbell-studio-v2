# CLAUDE.md

Agent instructions for building BEARBELL Content Studio v2. This file is read every session. Treat rules as non-negotiable unless the human explicitly overrides.

---

## Project identity

**What**: A React web app for creating Instagram carousels, feed posts, and stories in the BEARBELL brand style. Canva-like flexibility within strict brand constraints.

**Owner**: Joep Hendrick (BEARBELL, Venlo, NL)

**Replaces**: A single-file `index.html` Content Studio hosted on Netlify with Firebase Realtime Database. Do not migrate code from it. Treat this as a clean rebuild. The old data model on Realtime Database is not canonical.

**Language**: UI is Dutch. Code, comments, commit messages in English. Variable names English.

---

## Absolute rules (never violate)

1. **No paid services.** No Claude API. No OpenAI. No paid Cloudflare. No Stripe. Free tiers only: Firebase Spark, Netlify free, GitHub free, Google Cloud free credits for Picker API.
2. **No tracking or analytics SDKs** beyond the app's own internal performance-logger writing to Firestore. No Google Analytics, no Meta Pixel, no Mixpanel.
3. **Brand system is locked.** Colors, fonts, and sizes listed below are the only allowed values. No Tailwind defaults like `bg-blue-500`. No Google fonts other than Bebas Neue, Lora, Outfit.
4. **Firestore only.** Do not use Firebase Realtime Database. The old app uses it, we do not.
5. **No server.** This is a client-only React app. No Express, no Next.js API routes, no Cloud Functions (until the user explicitly asks).
6. **No localStorage/sessionStorage for app data.** State lives in Zustand (memory) and Firestore (persistence). The only localStorage use is the "remember me" flag for auth.
7. **Never introduce a new dependency without asking.** Dependencies are listed in section "Approved dependencies". If a task seems to need a new one, propose it first.

---

## Tech stack (strict)

| Concern | Tool | Notes |
|---------|------|-------|
| Build | Vite | React template |
| UI | React 18 | Function components + hooks only, no class components |
| Styling | Tailwind CSS 3 | Utility-first, no separate CSS files except `index.css` |
| State | Zustand | One store per domain, not a single mega-store |
| Routing | React Router v6 | |
| Canvas drag/resize | react-moveable | Do not swap for dnd-kit or Konva |
| Rich text | Tiptap v2 | Only inside text elements on the canvas |
| Shortcuts | react-hotkeys-hook | |
| Firebase | v10 modular SDK | Tree-shakeable imports only |
| Drive | Google Picker API v2 | Loaded via script tag, lazy |
| Export | html-to-image | For PNG, wrap with `document.fonts.ready` |
| IDs | nanoid | For all generated IDs, not uuid |
| Dates | date-fns | Not moment |

---

## Brand system

These are the ONLY allowed design tokens. Hardcode in `src/lib/brand/tokens.js` and import everywhere. Never write raw hex values or font names in components.

### Colors

```js
export const COLORS = {
  navy:     "#132234", // primary
  orange:   "#F97316", // accent
  ice:      "#E5E7EB", // light
  steel:    "#94A3B8", // neutral
  darkblue: "#1B263B", // mid
  cream:    "#EEF0F3", // body bg
  ink:      "#0D1B2A"  // deepest
};
```

No other colors. Color pickers render only these seven options plus a locked "custom" escape that shows a warning modal.

### Fonts

```js
export const FONTS = {
  display: "Bebas Neue",   // headlines, logo, h1-h3
  quote:   "Lora Italic",  // testimonials, brand quotes
  body:    "Outfit"        // UI, body text, labels, 300-700 weights
};
```

No Inter, no Roboto, no Barlow Condensed, no DM Mono, no Space Grotesk.

### Font size ranges

```js
export const SIZE_RANGES = {
  "Bebas Neue": { min: 40,  max: 200, default: 80 },
  "Lora":       { min: 18,  max: 48,  default: 24 },
  "Outfit":     { min: 14,  max: 48,  default: 18 }
};
```

Inspector panel clamps input values to these ranges.

### Fixed strings

- Tagline: `STRENGTH · PERSONAL`
- Kernzin: `Hier lachen we hard. En trainen we harder.`
- Merkbelofte: `Wij verkopen geen abonnementen. Wij leveren resultaten.`
- Sign-off: `FITTER. STERKER. BETER IN JE VEL.`

These live in `src/lib/brand/strings.js` as constants.

### Carousel slide specs (locked)

- Canvas: 1080x1080 px
- Logo position on every slide except slide 3 (table slide): bottom 100px, right 150px
- Cover slide defaults: h1 130px, padding `80px 111px 80px 184px`, eyebrow margin-bottom 30px, subtitle margin-top 32px, subtitle 35px

### FORGE Methode language

External-facing text uses "vier fases" only. Never "26 weken". Week numbers are internal only.

---

## Architecture

### Firestore data model

```
/users/{uid}
  email, displayName, createdAt, settings

/posts/{postId}
  ownerId            // uid of creator
  title              // string
  status             // 'draft' | 'ready' | 'published' | 'archived'
  format             // 'carousel' | 'feed' | 'story' | 'portrait'
  createdAt, updatedAt  // Firestore Timestamp
  tags               // string[]
  slideOrder         // string[] of slideIds
  slides             // map of slideId -> Slide
  shareToken         // string | null
  thumbnailUrl       // string | null

Slide = {
  id, type, backgroundColor, backgroundImage,
  elementOrder: string[],
  elements: map of elementId -> Element
}

Element = {
  id, kind, x, y, w, h, rotation, zIndex, locked,
  // kind-specific:
  text?:  { content (JSON from Tiptap), font, size, color, weight, align, lineHeight, letterSpacing },
  image?: { assetId, fit, filters },
  shape?: { kind, fill, stroke, strokeWidth, radius },
  logo?:  { variant }  // 'light' | 'dark'
}

/templates/{templateId}
  ownerId, name, category, thumbnailUrl,
  slideOrder, slides (same structure as post)

/assets/{assetId}
  ownerId, source: 'upload' | 'drive',
  url, driveFileId?, storageRef?,
  tags: string[], clientName?, dimensions: {w, h},
  uploadedAt

/versions/{postId}/history/{versionId}
  timestamp, label, snapshot  // full post object

/comments/{postId}/items/{commentId}
  slideId, x, y, text, authorName, resolved, createdAt

/share/{shareToken}
  postId, createdAt, expiresAt

/analytics/{postId}
  platform, postedAt, saves, likes, reach, comments, loggedAt
```

### Component boundaries

```
src/
  components/
    canvas/           // <Canvas>, <DraggableElement>, <SnapGuides>, <SelectionBox>
    editor/           // <Topbar>, <SlideNav>, <InspectorPanel>
    sidebar/          // <PostList>, <TemplateList>, <AssetLibrary>
    modals/           // <VersionHistory>, <ShareReviewLink>, <PerformanceLogger>, <DrivePicker>
    shared/           // <Button>, <Input>, <ColorPicker>, <FontPicker> (brand-constrained)
  hooks/              // useCanvas, usePost, useAssets, useShortcuts, useVersions
  stores/             // postStore, canvasStore, uiStore, assetStore
  lib/
    firebase/         // auth.js, firestore.js, storage.js, init.js
    brand/            // tokens.js, strings.js, guards.js
    export/           // toPng.js, toPdf.js
  pages/              // Login, Editor, Review, Dashboard
  types/              // jsdoc type defs or plain js object shapes
```

### State management rules

- **postStore**: current post being edited, slide operations, element CRUD
- **canvasStore**: selection, zoom, pan, snap settings
- **uiStore**: modals, sidebars, toasts
- **assetStore**: asset library, filters, upload queue

Never share state across stores by importing one into another. Communicate via the component tree or via a dedicated event.

### Firestore access rules

- Read/write Firestore only through helpers in `src/lib/firebase/firestore.js`.
- Components never call `getDoc`, `setDoc` etc. directly.
- All helpers return typed results and handle errors.
- Batch writes when updating multiple elements on the same slide.

---

## Coding standards

### React

- Function components only. Hooks for everything.
- Props destructured in signature, not inside body.
- No default exports for components. Named exports only.
- One component per file. Filename matches component name in PascalCase.
- Hooks in `hooks/` folder, prefix `use`, one hook per file.

### Styling

- Tailwind classes inline. No CSS-in-JS. No styled-components.
- For conditional classes, use `clsx`.
- Custom values go in `tailwind.config.js`, not arbitrary values `[#123456]`.
- Arbitrary values are only allowed for the 1080x1080 canvas dimensions.

### Naming

- Components: PascalCase
- Hooks: camelCase starting with `use`
- Stores: camelCase ending with `Store`
- Firebase helpers: camelCase verb-first (`getPost`, `updateSlide`)
- Constants: SCREAMING_SNAKE_CASE
- Files: match the primary export

### Async

- Always `async/await`, never `.then()` chains.
- Every Firebase call wrapped in try/catch with user-facing error surfaced via `uiStore` toast.

### Error handling

- Never silently swallow errors.
- No `console.log` in committed code. Use `console.warn` and `console.error` only for real problems.
- User-facing errors go through `uiStore.addToast({ type: 'error', message })`.

---

## Performance budgets

- Editor time-to-interactive: under 2 seconds on fast 3G.
- Canvas render with 30 elements: 60fps on mid-range laptop.
- Bundle size after tree-shake: under 500kb gzipped for main chunk.
- Firebase reads per editor session: under 50 for a post with 20 versions and 10 comments.

If a change violates a budget, stop and ask.

---

## Approved dependencies

Already installed in `package.json`. Do not add new ones without asking first.

**Prod**: react, react-dom, react-router-dom, firebase, zustand, react-moveable, @tiptap/react, @tiptap/starter-kit, @tiptap/extension-color, @tiptap/extension-text-style, react-hotkeys-hook, html-to-image, nanoid, clsx, date-fns

**Dev**: vite, @vitejs/plugin-react, tailwindcss, postcss, autoprefixer, eslint, prettier

---

## What NOT to build

- No social login (Google/Apple sign-in). Email+password only until requested.
- No AI features. No image generation. No text generation. User explicitly said no Claude API.
- No real-time collaborative editing. Review flow is async via shareable links.
- No Cloud Functions or backend logic. Everything client-side.
- No migration script from the old `bearbell-content-studio` Realtime Database. Fresh start.
- No dark mode toggle. The app IS the editor, content is the variable.
- No i18n framework. Dutch UI strings inline.
- No test framework until asked. Focus on shipping working features.

---

## Git and commit conventions

- Feature branches: `feat/<short-name>`, `fix/<short-name>`, `chore/<short-name>`
- Commits: conventional commits style. Examples:
  - `feat(canvas): add snap-to-grid with 12-column guides`
  - `fix(export): wait for fonts.ready before toPng`
  - `chore(deps): bump tiptap to 2.4.1`
- Never commit directly to main. PR or merge via CLI after local verification.
- Never commit `.env.local`, `node_modules`, `dist`.

---

## Context on existing BEARBELL systems

These exist but are out of scope for this project. Do not integrate with them unless asked:

- `bearbell.nl`: WordPress site, Astra child theme
- BEARBELL CRM: separate React app (`bearbell-crm-v4`)
- Old Content Studio: single-file HTML on Netlify, Firebase Realtime DB project `bearbell-content-studio`
- Kennisbank: WordPress articles on bearbell.nl

This project is standalone. It reads nothing from those systems and writes nothing to them.

---

## When in doubt

- Prefer boring, stable solutions over clever ones.
- Prefer less code over more code.
- Prefer deleting code over adding flags.
- If a feature is not in the 6-week plan (see SETUP-PLAN.md), ask before building it.
- If the user gives a vague instruction, ask one specific question with A/B options. Do not guess.
