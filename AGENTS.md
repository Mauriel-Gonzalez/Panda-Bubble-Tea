# Panda Bubble Tea — Agent Guide

## Package manager

pnpm is required for both packages. Never use npm.

```sh
cd frontend && pnpm install
cd backend && pnpm install
```

## Project structure

Two independent pnpm projects (no monorepo workspace config):

- `frontend/` — Vanilla HTML/CSS/JS, Vite 8. **Not React** (old commit is misleading).
- `backend/` — Express 5 + nodemon, hardcoded `/menu` endpoint.

## Commands

### Frontend
| Command | Action |
|---|---|
| `pnpm dev` | Vite dev server |
| `pnpm build` | Vite production build |
| `pnpm lint` | ESLint (flat config) |
| `pnpm preview` | Preview production build |
| `pnpm deploy` | Deploy to GitHub Pages (`gh-pages -d dist/`) |

### Backend
| Command | Action |
|---|---|
| `pnpm dev` | nodemon on `index.js` (port 3000) |

## Vite build quirks

- Multi-page input: `index.html` + `menu.html` (not `src/pages/`).
- Base: `/panda-bubble-tea/` (GitHub Pages path).
- Output lands in `frontend/dist/`.

## CSS conventions

- Mobile-first responsive, `clamp()` for fluid sizing.
- Custom design system in `variables.css` (colors, spacing, radii, fonts).
- Utility classes: `.row`, `.column`, `.grid`, `.cluster`, `.center`, `.sidebar`, `.container`, `.no-spacing`, `.hidden`.
- Component classes: `.control`, `.control-primary`, `.control-pill`, `.control-float`, `.icon`, `.navbar`.
- Fonts: Outfit (body), Chillax (headings) — woff2/woff/ttf in `src/assets/fonts/`.
- Image formats: AVIF + WebP pairs available for all drink/landing images.

## Implemented MVP flow

- `src/js/app.js`, `menu.js`, `modal.js`, `checkout.js` — active vanilla JavaScript flow
- `src/css/modal.css`, `checkout.css` — active interaction and checkout styles
- `checkout.html` — simplified checkout page

## No test framework, no formatter configured

## Backend

Express 5 on port 3000 with CORS. Run `pnpm dev` in `backend/`.

Vite dev server proxies to `/menu`? No proxy configured — the frontend and backend are independent.

## Delivery constraints

Remaining time: 3-4 days.

Priority is project completion and delivery.

Prefer:
- simple implementations
- incremental changes
- low-risk solutions
- compatibility with the current codebase

Avoid:
- architectural rewrites
- framework migrations
- large refactors
- introducing unnecessary dependencies

## Git safety

Never execute automatically:

- git push
- git merge
- git rebase
- git reset --hard
- git checkout -- .

Ask for confirmation first.

## Product goal

Panda Bubble Tea is a small bubble tea ordering application.

Current goals:

- browse menu
- add products
- manage cart
- place orders
- basic admin dashboard

Focus on completing user flows rather than adding new technologies.

## Framework restrictions

Do not suggest React implementations.

Do not suggest migrating to React.

Do not generate JSX unless explicitly requested.

This project uses:

- HTML
- CSS
- Vanilla JavaScript
- Vite

The existing architecture must be preserved unless explicitly instructed otherwise.

## Working style

Before modifying files:

1. Explain the proposed solution.
2. List affected files.
3. Explain risks and impact.
4. Wait for confirmation when changes are significant.

Prefer small, reversible changes.

## Main objective

Finish and deploy a functional MVP as quickly as possible.

Practical and reliable solutions are preferred over elegant but complex solutions.
