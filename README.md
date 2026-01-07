# websitechatbot

This project is a small Vite + React + TypeScript starter that includes a lightweight chatbot UI to answer common FAQs about movie bookings.

## Design summary
- Accessibility-first chat UI: uses ARIA roles (`role="dialog"`, `aria-live`) and manages keyboard focus for a smooth screen-reader and keyboard-only experience.
- Responsive behavior: on small screens the chat opens as a full-width bottom sheet; on larger screens it appears as a floating panel in the bottom-right.
- FAQ matching: prioritizes exact keyword matches then falls back to fuzzy matching (Levenshtein + token overlap) with a conservative threshold to avoid incorrect answers.
- Supabase optional: FAQ data is loaded from Supabase when configured; otherwise a centralized `getDefaultFaqs()` fallback is used.

## Run / Dev
1. Install dependencies

   ```bash
   npm install
   ```

2. Start development server

   ```bash
   npm run dev
   ```

   Open the URL printed by Vite (typically `http://localhost:5173`).

3. Build for production

   ```bash
   npm run build
   ```

4. Preview production build

   ```bash
   npm run preview
   ```

5. Type-check (optional)

   ```bash
   npm run typecheck
   ```

## How to test the chat window (manual)
- Open the site and locate the round chat button in the bottom-right.
- Keyboard:
  - Tab to the chat button and press Enter to open the chat.
  - The message input is focused automatically; type and press Enter to send (Shift+Enter inserts a newline).
  - Press Escape to close the chat; focus returns to the chat button.
- Screen reader:
  - The chat is announced as a dialog. New messages are announced via a polite live region.
  - Verify announcements using NVDA/VoiceOver.
- Responsiveness:
  - Resize the browser to a narrow width and confirm the chat opens as a bottom sheet covering the width.
  - On larger widths it should render as a floating panel in the bottom-right.
- Functionality:
  - Ask common questions like "What are the ticket prices?", "How can I check show timings?" — the bot should return answers from the fallback FAQ list when Supabase isn't configured.
  - Try a question the bot doesn't know and confirm it suggests common topics.

## Running automated tests (recommended next steps)
- I recommend adding unit tests for the matching logic (extract it to `src/lib/matching.ts`) using Vitest, and adding E2E tests with Playwright to validate keyboard/ARIA behavior.

## Files of interest
- `src/components/Chatbot.tsx` — Chat UI and interaction logic (ARIA, keyboard handling, focus management).
- `src/lib/faqRepository.ts` — Default FAQ fallback data used when Supabase is not configured.
- `src/lib/supabase.ts` — Supabase client and types (optional configuration).

## Notes
- If you enable Supabase, ensure environment variables are set according to `src/lib/supabase.ts`.
- For accessibility audits, consider running axe or aPlaywright test that asserts focus, keyboard navigation, and presence of ARIA attributes.
