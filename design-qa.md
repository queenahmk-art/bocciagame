# Design QA — circular aiming and mobile throw controls

- Source visual truth: `/var/folders/yl/10m5mzz16lz_fv9kv8pr3qhh0000gn/T/TemporaryItems/NSIRD_screencaptureui_orTPoS/Screenshot 2026-07-16 at 12.40.00 AM.png`
- Mobile implementation screenshot: `/private/tmp/boccia-mobile-aim-final.png`
- Desktop implementation screenshot: `/private/tmp/boccia-desktop-aim-final.png`
- Focused comparison: `/private/tmp/boccia-mobile-aim-comparison.png`
- Primary viewport: 390 × 844
- Secondary viewport: 1280 × 800
- State: End 1, immediately after an invalid first Jack is handed to the other colour

## Full-view comparison evidence

The source shows the previous tall control card with separate direction and power sliders. The mobile implementation intentionally replaces the direction slider with a compact circular direction pad, retains the power slider, and keeps the Throw Jack button inside a fixed bottom control dock. The court remains visible behind the dock and the primary action stays within the 844 px viewport without requiring the user to drag the page downward.

At 390 × 844 the page has no horizontal overflow. The dock occupies y=670.5–836.8, the Throw button is 46 px high at y=779.4–825.4, and the safe-area-aware bottom spacing remains inside the viewport. At 1280 × 800 the same controls return to the existing 290 px desktop column and do not use fixed positioning.

## Focused comparison evidence

The normalized side-by-side comparison shows the old slider-based control on the left and the new mobile dock on the right. The Jack/turn heading, 52 power value, low–medium–high labels, gold control token and gold primary action remain recognizable. The requested interaction change is clear: the direction rail and verbose help are replaced by a circular J-ball direction pad, while the retained power control and Throw Jack action are compressed into the adjacent thumb-reach column.

## Required fidelity surfaces

- Fonts and typography: The existing system/serif hierarchy, weights and Traditional Chinese copy remain consistent. Mobile labels are reduced without truncation; the primary action remains readable at 0.96 rem.
- Spacing and layout rhythm: The desktop column preserves the established card spacing. Mobile uses a two-column 94 px / flexible grid and safe-area-aware fixed positioning. No persistent control or text is clipped at 390 × 844.
- Colors and visual tokens: Existing ink, paper, muted, red and gold tokens are reused. The circular control uses the same Jack/red-ball semantics and focus styling as the rest of the game.
- Image quality and asset fidelity: This change contains no missing raster imagery, logo or illustration asset. The circular direction pad is a functional form control, and the Canvas court continues to render at device pixel ratio.
- Copy and content: Bilingual help, tutorial copy, Canvas description and README now describe the circular direction control rather than a court target or direction slider.

## Findings

No actionable P0, P1 or P2 visual or responsive findings remain within the requested scope.

## Comparison history

- Earlier P1: On mobile, the direction slider duplicated court aiming and the Throw action sat below the tall court/status sequence, making it difficult to reach while playing.
- Fix: Removed court pointer aiming and the direction range input; added a pointer/keyboard circular direction pad and a fixed, safe-area-aware mobile control dock.
- Post-fix evidence: `/private/tmp/boccia-mobile-aim-final.png` and `/private/tmp/boccia-mobile-aim-comparison.png`.
- Earlier P1: The Canvas used `touch-action: none`, so gestures started on the largest mobile surface could not participate in normal vertical page movement.
- Fix: Moved all pointer aiming into the circular control and changed the court Canvas to `touch-action: pan-y`.
- Post-fix evidence: computed mobile style reports `pan-y`; the dock remains fixed at the bottom with no horizontal overflow.

## Interaction verification

- Tapping the right side of the circular pad changed the direction from 0° to 28° and immediately rotated the in-court aiming line.
- The Throw Jack button launched the Jack and disabled controls during movement; an invalid first attempt now hands the Jack throw to the other colour.
- The circular control exposes slider semantics, values and Left/Right/Home/End keyboard behavior; the power input remains a native range control.
- Automated tests cover straight, left, right, clamped and keyboard direction calculations, the invalid-Jack handoff, replacement of an out-of-bounds Jack, required player-name flow, result rendering, and the 100/200-point leaderboard rules. All 42 tests pass.
- Browser console contained no warnings or errors.

## Open questions

None. The fixed dock intentionally overlaps only the lower throwing-box edge so the direction, power and primary action remain usable without scrolling; page bottom padding keeps later restart/rules content reachable.

## Implementation checklist

- [x] Remove the direction range input and on-court pointer target control.
- [x] Add a circular finger/mouse direction pad with keyboard support.
- [x] Retain the power slider and existing launch physics.
- [x] Keep mobile throw controls within thumb reach above the safe area.
- [x] Allow vertical gestures on the court Canvas.
- [x] Update bilingual copy, tutorial and README.
- [x] Verify 390 × 844 and 1280 × 800 layouts, launch flow and console.

## Follow-up polish

None required for this scope.

final result: passed
