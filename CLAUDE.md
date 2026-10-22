# Abbaas Ledger: how work is done here

A Vite + TypeScript + Supabase web app (a PWA) for the owner and Abbaas. `main` is published to GitHub Pages: **every push to `main` deploys the live site.**

## Privacy: this repository is PUBLIC

- Never commit or push the owner's ledger data. This means totals, the split by currency, single amounts, dates and recipient names, and the Excel file.
- Acceptance specs seed their own invented entries.
- Briefs, issues and commit messages use invented figures.
- DES documents can quote whatever the specialists were given. Before **any** push, read the diff of the pushed range for figures, and grep it with the local list at `~/Claude/_backups/abbaas-ledger/privacy-patterns.txt`:
  `git log -p origin/main..HEAD | grep -n -F -f ~/Claude/_backups/abbaas-ledger/privacy-patterns.txt`
- Keys: only the Supabase anon key goes into a build. Never print, log or commit keys, and never paste `.env` values.

## Route

- New behaviour goes through the host-led DES steps:
  `des design → oracle → craft (per value) → verify → reviewer → owner's phone check → integrate`.
- Run every specialist as the exact installed `nw-*` agent:
  - architect: `nw-solution-architect`
  - acceptance designer: `nw-acceptance-designer`
  - crafter: `nw-functional-software-crafter` (the paradigm is functional)
  - reviewer: `nw-software-crafter-reviewer`
- Render their tasks with `des handoff --repo-root ROOT prompt --role ROLE [--value N] --root-context FILE`.
- Formal checkers are not installed. The owner has waived them for the read-only Statement. `typesafe: unavailable`.
- A pure visual tweak (a constant, colour or spacing that no test reads) is done directly: edit, check it live, commit.

## DES rules that bite in this repo

- **Leave `src/` uncommitted during a Request.** Commit only tests and docs. `des verify` builds the candidate commit from the declared target paths on top of HEAD, and `integrate` needs its single parent to equal HEAD. A src file that is not a declared target is silently left out.
- **Oracle baseline:** `des oracle --value N --baseline <the Request's original source commit> --input -`.
- **Never stage `.nwave/**`.** Never `--amend` or rebase a verified or integrated candidate. Stage explicit paths, and never use `git add -A`.
- **After integration:** commit `chore: close the <name> Request`.

## Tests and gates

- `npm run build`
- `npm run test:acceptance`: Playwright on the built bundle, 360×780 viewport, against the local Supabase stack (ports 54420-54424, origin 4317). Each spec resets the database.
- **One Playwright run at a time.** All runs share one stack, so serialise them with a mkdir lock.
- The DES oracle command is `node tests/support/oracle-observation.mjs <spec>`. It runs `npm ci` itself when `node_modules` is missing.
- The shell may be zsh, so list paths explicitly. Never rely on unquoted `$VAR` word-splitting.

## Phone check (the stop point)

- Visual and motion work stops for the owner's phone check before integration.
- Serve the build over Wi-Fi:
  `npx vite --host 0.0.0.0 --port 5180`
  with `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS=<mac>.local` and `VITE_SUPABASE_URL=http://<mac>.local:54421`.
- Seed a local preview account from a script that is kept outside the repo, and seed again after any test run.
- Integrate only when the owner says "approved".

## Landing

- Integrate with `des integrate --candidate SHA` only after the owner's approval.
- Push `main` only when the owner asks, and only after the privacy grep, because the push deploys Pages.
- For an autopilot worker: stop at `awaiting-device`. Push the feature branch only after the privacy grep is clean. Never push `main`.

## Commits

Conventional Commits, with the subject in the imperative and at most 72 characters. End the message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. User-facing replies use ASD-STE100 Simplified Technical English.
