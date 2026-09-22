# Cleanup gate

Run ID: 2f788e10598544fa807608bfc1717dcf
Status: helper pass complete; coordinator gate FAILED
Scope: the diff against 58e8e082d01a0b7e555a5b58bce98ab6fbefd0af. No unrelated code touched.

Supervisor-reported coordinator outcome: all planned pre/post checks passed, but the gate failed because the build refreshed tracked `public/sw.js` after the cleanup commit; the baseline build also refreshed generated artifacts. The helper report alone is not a passed gate. The implementer is preserving the cleanup code, correcting generated/evidence artifacts, and returning for a bounded coordinator rerun with non-mutating checks and independent review. [Follow-up proof](evidence/tiannas-place/post-cleanup/PROOF.md).

## Passes

One pass of one planned, completed: deslop, simplification, conservative test pruning and stale-doc repair.

## Rebase

Not needed. The coordinator checked ancestry before this pass.

## Removed

- Three `<span className="row-chevron">` elements (`components/shared.tsx`, `components/Home.tsx`). The branch added `.row-chevron{display:none}`, so the markup never rendered.
- The `.row-chevron` base rule and its `display:none` override, dead once the markup is gone.
- Two appended CSS declarations repeating their base rule verbatim: `font-size:var(--t-md)` on `input,select,textarea` and `font-size:var(--t-dial)` on `.dial-time`. Kept `min-width:0`, which the base rule does not set.
- Kept deliberately: seven size tokens the branch orphaned (`--z-scene`, `--z-dial`, `--z-heroMax`, `--z-liftRise`, `--z-tileArt`, `--z-ctaMin`, `--z-thumb`). The base commit already carries nine unused ones, `npm run scan` finds nothing, and removal means editing generated `app/tokens.css`.

## Tests deleted

None. No test in the diff was unable to fail. One assertion was repaired, not deleted: `tests/e2e/app.spec.ts:30` asserted `getByRole('heading',{name:'Tianna’s Place'})` at the celebration, but the branch moved the headline off the title, so that name matched the topbar in every completion state and the assertion could not fail. It now asserts the topbar accessible name `Tianna’s Place. Every one.`, the state the original `All done.` assertion covered.

## Docs updated

- `components/Scenes.tsx`: a diff-relative comment ("The walk art above is unchanged") replaced by the scene-canvas convention it had removed, covering both the compact 360x160 band and the taller canvas `Tooth` still uses.
- `scripts/tianna-capture.mjs`: the usage line named `scripts/ui-shots.mjs`.
- `README.md`: "The current changes retain ..." restated as the app's state.

## Verified

- `npm run scan`: exit 0, `{"scanned":35,"findings":0}` and `{"scanned":136,"hits":0}`. That run refreshed the committed `evidence/v3/*.json` artifacts for the branch's new files.
- esbuild parses every edited TS/TSX file: `shared.tsx`, `Home.tsx`, `Scenes.tsx`, `app.spec.ts`.
- By reading: `Icon` stays used in both edited components; no `row-chevron` reference remains.
- Not verified: no browser or Playwright run, so the CSS edits are argued from the cascade, not observed. Both removed declarations exactly repeat an earlier rule with no intervening conflict.

## Checks

Bounded plan, six per side: `npm ci --ignore-scripts`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run scan`.

Coordinator prechecks ran synchronously before this pass; receipts in `cleanup-evidence-r2/`. Raw exit codes, base worktree then current: install 0/0, lint 0/0, typecheck 0/0, unit 0/0, build 0/0, scan 0/0. Raw green both sides, not a diagnostic delta. No historical diagnostic was waived; nothing here claims the wider repository green beyond these six.

At helper-report time, postchecks had not run. The supervisor subsequently confirmed green install/unit/lint/build/type/scan postchecks and the failed clean-worktree gate described above. This helper pass started no lint, typecheck or full-suite job of its own.

## Commits

- `cead42f` cleanup: drop dead chevron markup, duplicate CSS and stale comments
- `2701886` docs: add cleanup gate report — the original helper report.

## Reverted

none
