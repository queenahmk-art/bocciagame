# Design QA — Boccia court markings update

- Source visual truth: `/var/folders/yl/10m5mzz16lz_fv9kv8pr3qhh0000gn/T/codex-clipboard-8700e08f-3542-4144-a43b-f8d22f88dc1f.png`
- Implementation screenshot: `/private/tmp/boccia-penalty-box-final.png`
- Focused comparison: `/private/tmp/boccia-penalty-box-comparison.png`
- Mobile evidence: `/private/tmp/boccia-penalty-box-mobile-390.png`
- Comparison viewport: 1265 × 712 browser viewport; focused court regions normalized to 820 px high
- State: End 1, player preparing to throw the Jack

## Full-view comparison evidence

The rendered game keeps its existing scoreboard, court scale and controls while matching the reference court's defining geometry: six equal throwing boxes below the throwing line, a symmetric V-shaped Jack line, and the central square penalty box divided into four equal quadrants. The invalid Jack region is lightly shaded as an intentional in-game affordance.

## Focused region comparison evidence

The side-by-side normalized court crop shows that both V arms meet at the horizontal centre, all six throwing boxes have equal widths, and the penalty box is centred horizontally in the upper playing area with the same outer-square and internal-cross construction as the reference. A focused comparison was necessary because the source is a dimensioned court diagram while the implementation is embedded inside the complete game UI.

## Required fidelity surfaces

- Fonts and typography: Existing game typography is preserved. Canvas labels use system UI text at the established small court-label scale; throwing-box numerals remain legible and centred. The penalty box contains no unnecessary text.
- Spacing and layout rhythm: Court aspect ratio and existing responsive placement are unchanged. V-line, throwing-box and penalty-box placement follow the reference. At a 390 px viewport the document remains within the available width with no horizontal overflow.
- Colors and visual tokens: Dark green court boundaries and the existing red throwing line remain consistent with the game. The warm neutral exclusion-zone fill is an intentional usability addition and has sufficient contrast without competing with balls.
- Image quality and asset fidelity: The source contains geometric court markings rather than raster assets. Canvas 2D is the correct rendering surface and continues to scale for device pixel ratio. The penalty square and its four quadrants remain crisp at desktop and mobile sizes.
- Copy and content: Traditional Chinese and English Canvas descriptions now mention the V line, six throwing boxes and central penalty box.

## Findings

No actionable P0, P1 or P2 visual differences remain within the requested scope.

## Comparison history

- Earlier P2: The first implementation placed the V-line explanation over the apex and aiming line, reducing legibility.
- Fix: Moved the explanation to the upper-left valid area above the side endpoint while keeping the V geometry unobstructed.
- Post-fix evidence: `/private/tmp/boccia-vline-final-top2.png` and `/private/tmp/boccia-vline-comparison.png`.
- Earlier P1: The first court implementation omitted the reference diagram's central 35 × 35 cm penalty square.
- Fix: Added a centred square with a clear outer boundary and horizontal/vertical dividers, preserving the existing central cross and game physics.
- Post-fix evidence: `/private/tmp/boccia-penalty-box-final.png` and `/private/tmp/boccia-penalty-box-comparison.png`.

## Interaction verification

- A low-power 34° Jack stopped short of the sloping boundary, displayed the bilingual invalid-Jack message and enabled a rethrow.
- A centred Jack at the same low power fully crossed the V line and advanced to the first coloured-ball turn.
- Automated tests cover penalty-box centring, centre-apex clearance, side-slope clearance, full-ball radius clearance, valid AI Jack targets and existing physics/game flow.
- Browser console showed no application errors during this pass.

## Open Questions

None. Measurement arrows, coaching benches and officials' furniture from the educational diagram are intentionally excluded from the playable court.

## Implementation checklist

- [x] Draw six equal throwing boxes.
- [x] Draw a symmetric V-shaped Jack line.
- [x] Draw the central four-quadrant penalty box.
- [x] Require the whole Jack to cross the local sloping boundary.
- [x] Constrain AI Jack targets to the valid V-line region.
- [x] Update bilingual copy and simplified rules.
- [x] Verify desktop, 390 px mobile, invalid rethrow and valid continuation.

## Follow-up polish

The small court labels could be hidden at extremely narrow embedded sizes if future compact-mode testing finds them visually dense.

final result: passed
