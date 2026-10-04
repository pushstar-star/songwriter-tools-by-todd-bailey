# Songwriter Tools by Todd Bailey

A responsive songwriting workspace combining song drafting, chord charts, live performance, setlists, TunePitch preparation, and personal critique orders.

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by the server. Microphone access works on `localhost` or HTTPS. Run `npm test` for music-theory and pitch tests and `npm run build` for a production build.

## Deployment

The existing starter uses vinext. Use `npm run build` and `npm start`. Before publishing to GoDaddy Node.js Apps, confirm the plan supports Node 22 and a persistent process. Set the application root to this directory and the start command to `npm start`. If that plan supports standard Next.js but not vinext, migrate the scripts to `next build` / `next start` first.

Copy `.env.example` to `.env.local` for local configuration. Never commit `.env.local`.

## Important first-version status

The preview identifies itself as a **local demo workspace**. Songs, setlists, and draft orders persist in browser local storage; no payment, delivery, critique, or AI result is fabricated. AI, checkout, and delivery show setup/sandbox states when credentials are absent.

Before accepting real customer data, production still requires:

- database-backed accounts and server-side owner/admin authorization;
- private object storage, signed downloads, and server-side upload validation;
- a server-only AI route using `OPENAI_API_KEY`;
- a payment provider and verified, idempotent webhooks;
- a TunePitch provider adapter and auditable delivery events;
- user-scoped encrypted offline storage and cache clearing on logout.

Do not use this browser demo for confidential songs or payments. The UI/workflows are ready for backend integration, but setup labels must remain until those systems are operational.

## Implemented workflows

- Song catalog, metadata, structured lyric sections, reorder/duplicate, notes, credits, tags, versions, autosave indicator, JSON export, and print.
- Songwriter Profile with required account name/email, validated profile photo, bio, location, website and social/music links, opt-in public visibility, and an explicitly selected in-app song showcase. Email and private song workspace data never appear in the public preview.
- Writing helper interface for all requested actions; it refuses to fake AI output without a provider.
- ChordPro charts, token-safe transposition, original preservation, print/PDF, responsive live mode, auto-scroll, text sizing, and PWA shell caching.
- Six-string chord identifier with muted/open strings, frets 0–12, slash chords, capo, Standard/Drop D/DADGAD/custom tunings, alternatives, and print.
- Local Web Audio tuner with permission/error/weak-signal states, calibration, target strings, autocorrelation, and microphone release.
- Setlist ordering, covers, per-performance overrides, breaks, and total duration.
- TunePitch and critique preparation, review, draft history, sandbox disclosure, and admin status/configuration UI.

## Privacy and offline behavior

The service worker caches only the public application shell. It does not cache sample-song JSON. Production must never put private song APIs/files in a shared cache and must clear all user-specific offline stores at logout.
