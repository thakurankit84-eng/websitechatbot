# websitechatbot

A small, accessible movie-booking web UI built with Vite + React + TypeScript and a lightweight embedded chatbot assistant.

## Summary

This project demonstrates a responsive movie site UI that includes a floating chat widget (or bottom-sheet on mobile) which answers common questions about ticketing, showtimes, bookings and policies. The chatbot uses a local FAQ repository by default and can optionally read/write data from Supabase when configured.

## Tech stack

- Vite + React (TypeScript)
- Tailwind CSS
- Optional: Supabase for persistent FAQ storage
- Lucide icons

## Design choices (brief)

- Accessibility: ARIA roles (`role="dialog"`, `aria-live`), keyboard shortcuts (Enter to send, Shift+Enter for newline, Escape to close) and focus management to support keyboard and screen-reader users.
- Responsiveness: Bottom-sheet on narrow viewports and floating panel on wide screens via Tailwind responsive utilities.
- Matching strategy: High-precision keyword/exact matching first, then conservative fuzzy matching (Levenshtein + token overlap) to reduce false positives.
- Resilience: Mock Supabase client and a centralized fallback FAQ file (`src/lib/faqRepository.ts`) so the app runs without external services.

## Quickstart (Run locally)

### Prerequisites

- Node.js (recommended >= 16)
- npm (or yarn)

### Steps

1. Clone the repository

   ```bash
   git clone https://github.com/thakurankit84-eng/websitechatbot.git
   cd websitechatbot
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   # yarn
   ```

3. Start dev server

   ```bash
   npm run dev
   ```

   Open the URL printed by Vite (typically `http://localhost:5173`). The site supports hot-reload and TypeScript checks during development.

### Build for production

1. Create a production build

   ```bash
   npm run build
   ```

2. Preview the build locally (Vite preview)

   ```bash
   npm run preview
   ```

   This serves the `dist` output locally on a random or configured port.

### Serve the production build with a static server (any OS)

Option A: Use `serve` (simple, cross-platform)

```bash
npm install -g serve
serve -s dist -l 5000
# Open http://localhost:5000
```

Option B: Using `npx` without global install

```bash
npx serve -s dist -l 5000
```

Option C: Docker + nginx (recommended for consistent environments)

1. Build the app

   ```bash
   npm run build
   ```

2. Create a Docker image (example `Dockerfile`)

   ```dockerfile
   FROM nginx:stable-alpine
   COPY dist /usr/share/nginx/html
   EXPOSE 80
   ```

3. Build and run

   ```bash
   docker build -t websitechatbot:latest .
   docker run -p 8080:80 websitechatbot:latest
   # Open http://localhost:8080
   ```

## Environment (Supabase)

- The app works without Supabase. To enable Supabase features, create a `.env` file in the project root with:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Restart the dev server after adding env vars.

## How to test the chat window (manual)

- Locate the round chat button in the bottom-right and open the chat.
- Keyboard shortcuts:
  - `Enter` — send message
  - `Shift+Enter` — insert newline
  - `Escape` — close chat (focus returns to the toggle button)
- Accessibility testing: Use a screen reader (NVDA, VoiceOver) to confirm dialog announcement and that new messages are announced via the polite live region.
- Behavior testing: Ask questions that match the fallback FAQs (see `src/lib/faqRepository.ts`) such as "What are the ticket prices?" or "How can I cancel my booking?".

### Unit testing suggestion

- For predictable behavior add unit tests for the matching logic. Extract the matching utilities to `src/lib/matching.ts` and write Vitest tests validating keywords, fuzzy matching, and threshold behavior.

## Files of interest

- `src/components/Chatbot.tsx` — chat UI, keyboard/ARIA handling, message flow and matching logic.
- `src/lib/faqRepository.ts` — fallback FAQs used when Supabase is not configured.
- `src/lib/supabase.ts` — mock Supabase client and types; Supabase is dynamically imported when env vars are set.

## Troubleshooting

- Dev server fails to start: Ensure Node.js is installed and you ran `npm install`.
- Port conflict: either stop the process using the port or run Vite with a different port, e.g. `PORT=5174 npm run dev` (on Windows PowerShell use `$env:PORT=5174; npm run dev`).
- TypeScript errors: run `npm run typecheck` to see diagnostics.

## Contributing

Contributions welcome. Please open issues or submit PRs. Consider adding tests for the matching logic and accessibility regression tests.

## License

Add a LICENSE file if you intend to publish under a specific license.
