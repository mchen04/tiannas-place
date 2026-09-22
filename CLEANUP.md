# Cleanup gate

Run ID: df7ca5c2658a463189fbc42bd77b22ff
Status: complete
Scope: the incremental diff against `0d67f289368124b8e8c24711ca462e68607ad520` only. No unrelated code touched. This report supersedes the earlier run-bound report (Run ID a16f0080a2624c8687f2c9b5c6d301d5), not the cleanup commits it described, which stay in place.

## Passes

One pass of one planned, completed: deslop, simplification, conservative test pruning and stale-doc repair. It made no code edit.

Inspected: the 9 non-evidence files in the incremental diff (`CLEANUP.md`, `README.md`, `app/globals.css`, `components/App.tsx`, `components/Scenes.tsx`, `components/shared.tsx`, `public/sw.js`, `tests/e2e/app.spec.ts`, `tests/e2e/tianna-polish.spec.ts`); every changed comment; added lines for silencing casts, disabled lint rules, empty catches and leftover markers; the new e2e spec; and every CSS class in `app/globals.css` against the components that render it.

Findings: the F1–F6 fixes already removed what they orphaned. `.dial.is-small` is gone from both CSS and `Dial`'s props. The `@media(max-height:650px)` override and the duplicate late `.dial` block are gone. `.night.is-done .zzz text:nth-child(3)` is gone and `NightRest` renders exactly two `z` glyphs (`components/Scenes.tsx:176`). `--z-heroShort` still has one live consumer (`.gate-scene,.setup-scene`) and `--z-sceneShort` has three, so neither token is orphaned. The changed `Scenes.tsx` and `globals.css` comments describe the code as written. No nesting, defensive clutter or duplicated logic was introduced.

The earlier whole-branch cosmetic sweep was not repeated; this pass was bounded to the incremental diff by design.

## Rebase

Not needed. The coordinator checked ancestry before this pass.

## Removed

Nothing. A full class-orphan scan of `app/globals.css` against `components/` and `app/` reports only pre-existing, documented survivors: `.spark.s1`–`.s4` and `.star.st1`–`.st3` are built with template literals at `components/Scenes.tsx:158,164`, and `.setup-scene` is a baseline-only selector outside this branch's diff.

The token catalogue is intentionally retained rather than broadly pruned. `--z-liftRise`, `--z-thumb`, `--z-heroMax`, `--z-tileArt`, `--z-dial` and `--z-ctaMin` have no CSS consumer, but each was already unused at the base commit, so removing catalogue entries is outside this bounded pass. `--z-scene` is used again by the corrected hills layout. This is a specific cleanup, not a claim that every unused token or baseline selector was removed.

## Tests deleted

None. `tests/e2e/tianna-polish.spec.ts` carries three negative controls that were checked and are real: a forced `height:200px` walk scene must clip the cloud, a forced `height:150px` rest scene must show a left gutter, and a forced `border-radius:0` row body must register a square corner hit. Each assertion can fail, so nothing here qualified for deletion. The single edited assertion in `tests/e2e/app.spec.ts` tracks the greeting moving from the heading's accessible name to visible text; it still fails if either the brand heading or the greeting regresses.

## Docs updated

None needed. `README.md`, `evidence/tiannas-place/PROOF.md`, `DESIGN.md`, `TAPS.md`, `post-cleanup/PROOF.md` and `index.html` were checked against the current source and are accurate: the worker version in `public/sw.js` is `81b6aa368b2a`, which `review-polish/PROOF.md` names alongside the reviewer's `a8dc9323c32d` for `0d67f28`. Historical records stay marked historical rather than rewritten. This file was rewritten to the required run-bound form.

## Verified

By inspection only. No code changed, so no behavior check was required and none was run. The new spec's negative controls were read for failability, not executed here.

## Checks

The bounded plan for this gate is install, lint and unit tests at base and current, run synchronously by the coordinator before this pass. Receipts are in `cleanup-evidence-final`. Raw exit codes, all `0`: base install, base lint, base unit (73 tests, 73 pass, 0 fail); current install, current lint, current unit (73 tests, 73 pass, 0 fail). Those are the prechecks.

Typecheck, build and scan are **not** in this run's bounded plan. A diagnostic-delta comparison is not a green raw typecheck, and nothing here claims the wider repository green. Known historical diagnostics stay open and were not treated as permission to edit unrelated code.

Command side effects that constrain the postchecks: `npm run scan` writes the **tracked historical** files `evidence/v3/token-scan.json` and `evidence/v3/mascot-scan.json`, which intentionally retain their original snapshots; a current scan adds `lib/meal.ts` and scans 136 artwork files instead of the historical 108, and those expected differences are not application regressions. Store fresh output under the current card evidence directory, then restore just those two historical files byte-for-byte. `npm run build` regenerates `app/tokens.css`, `public/sw.js`, ignored client assets and `.next`, so it is a generating command, not a clean-worktree check. `npm run check` chains both and inherits both side effects. Playwright, capture, DB, offline and secret scripts also write evidence.

Postchecks have not run. The coordinator runs them after this pass exits. This pass started no check job of its own, in the background or otherwise.

## Commits

This pass produced one commit, containing only this report. The F1–F6 source commits `7a13b76` and `2628893` are unchanged, as are the earlier cleanup commits `cead42f`, `775d28c`, `2701886` and `803f031`.

## Reverted

none
