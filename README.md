# Boccia Strategy Challenge / 硬地滾球策略挑戰

Repository: `queenahmk-art/bocciagame`

Public game / 公開試玩：https://queenahmk-art.github.io/bocciagame/

A browser-based, four-end Boccia singles game. The player controls the red side and plays against a blue computer opponent. It is designed as a friendly introduction to direction, power, turn order and simple tactics—not as an official rules, refereeing or competition-scoring tool.

## Technology

- React with Vite, using JavaScript
- Canvas 2D for the court, balls, aiming line and animation
- A small custom fixed-step physics engine (no game/physics framework)
- `useReducer` for match state and refs for high-frequency simulation state
- Vitest for deterministic unit and flow tests
- Scoped responsive CSS under `.boccia-game-app`

Runtime dependencies are limited to React. Vite and its React plugin provide the build toolchain; Vitest provides tests. No database, backend, external AI service, tracking, imagery or proprietary assets are used.

## Install and run

Requires a current Node.js LTS release.

```bash
npm install
npm run dev
```

Vite prints the local development URL, normally `http://localhost:5173/`.

Production build and local preview:

```bash
npm run build
npm run preview
```

The preview URL is normally `http://localhost:4173/`.

Pushes to `main` are tested, built with the correct repository base path and published automatically by `.github/workflows/deploy-pages.yml`.

Tests:

```bash
npm run test
npm run test:watch
```

## Controls

- Mouse/touch: drag the ball inside the circular direction control, adjust the power slider, then choose Throw.
- Keyboard: focus the circular direction control and use Left/Right (or Home/End); use the power slider with arrow keys; Enter or Space activates the focused Throw button.
- On screens up to 700 px wide, the compact direction, power and Throw controls stay fixed above the safe-area inset so the primary action remains within thumb reach while viewing the court.
- Ball labels `R`, `B` and `J` ensure the game does not rely only on colour.
- A polite live region announces meaningful changes only: turns, settled/out balls, scores, new ends and match completion.
- `prefers-reduced-motion` shortens non-essential delays and accelerates the simulation while preserving the result.

## Simplified match rules

The match contains four ends. Red throws the Jack in ends 1 and 3; blue throws it in ends 2 and 4. The Jack-throwing side plays the first coloured ball, and the opponent plays the second. From then on, the side whose nearest valid ball is farther from the Jack continues throwing. This is deliberately not fixed alternation.

If one side has no valid on-court ball, it is treated as farther away. If that side has no balls remaining, the other side completes its balls. In the exact-distance simplified tie case, the side that just threw continues. This consistent tie treatment is implemented in `src/game/turnLogic.js` and tested.

After all 12 coloured balls are used, the closer side scores one point for every valid ball closer to the Jack than the opponent's nearest valid ball. Exact nearest-distance ties score zero. A ball is out as soon as any part reaches a visible court boundary line; the canvas padding outside those lines is not part of the playing area. Out-of-bounds coloured balls remain in match data but do not collide, render or score.

A Jack must stop entirely inside the valid playing area beyond the V-shaped Jack line; the whole ball must cross the sloping boundary at its horizontal position. If the first Jack is invalid, the other colour takes over the Jack throw and becomes the opening side. If both colours make an invalid Jack attempt, this simplified version places the Jack on the centre cross and the second side plays the first coloured ball. AI Jack targets are selected from several valid zones beyond the V line. If the Jack is knocked out during play, it is returned to the centre cross.

## Physics and rendering

Logical court coordinates are 360 × 720 and remain independent of display size. Canvas is scaled for device pixel ratio. The engine applies a direction vector, launch speed, linear rolling friction, stop threshold, restitution-based circle collision response, repeated overlap separation, sub-steps for fast balls, boundary detection and a final all-balls-stopped check. Low speed is clamped directly to zero to prevent endless vibration.

The court also includes the six throwing boxes, V-shaped Jack line and the central four-quadrant penalty box shown in the court reference. The animation uses `requestAnimationFrame`, pauses while the page is hidden, resumes with a fresh timestamp, and cleans up frames and listeners. Moving positions are held in a ref, so React is updated only when a shot starts or settles.

## Computer difficulty

- **Beginner** mainly draws toward the Jack with larger direction and power variation. It occasionally finishes short or long and does not analyse complex collisions.
- **Tactical** examines the current leader, nearest red/blue balls and balls remaining. It chooses among Draw, Hit, Block and Promote targets with smaller execution variation.

The AI is deterministic game logic with bounded direction and power; it does not use machine learning or an external API. Its visible planning pause is 600–1200 ms unless reduced motion is requested.

## Embedding API

The default export from `src/App.jsx` passes these optional props to the root game:

| Prop | Purpose |
| --- | --- |
| `initialLanguage` | `zh-Hant-HK` (default) or `en-HK` |
| `initialDifficulty` | `beginner` (default) or `tactical` |
| `compactMode` | Applies the compact embedding class and enables an exit affordance |
| `onExit` | Host callback for leaving an embedded game |
| `rulesUrl` | Optional host-provided applicable-rules link |
| `contactUrl` | Optional host-provided contact link |

The game does not require a router, iframe, fixed full-page overlay, formal website header/footer or hard-coded production URL. A host React project can lazy-load the component.

## Known limitations

- Court dimensions and several rules are intentionally simplified for learning and playability.
- Collision response assumes equal mass and does not model spin, ball deformation, surface variations or referee procedures.
- AI plans a bounded target and can reason about direct hits/blocks, but it does not run a full multi-collision trajectory search.
- Generated oscillator feedback is intentionally minimal; no recorded audio is bundled.
- Browser and assistive-technology combinations should receive final acceptance testing before public integration.

## Future hkboccia.com.hk integration

After independent acceptance testing, consume the root component from the website using a lazy-loaded route or section, pass host-owned rules/contact URLs, and map `onExit` to the host navigation. Keep website chrome, analytics, canonical metadata, sitemap and deployment configuration in the website repository. Do not copy those concerns into this game package. Before release, run real-device touch testing, screen-reader testing, performance profiling and a rules/content review against the latest applicable documents.

> This game uses simplified rules to introduce the basic concepts of Boccia. Official competitions follow the latest applicable rules.
