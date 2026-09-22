# Tianna’s Place · design and baseline

Card t_051720cf, mbp-old, base 58e8e082d01a0b7e555a5b58bce98ab6fbefd0af. Sole implementer; no native goal or extra agents. No AGENTS.md found in checkout or parent directories. Prior PR2 commit 693ab929 is an ancestor. Existing checkout was clean.

## Sources consulted before design (2026-09-21)

- [Apple Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons): consistent controls, visible press feedback, at least 44 × 44 pt hit regions. Web target chosen: 44 CSS pixels, allowing standard calendar spacing at 320 CSS pixels.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/): keyboard, labels, visible focus, 24 CSS pixel minimum target size with spacing exceptions, 200% text resizing, reduced motion.
- [W3C Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html): one-direction reading at 320 CSS pixels, no clipped content. Avoid fixed layers that consume enlarged-text views.
- [W3C Contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): 4.5:1 ordinary text and 3:1 large text.
- [W3C Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html): focused controls remain visible, including around sticky content.
- [WebKit safe areas](https://webkit.org/blog/7929/designing-websites-for-iphone-x/): viewport-fit=cover and safe-area inset padding; emulation cannot establish physical-device correctness.

## Baseline

`before/published-gate.png`: fresh unauthenticated Chromium capture of the existing published origin. Account endpoints blocked; no production account reads or writes. The private homepage is represented by a local build of the same source revision using clearly synthetic fixtures. `before/phone/` captures all routes and sheets, normal and completion states, errors, timers, camera simulation, rest planning, settings and history. `before/flows-chromium/` demonstrates full journeys and records control tap counts separately from field entries. No physical iPhone testing performed.

Observed: preserve cream ground, rounded white cards, apricot/sage palette, rounded typography, hills, walking marker and time-of-day mood. On 390 × 844 the workout illustration consumes most of the first screen; walk start is below the fold. Body/status text uses 11–15px and several buttons are 32–36px. The 96px completion pill takes space from activity labels. Meal editing is functional but small controls make it dense.

Direction: retain the homepage composition, shorten its scenery without changing the walking animation, make all activity rows equally readable, keep direct completion and add actions. Compact non-human SVG companions replace workout/abs/rest humans, using the existing token palette. Activity controls should have stable placement and avoid large decorative blocks. Shared text sizes become relative, inputs at least 16px, primary touch targets at least 44px. Content wraps rather than truncates. Preserve every persisted key, schema, data format, route, timer, and logging action.

## Repository rename preflight

[GitHub rename guidance](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository) preserves repository and Git redirects, except Pages URLs and actions hosted at the old path. Do not reuse the old repository name. [Vercel Git integration](https://vercel.com/docs/git/vercel-for-github) is configured independently in project settings; [project rename](https://vercel.com/kb/guide/how-do-i-change-the-name-of-my-vercel-project) is separate and out of scope.

`repository-before.json` records repository ID 1362066274, admin access, public visibility, main history, no Pages, no repository hooks, and the successful Vercel Production deployment from 58e8e08. No workflow/action files or origin-derived auth/storage keys exist in this checkout. Production origin stays https://flaccid75.vercel.app. No Vercel credential or project link is available in this checkout; GitHub's user-installations API returns 403 for the current OAuth credential. The hosting GitHub App's repository connection/access cannot yet be verified, so the authorized rename is held pending that genuine unknown. No hosting changes, production data writes, pushes, PRs, merges, or deployments.
