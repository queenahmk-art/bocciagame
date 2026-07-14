export const COURT = Object.freeze({
  width: 360,
  height: 720,
  inset: 17,
  top: 16,
  bottom: 704,
  // The reference court is 12.5 m long with a 2.5 m throwing area.
  throwLine: 566,
  jackVLine: Object.freeze({
    leftX: 17,
    rightX: 343,
    sideY: 401,
    apexX: 180,
    apexY: 484,
  }),
  centre: { x: 180, y: 325 },
  penaltyBox: Object.freeze({
    centreX: 180,
    centreY: 325,
    size: 32,
  }),
})

export const PHYSICS = Object.freeze({
  ballRadius: 12,
  jackRadius: 9,
  friction: 190,
  restitution: 0.72,
  stopSpeed: 7,
  minPower: 18,
  maxPower: 100,
  minimumLaunchSpeed: 260,
  maximumLaunchSpeed: 690,
  fixedStep: 1 / 120,
})

export const TOTAL_ENDS = 4
export const BALLS_PER_SIDE = 6
export const SIDES = Object.freeze({ RED: 'red', BLUE: 'blue' })
export const DIFFICULTIES = Object.freeze({ BEGINNER: 'beginner', TACTICAL: 'tactical' })

export function launchSpeed(power) {
  const bounded = Math.min(PHYSICS.maxPower, Math.max(PHYSICS.minPower, power))
  const ratio = (bounded - PHYSICS.minPower) / (PHYSICS.maxPower - PHYSICS.minPower)
  return PHYSICS.minimumLaunchSpeed + ratio * (PHYSICS.maximumLaunchSpeed - PHYSICS.minimumLaunchSpeed)
}

export function powerForDistance(distance) {
  const speed = Math.sqrt(Math.max(0, 2 * PHYSICS.friction * distance))
  const ratio = (speed - PHYSICS.minimumLaunchSpeed) / (PHYSICS.maximumLaunchSpeed - PHYSICS.minimumLaunchSpeed)
  return Math.min(PHYSICS.maxPower, Math.max(PHYSICS.minPower, PHYSICS.minPower + ratio * (PHYSICS.maxPower - PHYSICS.minPower)))
}
