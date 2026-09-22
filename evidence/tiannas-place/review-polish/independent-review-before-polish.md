# Independent review · Tianna's Place mobile UI/branding revamp

**Reviewer:** external Claude Opus 5 (medium effort), read-only.
**Scope:** cold diff `58e8e082d01a0b7e555a5b58bce98ab6fbefd0af..0d67f28` (HEAD), reviewed and executed in the isolated clone `/Users/michaelchen/.hermes/kanban/workspaces/t_051720cf/tiannas-review`.
**Date:** 2026-09-21.

## Verdict

# APPROVE

The branch does what it was asked to do, and the claims in the evidence pack hold up when re-executed rather than read. Six findings follow. None of them loses data, breaks a flow, breaks a control, or contradicts a hard acceptance criterion in a way I can demonstrate; the two visual ones (F1, F2) are decorative-art defects on the homepage and activity stages that I recommend fixing before this is put in front of the owner, but I do not gate on them. Findings F3–F6 are disclosure/hygiene items.

I made no edit to the implementation checkout, spawned no agents, touched no GitHub or Vercel state, and pushed/PR'd/merged/deployed nothing. The implementation server on `127.0.0.1:3075` was left running and unmodified (verified HTTP 200 after my run).

---

## What I executed

All commands were run in this clone against a freshly installed `node_modules` (`npm ci`, exit 0), a review server on **`127.0.0.1:3099`** (never 3075), and a **disposable** Docker Postgres `tianna-review-pg` on `127.0.0.1:55999` with a throwaway `.env.local` containing only synthetic values (`review-only-synthetic-passphrase` / `review-only-synthetic-session-secret-…`). No real secret was copied, no production request for account data was made. The container, the `.env.local` and all test output were destroyed afterwards; `git status` in this clone is clean.

| Command | Result |
|---|---|
| `npm ci` | exit 0 |
| `npm run lint` | exit 0, no findings |
| `npm run typecheck` | exit 0 |
| `npm test` | **73 passed**, 0 failed |
| `npm run scan` | exit 0, no token/artwork findings — but see **F5** (dirties the worktree) |
| `npm run build` | exit 0. Critical JS **35,421 / 40,960** gzip, total **57,217 / 65,536**. `chunk-check`: `{"shellPrefetches":12,"chunks":11,"version":"a8dc9323c32d","allCached":true}` |
| Full Playwright suite, Chromium + WebKit (`npx playwright test`) | **297 passed / 2 failed** in 14.2m; both failures were my own missing `--env-file=.env.local` (`expect(process.env.APP_PASSPHRASE).toBeTruthy()` in `tests/e2e/review-r3.spec.ts:55`). Re-run with the env file: **2 passed**. Effective result at HEAD: **299/299**. |
| Focused acceptance set (`app`, `daily-logs`, `gamify`, `horizontal`, `tianna-accessibility`, `tianna-flows`, `v3`) | **38 passed**, both engines — exactly the count `post-cleanup/PROOF.md` claims |
| Focused layout set (`wellness.spec.ts --grep 'every page is one tap\|keyboard:\|text contrast meets WCAG\|non-text contrast:\|H1: hero\|a live session keeps'`) | **12 passed**, both engines — exactly the claimed count |
| `node scripts/tianna-offline.mjs` (real service worker, real Postgres) | exit 0, both engines. 3 queued ops offline, reload, reconnect, replay with **no duplication**; 5 stored rows; `sideways:false`; lazy routes `you`/`rules`/`walk` served from cache offline |
| `node --env-file=.env.local --import tsx scripts/tianna-db.mjs` (real HTTP + Postgres) | exit 0, both engines. Legacy walk converted, **3 walks preserved after a completion toggle**, legacy meal edited, portion 150 persisted, meal removal persisted, **weights and profile preserved**, 14 stored ops, `externalRequests: []` |
| Own probe: scene/viewBox geometry at 390×844, both engines | See **F1**, **F2** |
| Own probe: negative controls against the new acceptance spec's detection logic | See below |
| Own probe: computed `.dial` size at 844px and 640px viewport heights | 160×160 at both — see **F4** |
| Own probe: `.row` press state, 3× DPR capture | See **F6** |

### The evidence pack's own claims, re-checked

- `sw.js` **is in sync with HEAD**. My clean `npm run build` regenerated `flaccid75-shell-a8dc9323c32d`, byte-identical to the committed `public/sw.js`. The generated-worker problem that failed the coordinator gate is genuinely fixed.
- Tap counts: I diffed `before/flows-chromium/tap-counts.json` against `post-cleanup/acceptance/flows-chromium/tap-counts.json` programmatically — 29 journeys, **0 differences** in flow name, taps or fields. `TAPS.md` is accurate. Note the spec *records* counts rather than asserting them, so this is a comparison, not a test.
- Walking animation: `Hills`, `walkPath`, `walkPoints`, `.walker`, `@keyframes hop` and `@keyframes pulse` are untouched by the diff. `compatibility.json`'s claim holds.
- Persistence/schema/auth/timer are untouched: `git diff 58e8e082 HEAD -- lib/client-store.ts lib/auth.ts lib/timer.ts lib/domain.ts lib/db.ts lib/sessions.ts lib/settle.ts migrations/ vercel.json app/api/` is **empty**. Storage key `flaccid75-v1`, timer key `my-wellness-timers`, cookie `flaccid75-session`, SW cache prefix `flaccid75-`, manifest `id`/`scope` `/` all unchanged. `lib/estimate.ts`'s only change is the `X-Title` header string.
- Non-human art: `Gym`, `Mat` and `NightRest` are now cats (lifting, stretching, sleeping); no human figures remain in `components/Scenes.tsx`. Verified in the committed captures.
- Aesthetic: cream ground, apricot accent, sage hills, rounded white cards and the hills/time-of-day scene are all intact (`app/tokens.css` colour tokens are byte-identical to baseline).

### Negative controls (the acceptance spec is not vacuous)

I re-implemented `tests/e2e/tianna-accessibility.spec.ts`'s in-page detector in a standalone script and ran it against a mutated page:

```
baseline 320×568 @100%  -> []                (clean)
baseline 320×568 @200%  -> []                (clean)
mutation A (.row-action forced to 20×20)
  -> "small target 20x20: BUTTON.row-action completion-toggle", + 4 more
mutation B (.rows width forced to 900px)
  -> "outside viewport: DIV.rows", "outside viewport: DIV.row", "outside viewport: BUTTON.row-open"
mutation C (input font-size forced to 12px)
  -> "small input text: INPUT."
```

The detector catches undersized targets, viewport overflow and sub-16px input text, and the real page is clean at 320 px with 100% **and** 200% root text. The passing result is meaningful, not a tautology.

### The evidence-coverage gap I closed

Every committed artefact under `evidence/tiannas-place/post-cleanup/` is bound to `sourceCommit: 2701886…` (see `post-cleanup/checks/build-provenance.json`, `serviceWorkerVersion: 16716bb1cb83`). HEAD is two commits later: `775d28c` changed `app/globals.css` (and regenerated `sw.js` to `a8dc9323c32d`) and `0d67f28` changed `CLEANUP.md`. `CLEANUP.md` states plainly that its pass ran "no build, typecheck, browser, Playwright or scan". So **no browser, unit, type, lint or build evidence existed for HEAD itself** before this review. It does now: the full 299-test suite, both engines, the real-DB run and the real-service-worker offline run above were all executed against a clean build of HEAD.

---

## Findings

### F1 — Medium · The hero cloud is bisected into a flat white slab on Home and Walk

**Files:** `app/globals.css:20` (`.hero{min-height:var(--z-heroShort)}`), `app/globals.css:21` (`.hero-overlay{min-height:var(--z-heroShort)}`), `app/globals.css:190` (`.stage.walk .scene{height:var(--z-heroShort)}`); art at `components/Scenes.tsx:26` (`<Cloud x={196} y={198} s={.85}/>`), `components/Scenes.tsx:18` (`viewBox="0 0 360 400" preserveAspectRatio="xMidYMax slice"`).

**Reproduction (executed, Chromium and WebKit, 390×844):**
```
hero <svg> box        = 358 × 200 CSS px
slice scale           = max(358/360, 200/400) = 0.99444
first visible user-Y  = 400 − 200/0.99444 = 198.88
Cloud(196,198,s=.85) spans user-Y 181.85 … 213.30
→ 198.88 falls inside the cloud   → clipped = true   (identical in both engines)
```
Also visible directly in the delivered captures: `evidence/tiannas-place/post-cleanup/capture/phone/home.png` and `.../walk.png`, top-centre-right of the scene.

**Impact:** the cloud renders as a hard-edged white rectangle hanging off the top of the hero. It reads as a rendering glitch rather than art, on the two most-visited screens. At baseline the hero was `var(--z-scene)` = 220 px, which put the crop line at user-Y 178.8 — above the cloud — so this is a regression introduced by the 220→200 compaction. The brief asked for "compact without clipping"; content is not clipped, but decorative art now is.

**Required fix (pick one):** raise `--z-heroShort` usage on `.hero`/`.hero-overlay`/`.stage.walk .scene` back to ≥ 214 px; or move `Cloud x={196}` down to about `y={224}` so it clears the crop at 200 px; or give `Hills` the same treatment `Gym`/`Mat`/`NightRest` received — a `viewBox` band matching the visible region.

### F2 — Medium · The three new cat scenes letterbox, leaving white gutters against the card

**Files:** `app/globals.css:60` (`.stage .scene{width:100%;height:var(--z-sceneShort)}`); `components/Scenes.tsx` `Gym`, `Mat`, `NightRest` (`viewBox="0 0 360 160"`, no `preserveAspectRatio`, so the default `xMidYMid meet`).

**Reproduction (executed, both engines, 390×844):**
```
route     svg box     viewBox         par              gutterX   scene bg
workout   358 × 150   0 0 360 160     xMidYMid meet    10 px     transparent
abs       358 × 150   0 0 360 160     xMidYMid meet    10 px     transparent
rest      358 × 150   0 0 360 160     xMidYMid meet    10 px     transparent
floss     358 × 150   0 200 360 440   xMidYMid meet   118 px     rgb(220,236,241)  ← masked
```
Zoomed pixel check of the delivered `post-cleanup/capture/phone/rest.png` shows the white strip between the card's rounded corner and the square-cornered dark artwork.

**Impact:** 10 px of card-white shows down each side of the Workout, Abs and Rest artwork, and the artwork's square corners sit inside the stage's 24 px rounded corners — an inconsistent, unfinished edge. The mismatch is width-dependent: at 320 px the stage is 288 × 150 and the letterbox becomes ~11 px bands top **and bottom** instead. Notably `Floss` already carries a spot-fix for exactly this (`.stage.floss .scene{background:var(--c-skySoft)}`, `app/globals.css:189`), so the problem was recognised and only partly addressed. The comment at `components/Scenes.tsx:102` — "drawn on a 360×160 band that **fills the stage's full width**" — is therefore inaccurate.

**Required fix:** either set `preserveAspectRatio="xMidYMid slice"` on the three scenes, or drop the fixed `height` in favour of `.stage .scene{height:auto;aspect-ratio:360/160}`, or extend the `.stage.floss .scene{background:…}` pattern to `.stage.workout`/`.abs`/`.rest` with each scene's own ground colour. Fix the comment either way.

### F3 — Medium · Two visible homepage elements were removed without being disclosed in DESIGN.md / PROOF.md

**Files:** `components/App.tsx:48`, `components/App.tsx:56`; `components/shared.tsx:49`; `app/globals.css` (base `.row-chevron` rule deleted).

**(a) The time-of-day greeting no longer renders anywhere.** Baseline: `const title = page ? titles[page] ?? … : headline === 'Every one.' ? 'All done.' : headline` — the homepage `<h1>` showed "Good morning." / "Good going." / "Nearly there." / "A new day." / "Every one.". HEAD: `const title = page ? titles[page] ?? 'Tianna's Place' : selected ? 'Past day' : 'Tianna's Place'`. `headline` (`App.tsx:47`) survives **only** inside `aria-label={`${title}. ${headline}`}` on the `<h1>`. I grepped: `'Good morning'`, `'Nearly there.'`, `'Good going.'` appear nowhere else in `components/`. The hero copy card covers `Every one.` / `Resting today.` / `A fresh start.` / `Next: x.` / `Today.`, so the greeting variants are the ones actually lost — they are now screen-reader-only content with no visual counterpart.

**(b) The row chevron affordance was removed.** `daf76d9` appended `.row-chevron{display:none}`; `cead42f` then deleted the markup from `shared.tsx`, `Home.tsx` (water row, food row). Compare `evidence/tiannas-place/before/phone/home.png` (six visible `>` affordances) with `post-cleanup/capture/phone/home.png` (none).

**Impact:** both are legitimate design calls — the greeting had to yield the `<h1>` to the brand name, and the chevron competed for width at enlarged text. But the brief said *preserve all activities/features*, and neither change is mentioned in `DESIGN.md`, `PROOF.md`, `TAPS.md` or `README.md`. The owner will notice the missing greeting on day one. Separately, the rows now carry no visual signal that tapping the body opens a page while tapping the pill logs — discoverability of the two-target row rests entirely on the pill's contrast.

**Required fix:** no code change is required if these are intended; **state both explicitly in `PROOF.md`** so the owner can accept or reject them. If the greeting should stay visible, the natural home is the `.date` line under the `<h1>` or a second line in the hero copy card.

### F4 — Low · Dead and inert CSS the branch orphaned, which the cleanup gate reports as absent

`CLEANUP.md` states its final pass "found nothing left to change" after inspecting "every CSS class in `app/globals.css` against the components that render it". The following survived:

1. **`app/globals.css:137`** — `.night.is-done .zzz text:nth-child(3){animation-delay:1s}`. `NightRest` now emits **two** `<text>` elements (`components/Scenes.tsx:176`); the baseline had three. The selector matches nothing.
2. **`app/globals.css:121`** — `@media(max-height:650px){… .dial{width:var(--z-dialSmall);height:var(--z-dialSmall)}}` is fully overridden by the later, equal-specificity `.dial{width:min(100%,calc(var(--t-dial)*5));min-height:var(--z-dialSmall);height:auto;aspect-ratio:1}` at **`app/globals.css:178`**. Measured: `.dial` is **160×160 at both 390×844 and 390×640** — the media query does nothing. The same override makes the `width`/`height` the branch added to `.dial` at `app/globals.css:52` inert, and makes `.dial.is-small` visually identical to `.dial`.
3. **`components/Scenes.tsx:104`** — the comment "`done` holds the finished pose after it ends" is no longer true for `Mat`: there is **no `.mat.is-done` rule anywhere** (`grep -c "mat.is-done" app/globals.css` → 0). The baseline had `.mat.is-done .pose-up`, `.mat.is-done .pose-rest` and `.mat.is-done .crunch-spark`. The Abs scene therefore has no visual completion state; only the copy ("Core done.") and `.stage.is-done .stage-tag` still signal it.
4. **`lib/tokens.ts:22`** — `liftRise`, `thumb`, `heroMax`, `scene`, `ctaMin`, `tileArt` and `dial` each had at least one `var(--z-…)` consumer in `app/globals.css` at the baseline and have **zero** at HEAD. They still ship in every response via `app/tokens.css`.

**Impact:** no user-visible effect; it is bytes on the critical path and a stale comment. It matters mainly because `CLEANUP.md` asserts the opposite, and a reader will trust that assertion.

**Required fix:** delete items 1 and 2, fix the comment in item 3 (or restore a done-state for `Mat`), and either prune item 4's tokens or note in `CLEANUP.md` that token pruning was out of scope for the pass.

### F5 — Low · `npm run scan` still dirties the worktree; the clean-worktree gate will keep failing on it

**Reproduction (executed on a clean tree):** `npm run scan && npm run build` leaves exactly two tracked files modified, and nothing else:
```
 M evidence/v3/mascot-scan.json     "scanned": 108 → 136
 M evidence/v3/token-scan.json      + "lib/meal.ts"
```
`public/sw.js` **no longer drifts** — that half of the original gate failure is genuinely fixed. The remaining drift is by design: `803f031` deliberately restored the baseline copies of these two files ("restores historical artifacts only"), and `post-cleanup/PROOF.md` advises the coordinator not to treat `scan`/`build` as clean-worktree checks.

**Impact:** `npm run check` (which chains `scan` and `build`) can never leave a clean tree on this branch. Any future gate that runs it will fail for a non-defect reason.

**Required fix:** either commit the refreshed `evidence/v3/*.json` under a new path and leave the historical ones alone, or have `scripts/token-scan.mjs` / `scripts/mascot-scan.mjs` take an output-directory argument. At minimum, `CLEANUP.md` should carry the same warning `post-cleanup/PROOF.md` does, since the coordinator reads `CLEANUP.md`.

### F6 — Low · Pressed dashboard rows lose their rounded left corners

**Files:** `app/globals.css:30` — `.row` lost `overflow:hidden` relative to baseline; `.row-open:active{background:var(--c-cardTint)}` at `app/globals.css:31`; the compensating `.row-open:focus-visible{…;border-radius:var(--r-lg)}` at `app/globals.css:167` only applies on keyboard focus.

**Reproduction (executed, 3× DPR capture of `.row` mid-press):** computed `.row{overflow:visible; border-radius:24px}` with `.row-open{border-radius:0px}`; the press tint fills the square rectangle and squares off the card's 24 px leading corners for the duration of the touch.

**Impact:** a brief cosmetic flicker on every row tap — the most frequent interaction in the app. Removing `overflow:hidden` was presumably intentional (so the focus ring is not clipped), but the `:active` state was not given the matching radius.

**Required fix:** add `border-radius:var(--r-lg) 0 0 var(--r-lg)` to `.row-open` unconditionally (it already gets `var(--r-lg)` on `:focus-visible`), rather than restoring `overflow:hidden`.

---

## Observations that are not defects

- **`components/App.tsx:33`** now reads `if (h)` where the baseline read `if (h && page)`, so the topbar `<h1>` is focused on the **initial** render as well as on navigation. This is what the new keyboard test asserts (`tianna-accessibility.spec.ts:57`) and is defensible; it does move focus off the document start on first load. Flagging for awareness only.
- **`components/shared.tsx:11`** — `weekInitials` went from `['Mo','Tu',…]` to `['M','T','W','T','F','S','S']`, so the month-view column headers (`Progress.tsx:31`, bare `<span>`s) have duplicate `T`/`T` and `S`/`S`. This is the standard calendar convention and every day *button* carries a full `aria-label`, so I do not consider it a defect.
- **No tap-count improvement was delivered** — all 29 journeys are identical before and after (verified). The revamp's measurable win is scroll height (Workout 1106→925, Abs guided 1188→954, Rest 1029→855) and legibility, at the cost of Home 1328→1342, Water 878→943, Settings 1367→1446. `PROOF.md` reports both directions honestly.
- `README.md` retains the heading "## Version 4 · My Wellness". `CLEANUP.md` defends this as a historical release name; I agree.
- **Doc/version drift (cosmetic):** `PROOF.md` and `post-cleanup/PROOF.md` both say "the current cleanup build uses **16716bb1cb83**". HEAD's worker is `a8dc9323c32d` (correct, and reproduced by my build). The documents are one commit stale, not wrong about the artefact they describe.
- Error states are unchanged and correct: every `.form-error` carries `role="alert"` (`Rewards.tsx:30`, `Settings.tsx:85`, `Food.tsx:107,112`, `Camera.tsx:12`, `Activities.tsx:173,174`).

---

## Limitations — what I did **not** verify

State these alongside any acceptance decision.

- **No physical device.** Everything above is desktop Chromium and WebKit with iPhone 13 emulation. No physical iPhone, no physical Safari, no VoiceOver, no real iOS software keyboard, no physical Dynamic Type, no real camera, no airplane mode, no app suspension or lock-screen timing. The 200% root font size and the substituted `env(safe-area-inset-*)` values exercise CSS arithmetic and reflow, not hardware behaviour. I confirm the implementation's own limitation statement is accurate and not overstated.
- **No deployment verification, by design.** I made no Vercel or GitHub API call of any kind. The repository-ID, rename-redirect, alias, production-SHA and `link.repo` claims in `RENAME.md` / `repository-final.json` are **supervisor-provided and not independently re-verified here**. `link.repo` still displaying `flacid-75`, and whether a future push would trigger a deploy, remain untested — correctly so, since deployment is forbidden for this task. I did confirm this clone's `origin` points only at the local implementation worktree, so nothing here could reach a remote.
- **No production data.** Every fixture was synthetic and local. The real-DB and offline runs used a disposable container I created and destroyed; the implementation's own `tianna-t051720cf-local` container and its `3075` server were not touched.
- **No live model call.** `lib/estimate.ts` was read, not exercised; no `OPENROUTER_API_KEY` was present.
- **Not a WCAG conformance certification.** I re-ran and stress-tested the project's automated contrast/target/reflow/focus checks and reviewed the code, but automated checks plus code review are not a full audit. Reading order, cognitive load and screen-reader narration quality on the new layouts were not assessed with an actual screen reader.
- **Timer/settlement logic was exercised only through the existing suite.** I did not construct new adversarial timing scenarios; the diff does not touch `lib/timer.ts`, `lib/settle.ts` or `lib/sessions.ts`, so I judged that out of scope.
- **`npm audit`'s 21 inherited findings** (16 moderate, 5 high) were not re-run or triaged. They pre-date this branch and dependency upgrades are outside its scope.
- **The `.setup-scene` CSS class** has no markup anywhere, but it is dead at the baseline too, so I did not count it against this branch.

---

## Summary against the original criteria

| Criterion | Result |
|---|---|
| Inspect homepage + mobile/a11y guidance before design | Met — `DESIGN.md` records the baseline reading and six primary sources, dated before implementation |
| Preserve cream/apricot/sage aesthetic | Met — colour tokens byte-identical; captures confirm |
| Preserve all activities / features / data | Met for data and activities (verified against real Postgres). **Two visible homepage elements dropped undisclosed — F3** |
| Refine every UI/flow; typography/spacing/hierarchy/control consistency | Met — type tokens moved px→rem, controls normalised to 44 px, wrapping added throughout |
| Compact without clipping or small unreadable targets | Met for content and controls (0 problems at 320 px, 375 px and 200%, independently re-run with working negative controls). **Decorative art now clips — F1, F2** |
| No horizontal scrolling | Met — `horizontal.spec.ts` passes both engines; my own scan finds no element outside the viewport at 320/375/390 |
| Brand Tianna's Place | Met — gate, `<h1>`, metadata, manifest, onboarding, settings, package name, model `X-Title`, served HTML `<title>` |
| GitHub `tiannas-place` | Owner-executed; supervisor-verified; **not re-verified by me** |
| Non-human art for exercise/sleep, walking animation retained | Met — three cats; `Hills`/`.walker`/`@keyframes hop` untouched |
| Before/after tap counts + screenshots for logging/editing/completion | Met — 29 journeys, both engines, both phases; counts verified identical |
| iPhone small layouts, WebKit, keyboard, safe-area, enlarged text, focus/labels/contrast/reduced motion | Met in **emulation**, both engines, independently re-executed. Physical device explicitly not claimed |
| Preserve saved data, work, history, access | Met — no schema/auth/storage-key change; real-DB run confirms legacy walks, meals, weights and profile survive |
| No new features, no unrelated refactors | Met |
| No push / PR / merge / deploy; local commits only | Met |
