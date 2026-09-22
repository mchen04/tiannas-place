# Measured flow actions

Each independent flow starts where its label says. Counts are button/checkbox activations, with filled fields reported separately; typing keystrokes, scroll gestures, reloads, waits and resetting to Home between flows are excluded. No claim is made that a field entry needs only one physical keystroke or gesture. The same script exercised before and after builds with synthetic accounts. Full step lists are in the two `tap-counts.json` files.

| Journey | Before taps | After taps | Fields before / after |
|---|---:|---:|---:|
| Walk: complete from home | 1 | 1 | 0 / 0 |
| Walk: undo completion from home | 1 | 1 | 0 / 0 |
| Workout: complete from home | 1 | 1 | 0 / 0 |
| Workout: undo completion from home | 1 | 1 | 0 / 0 |
| Abs: complete from home | 1 | 1 | 0 / 0 |
| Abs: undo completion from home | 1 | 1 | 0 / 0 |
| Floss: complete from home | 1 | 1 | 0 / 0 |
| Floss: undo completion from home | 1 | 1 | 0 / 0 |
| Walk: log minutes from home | 2 | 2 | 1 / 1 |
| Walk: another timed walk from activity | 4 | 4 | 0 / 0 |
| Walk: remove one entry | 1 | 1 | 0 / 0 |
| Workout: edit plan and log from home | 6 | 6 | 1 / 1 |
| Abs: guided routine from home | 2 | 2 | 0 / 0 |
| Floss: complete from activity | 2 | 2 | 0 / 0 |
| Water: full container from home | 1 | 1 | 0 / 0 |
| Water: half container from home | 2 | 2 | 0 / 0 |
| Water: phrase and confirm | 2 | 2 | 1 / 1 |
| Water: undo last pour | 1 | 1 | 0 / 0 |
| Food: manual meal from home | 3 | 3 | 3 / 3 |
| Food: edit manual meal from home | 3 | 3 | 2 / 2 |
| Food: estimated meal from food page | 3 | 3 | 2 / 2 |
| Food: edit saved item | 2 | 2 | 2 / 2 |
| Food: remove meal | 1 | 1 | 0 / 0 |
| Rest: toggle from home | 1 | 1 | 0 / 0 |
| Meditate: default session from home | 2 | 2 | 0 / 0 |
| Focus: default work block from home | 3 | 3 | 0 / 0 |
| Treats: create and redeem from home | 5 | 5 | 2 / 2 |
| Treats: undo redemption | 1 | 1 | 0 / 0 |
| History: open month from home | 2 | 2 | 0 / 0 |

The review-polish rerun at source `7a13b76` preserves all 29 journey records in both engines, including taps, fields and steps. [Current comparison](review-polish/checks/acceptance-comparison.json). The intentionally removed chevrons do not merge the controls: the row body opens details and its independent checkbox/action logs or completes.
