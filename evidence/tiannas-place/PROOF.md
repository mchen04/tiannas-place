# Tianna’s Place · local proof report

Card **t_051720cf** · **mbp-old** · base **58e8e082d01a0b7e555a5b58bce98ab6fbefd0af**. Sole implementer; no extra coding agents, native goals, cleanup agent, or independent reviewer were run.

## Delivery and scope

- Local app: **http://localhost:3075**. Production remains **https://flaccid75.vercel.app**; the revamp is not deployed.
- Tianna’s Place branding in the gate, homepage, settings, onboarding, document metadata, PWA manifest, package metadata, and model request title. The installed PWA ID and scope stay `/`.
- Retained the cream/apricot/sage palette, rounded white rows, hills, time-of-day scenery, direct logging, and completion feedback. The walking SVG and its animation code are byte-for-byte unchanged within their source sections; see [compatibility](compatibility.json).
- Larger relative typography (13px auxiliary text, 14px supporting text, 16px inputs at the default root size); 44px controls, wrapping, visible focus, safe-area padding, compact activity art, earlier timer controls, and improved dialog/meal input spacing. Calendar and week-chart controls use the WCAG 24px minimum at narrow widths, with the larger date picker as another way to navigate history.
- Original non-human cat SVGs replace the workout, abs, and rest figures. Floss retains its tooth artwork with corrected compact framing. The detail completion toggle now triggers the existing decorative feedback.
- No data migration, auth/storage key change, schema change, domain-rule change, dependency upgrade, hosting setting change, code push, PR, merge, or deployment.

## Evidence and method

[Design research and primary-source citations](DESIGN.md) was recorded before implementation. [Published gate](before/published-gate.png) is an unauthenticated capture of the existing live origin with account routes blocked. Signed-in before/after captures use synthetic local accounts, not Tianna’s production data.

- [Before phone screenshots](before/phone/) and [after phone screenshots](after/phone/) cover every activity, settings, sheets, food estimates/errors, simulated camera, rest planning, history, backfill, and completion states. The final sweep reached **57 states in each of three viewports plus 22 extra states**, with no detected overflow, clipping, scene-text overlap, or unexpected scrollers. Full scrolling captures accompany viewport captures where needed; these expand the page scroller for review rather than simulate a taller physical screen. [Comparison gallery](index.html) · [Layout results](after/fit.json).
- [After small-phone screenshots](after/small/) and [desktop screenshots](after/desktop/) supplement the 320px, 375px, and 200% text probes in [Chromium accessibility evidence](after/accessibility-chromium/) and [WebKit accessibility evidence](after/accessibility-webkit/).
- Both engines passed **84 route/layout combinations and 16 enlarged-text sheets**, plus keyboard navigation, focused short-viewport forms, nonzero simulated safe areas, and reduced motion. [Acceptance summary](after/acceptance-summary.json). A [long-timer capture](after/long-timer-200-percent.png) also verifies that a synthetic 26-hour display fits at 320px with 200% text.
- [Before journeys](before/flows-chromium/) and [after journeys](after/flows-chromium/) demonstrate logging, editing, removal, completion, and saved-state reloads. Equivalent after journeys run in WebKit.
- [All 29 measured journeys and counts](TAPS.md): action counts are preserved. One action completes or undoes Walk, Workout, Abs, and Floss from Home; one adds a full water container or toggles a rest day. Manual meal entry takes three control activations plus three filled fields; editing a saved meal from Home takes three control activations plus the changed fields. Counts exclude typing keystrokes, scroll gestures, reloads, timer waits, and resetting to Home between independent journeys.
- [Real HTTP/PostgreSQL results](after/real-db/results.json): both engines authenticate against a temporary local schema, load valid synthetic legacy-shaped data, retain multiple walks, toggle completion without deleting entries, edit nutrition-only meals, scale portions, delete entries, and verify reloads and SQL state. Both recorded 14 operations; existing synthetic profile/weight history remained equal.
- [Real service-worker/offline results](after/offline-integration.json): both engines open the cached shell and lazy routes offline, queue three changes, reload, reconnect, and replay without duplication. Chromium blocks browser networking; WebKit suspends the local origin server. PostgreSQL records five operations including the two onboarding operations, with no extra rows on replay.

At 390 × 844, the measured scrolling content height changed from **1,106 to 925px for Workout**, **1,101 to 1,037px for Walk**, **1,083 to 1,021px for Abs**, and **1,029 to 855px for Rest**. Start/pause/finish controls precede the timer or checklist, and running activity artwork moves below controls. Larger readable text and controls make Home slightly taller (**1,328 to 1,342px**), Water **878 to 943px**, and Settings **1,367 to 1,446px**. These are content heights, not gesture counts. [All measured heights](scroll-comparison.json).

## Executed checks

Exact commands and their output are retained in [checks](checks/); terminal carriage returns and trailing whitespace are normalized for Git. Existing scripts write to historical evidence paths; their current outputs were copied into [this run’s regression folder](after/regressions/) and the original tracked reports restored byte-for-byte. [Preservation record](checks/historical-evidence-preserved.json). No virtual-server mode was used for the final browser run. The regular browser suite uses mocked account routes for most UI scenarios and real local API endpoints for auth/input guards; the separate real database and offline scripts cover the actual persistence stack.

| Command | Evidence |
|---|---|
| `npm ci` | Installed the existing lockfile; no dependency graph change. [Comparison](checks/dependency-compatibility.json) |
| `npm run migrate` | Applied `001_initial.sql` only to the newly created local disposable database. |
| `npm run lint` | [lint.txt](checks/lint.txt) |
| `npm run typecheck` | [typecheck.txt](checks/typecheck.txt) |
| `npm test` | **73 passed**. [unit.txt](checks/unit.txt) |
| `npm run scan` | No token or retired-art-reference findings. [scan.txt](checks/scan.txt) |
| `npm run build` | Build, JS budgets, chunk/cache checks passed. Critical JS **35,452 / 40,960 gzip bytes**; total **57,248 / 65,536**. [build.txt](checks/build.txt) |
| `npm run test:integration` | Isolated PostgreSQL schema, **274 recorded operations**. [db-integration.txt](checks/db-integration.txt) |
| `node --env-file=.env.local node_modules/@playwright/test/cli.js test --reporter=list` | **299 passed, no failures (18.8m)**. [Final full browser output](checks/full-browser.txt) |
| `node --env-file=.env.local --import tsx scripts/tianna-db.mjs` | Both real HTTP/DB engines passed. [real-db-browser.txt](checks/real-db-browser.txt) |
| `node scripts/tianna-offline.mjs` | Both real offline/cache/DB engines passed. [offline-browser.txt](checks/offline-browser.txt) |
| `node scripts/pwa-check.mjs` | No Chromium installability errors. [pwa.txt](checks/pwa.txt) |
| `node --import tsx scripts/tianna-capture.mjs evidence/tiannas-place/after` | [Capture/layout result](checks/after-capture.txt) |
| `node scripts/secret-check.mjs` | [secret-scan.txt](checks/secret-scan.txt) |
| `npm audit --json` | **21 inherited findings**: 16 moderate, 5 high. Dependency upgrades are outside this UI task. [Sanitized audit](checks/dependency-audit.json) |

The initial acceptance run identified undersized WebKit native selects and the need for Safari Option-Tab in the keyboard harness; both were corrected and retested. An initial full-suite run lacked the environment variable required by an existing API guard test and was restarted with `.env.local` loaded. The first real-DB harness fixture used invalid non-UUID meal IDs; the account correctly refused it. The corrected fixture passes. Interim runs interrupted for final visual framing changes are labelled separately from the final full run.

## Repository rename and access

**Completed:** [mchen04/tiannas-place](https://github.com/mchen04/tiannas-place), still repository ID **1362066274**. The supervisor resolved the initial access uncertainty with an existing-credential, read-only Vercel check on mbp-main: project `flaccid75` is bound to numeric GitHub repo ID 1362066274, production branch `main`, with no deploy hooks. No credentials were transferred or requested. That Vercel observation is supervisor-provided, not an API read performed by this implementer. [Final preflight and provenance](repository-rename-preflight.json).

[Repository preflight](repository-before.json) confirms repository ID **1362066274**, public visibility, owner admin access, `main` at the expected history, no Pages site or repository hooks, and a successful Vercel Production deployment of the baseline. Prior PR2 commit `693ab92933f08edb6464344742b9d4f6c9e4f538` remains an ancestor. No old branches were imported, checkouts changed, or sessions/worktrees deleted.

The name-only GitHub update preserved all four remote branch refs, owner admin permissions, collaborators, public visibility, default branch and homepage. Old repository, PR 1–3 and prior PR2 commit URLs each return **301** to a **200** new URL; both old and new Git URLs resolve to the same refs. This checkout’s fetch and push origin is now `https://github.com/mchen04/tiannas-place.git`. Active README links use the new path; historical evidence links remain intact and redirect. The old mbp-main checkout was not changed by this implementer.

Production remains **HTTP 200**, with identical public HTML and service-worker hashes before and after the rename. The five most recent GitHub deployment records are unchanged. Hosting project/domain names, live origin, integration settings, database tables, cookie, local-storage keys, and service-worker cache prefix are unchanged. The supervisor’s independent post-rename Vercel binding check remains assigned to the supervisor. [Rename commands and results](RENAME.md) · [Final verification](repository-final.json). The [initial held-rename snapshot](repository-before-supervisor-confirmation.json) is preserved for provenance.

## Limits and handoff

This is **desktop Chromium and WebKit mobile emulation**, not a physical iPhone or physical Safari test. Nonzero safe areas are tested by substituting CSS environment insets. A shorter viewport exercises focused forms with reduced space; it does not reproduce the iOS software keyboard. 200% root font size exercises enlarged text and reflow, not a physical Dynamic Type setting. Physical install, VoiceOver, camera, airplane mode, suspension, and lock-screen timing remain unverified.

Photo/camera evidence uses synthetic media or fixtures. No live OpenRouter request was made; the local environment has no model key. Automated contrast/keyboard/layout tests and visual review support the checked scenarios; this is not a complete WCAG conformance certification.

The requested model/effort setting could not be changed from inside the active session; no claim is made that a tool switched it to `gpt-6-astra xhigh`.

The local server listens on `127.0.0.1:3075`. Its synthetic credentials are in the ignored, owner-readable `.env.local`; they are deliberately absent from this report. The task-created PostgreSQL container is `tianna-t051720cf-local`, bound to `127.0.0.1:55475`, database `tianna_ui_local`. It is separate from production. The server and this database remain running for review. To restart the existing built app, run `npm run start -- --hostname 127.0.0.1 --port 3075` from this checkout. The build used Node **26.3.1** and service-worker asset version **b97880054fb0**. [Source/build hashes](checks/build-provenance.json) and [served metadata](after/served-brand.json) bind the evidence to the delivered files.

Implementation and UI evidence are in local commit `daf76d9f1a70973fc95dc4de19fdc95b1cd28d13` on `task/t_051720cf`. A following documentation commit records the repository rename; `git log -2 --oneline` identifies both. Application files did not change during the rename follow-up, so the existing browser/build/database results remain applicable; those suites were not needlessly repeated. Edits pause at handoff for the requested supervisor cleanup and independent read-only Opus review. Neither review was run by this implementer, and no board completion action was performed.
