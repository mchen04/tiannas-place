# Review polish · t_051720cf

All six requested findings are addressed in this checkout on **mbp-old**. The next bounded cleanup and final verification by the same independent reviewer are **pending**; this report is not a passed coordinator gate or a new independent approval.

Application/test source: **7a13b7693de043608717921ab3841ed1abcda03a** — `fix: resolve reviewed scene, greeting and press-state polish`. Build worker: **81b6aa368b2a**. [Source hashes](checks/build-provenance.json) bind the 47 application/build/test files to that commit. The served CSS, worker and all 12 JavaScript assets match the build files. [Served-build receipt](checks/served-build.json). Later documentation/evidence commits do not change this tested source.

The app remains running at **http://localhost:3075**, bound to localhost, with the existing synthetic local database. The server was stopped before each build and restarted only after the build finished. No build ran during browser verification.

## Six findings resolved

| Finding | Change and proof |
|---|---|
| **F1: clipped hills cloud** | Home and Walk retain at least the lower 220 SVG units, with a 220px minimum height. A shared grid cell lets enlarged hero copy grow the card; its track and spacer are constrained to the card width. The hills, walk path/points, walker, hop and pulse animation are unchanged. Cloud clearance stays positive across all measured sizes. [Compatibility](checks/compatibility.json) · [Geometry](geometry-chromium/geometry.json) |
| **F2: cat gutters** | Workout, Abs and Rest keep their full 360:160 proportions as the stage width changes. The background fills the stage and the whole cat remains inside the viewport. Measured background-edge discrepancy is at most **0.016px**, with no crop. [WebKit geometry](geometry-webkit/geometry.json) |
| **F3: greeting/chevrons** | Tianna’s Place stays the heading; the original time-of-day/progress greeting is visible directly below it, followed by the date. It is no longer duplicated in the heading's accessible name. Morning, afternoon, evening, progress, completion and rest states are checked. **Chevrons remain intentionally removed** to preserve label/action space. The row's name/art/status target opens details; its separate checkbox or labeled action logs/completes. Both targets retain distinct accessible names and focus. All 29 measured journeys remain unchanged. [Greeting evidence](greeting-webkit/) · [Tap comparison](checks/acceptance-comparison.json) |
| **F4: inert CSS/comment** | Removed the third `zzz` child rule, overridden dial dimensions and short-viewport override, the inert `.dial.is-small` rule and unused `Dial.small` option. One responsive dial sizing rule remains. The Mat comment now accurately says its completion is conveyed by stage copy/tag, with stretching only during active feedback. The token catalogue is **intentionally retained**, including currently unused entries; broad token pruning and the baseline-only `.setup-scene` selector remain outside scope. [Cleanup disclosure](../../../CLEANUP.md) |
| **F5: scanner side effects** | Both original `evidence/v3` scan snapshots are preserved byte-for-byte. Fresh scan output is under [scans](scans/), with [preservation hashes](scans/preservation.json). `CLEANUP.md` and this proof explicitly document generating commands below. Scanner code is unchanged. |
| **F6: squared pressed row** | The row body has rounded corners in every state, including when enlarged text wraps it above its action. All four corners are rounded so the wrapped row's top-right edge also remains correct. The existing inset keyboard outline stays visible; row overflow is not hidden. Actual pressed states, corner hit-testing, wrapped rows and keyboard focus are checked in both engines. [Pressed/focus evidence](pressed-webkit/) |

## Final executed checks

| Command | Result |
|---|---|
| `npm run lint` | Passed. [Receipt](checks/lint.txt) |
| `npm run typecheck` | Passed. [Receipt](checks/typecheck.txt) |
| `npm test` | **73 passed**, zero failures. [Receipt](checks/unit.txt) |
| `npm run build` | Passed, including TypeScript, JS budgets and chunk/cache consistency. Critical JS **35,417 / 40,960 gzip bytes**, total **57,218 / 65,536**; 12 prefetched assets, 11 chunks, all cached. [Receipt](checks/build.txt) |
| `npm run scan` | **35 token-scanned files, zero findings; 136 artwork-scanned files, zero hits**. Historical outputs restored after retaining current receipts. [Receipt](checks/scan.txt) |
| Focused acceptance command below | **44 passed**, Chromium and WebKit, including the six new regression tests. [Receipt](checks/focused-browser.txt) |
| Focused layout command below | **12 passed**, Chromium and WebKit. Navigation, keyboard, text/non-text contrast, hero/stage copy and live controls. [Receipt](checks/layout-browser.txt) |
| `ONLY_VIEWPORT=phone node --import tsx scripts/tianna-capture.mjs evidence/tiannas-place/review-polish/capture` | **57 phone states + 10 extras**, all reached, zero layout findings. [Receipt](checks/capture.txt) · [Measurements](capture/fit.json) |
| `node scripts/tianna-offline.mjs` | Passed in both engines against the final build, real worker and disposable local PostgreSQL schema. Three queued operations survive reload/reconnect and replay without duplication; five total stored operations include onboarding. [Receipt](checks/offline-browser.txt) · [Results](offline/offline-integration.json) |
| `node scripts/secret-check.mjs` | Known local secret values checked across staged/tracked files, history and the client bundle, with a compressed positive control. Historical output restored. [Receipt](checks/secret-scan.txt) · [Result](checks/secret-scan.json) |
| `git diff --check`, source SHA-256 checks, JSON parsing, relative-link checks, worker/template equality, historical byte comparisons | Checked before the evidence commit; final clean Git status and source equality checked after it. [Integrity receipt](checks/integrity.json) |

```sh
TIANNA_PHASE=review-polish/acceptance node --env-file=.env.local node_modules/@playwright/test/cli.js test tests/e2e/app.spec.ts tests/e2e/daily-logs.spec.ts tests/e2e/gamify.spec.ts tests/e2e/horizontal.spec.ts tests/e2e/tianna-accessibility.spec.ts tests/e2e/tianna-flows.spec.ts tests/e2e/tianna-polish.spec.ts tests/e2e/v3.spec.ts --reporter=list

node --env-file=.env.local node_modules/@playwright/test/cli.js test tests/e2e/wellness.spec.ts --grep 'every page is one tap|keyboard:|text contrast meets WCAG|non-text contrast:|H1: hero|a live session keeps' --reporter=list
```

The **56 final browser tests** cover all existing acceptance journeys, meal edits, multiple walks, completion toggles, timers, saved-state reloads, reduced motion, labels, focus, simulated safe areas, short-viewport forms and enlarged text. The broader accessibility probes passed **84 route/layout cases and 16 enlarged-text sheets**. The new art checks measure **60 scene/layout cases** across both engines at 320, 375, 390, 430px, desktop shell width and 320px/200% text. They also assert card content fits, not just the SVG viewport.

Negative controls temporarily restore the 200px clipped hills, fixed-height cat gutters and square row corner on isolated fixture pages. Each corresponding detector rejects the old defect; the temporary mutations are removed. [Chromium geometry](geometry-chromium/geometry.json) · [WebKit pressed states](pressed-webkit/states.json).

## Visual evidence and tradeoffs

[Before/final comparison gallery](../index.html) now uses these final-build phone captures. [Phone captures](capture/phone/) · [Chromium accessibility](acceptance/accessibility-chromium/) · [WebKit accessibility](acceptance/accessibility-webkit/) · [Summary](checks/summary.json).

At 390×844, page content height changes from the prior after-capture to this final capture: Home **1342→1362px**, Walk **1037→1057px**, Workout **925→934px**, Abs library **1021→1030px**, Rest **855→865px**. The cloud needs the extra hills height; proportional cat height varies with width. The restored greeting adds a line in the fixed header, separate from these content measurements. This is an intentional modest height tradeoff for intact art and the restored greeting. Activity pages remain shorter than the original baseline. [All measured heights](checks/scroll-comparison.json).

Two intermediate sizing attempts failed and were corrected. Worker `c429e531bdaf` passed art probes but clipped hero copy at 200% text: **36 passed, 2 failed** in its acceptance run. Worker `dad655dd0db6` exposed a grid intrinsic-width overflow; its known-failing browser run was stopped and its capture failed. Their [first receipts](interim-c429e531bdaf/) and [second receipts](interim-dad655dd0db6/) retain source hashes and outcomes. They are not counted as final passes. Final worker `81b6aa368b2a` passed the complete focused runs and capture above.

## Historical evidence and command side effects

The [independent review](independent-review-before-polish.md) applies to `0d67f28`, with worker `a8dc9323c32d`: effective full result **299/299** (297 initially, then two environment-corrected reruns), 73 unit tests and real DB/offline verification. That review was not rerun by this implementer. The unchanged slow timer suite and full DB harness were not repeated; current source leaves schema, persistence/auth/timer logic and dependencies unchanged. The final focused suite, reload checks and real offline/DB replay above cover this follow-up.

Older proof remains tied to its actual sources: the original implementation and the `2701886`/`16716bb1cb83` cleanup follow-up were not relabeled as current results. Fresh outputs from scripts that write historical paths were copied into this directory, then **136 historical files were restored byte-for-byte**. [Preservation receipt](checks/artifact-preservation.json).

`npm run scan` rewrites tracked `evidence/v3/token-scan.json` and `mascot-scan.json`; the intentionally retained historical snapshots differ from today's output. `npm run build` regenerates tracked tokens/worker plus ignored client assets/manifest and `.next`. `npm run check` chains both and inherits those writes, so it is **not a non-mutating clean-worktree gate**. Existing browser/DB/offline/secret scripts also write evidence. Archive fresh results under the card and restore only historical outputs, without reverting application code. Build before committing generated artifacts, verify matching source/build hashes, and stop/restart the app around rebuilding. No scanner refactor was introduced.

## Limits and handoff

All account fixtures are synthetic and local. These are **desktop Chromium/WebKit tests**, not physical iPhone/Safari, VoiceOver, real iOS keyboard, Dynamic Type, camera, suspension or lock-screen tests. Simulated safe-area insets and 200% root font size exercise layout, not device behavior. No live model call was made. Inherited dependency-audit findings remain outside this UI scope.

GitHub remains `mchen04/tiannas-place`; the live origin remains **https://flaccid75.vercel.app**, with the supervisor-confirmed unchanged project/aliases and numeric binding. Vercel's `link.repo` display string remains `flacid-75`; **future deploy-trigger behavior is untested**. This follow-up made no hosting/integration change or production request for account data.

Local commits only. No push, PR, merge, deployment, production-data write, extra coding agent, native goal or edit to another checkout. The preserved reviewer report was read from the review checkout; that checkout was not modified. After the clean evidence commit, edits pause for the required bounded cleanup and the same independent reviewer's final verification. No board completion action is performed.
