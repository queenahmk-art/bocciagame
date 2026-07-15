import { describe, expect, it } from 'vitest'
import { COURT, PHYSICS } from '../game/constants.js'
import { applyFriction, areAllBallsStopped, checkOutOfBounds, getJackVLineY, isValidJackPosition, placeJackAtCentre, resolveAllCollisions, stepPhysics } from '../game/physics.js'

const moving = (overrides = {}) => ({ x: 100, y: 100, vx: 200, vy: 0, radius: PHYSICS.ballRadius, outOfBounds: false, ...overrides })

describe('physics', () => {
  it('places a four-quadrant penalty box on the court centre', () => {
    expect(COURT.penaltyBox).toMatchObject({ centreX: COURT.centre.x, centreY: COURT.centre.y })
    expect(COURT.penaltyBox.size).toBeGreaterThan(0)
  })

  it('accepts only a whole Jack beyond the centre apex of the V line', () => {
    const slope = (COURT.jackVLine.apexY - COURT.jackVLine.sideY) / (COURT.jackVLine.apexX - COURT.jackVLine.leftX)
    const clearance = PHYSICS.jackRadius * Math.sqrt(1 + slope ** 2)
    expect(isValidJackPosition(moving({ x: COURT.centre.x, y: COURT.jackVLine.apexY - clearance - 1, radius: PHYSICS.jackRadius, vx: 0 }))).toBe(true)
    expect(isValidJackPosition(moving({ x: COURT.centre.x, y: COURT.jackVLine.apexY - clearance + 1, radius: PHYSICS.jackRadius, vx: 0 }))).toBe(false)
  })

  it('uses the sloping V boundary at the Jack horizontal position', () => {
    const x = COURT.jackVLine.leftX + 35
    const boundary = getJackVLineY(x)
    expect(boundary).toBeLessThan(COURT.jackVLine.apexY)
    expect(isValidJackPosition(moving({ x, y: boundary - 20, radius: PHYSICS.jackRadius, vx: 0 }))).toBe(true)
    expect(isValidJackPosition(moving({ x, y: boundary - 5, radius: PHYSICS.jackRadius, vx: 0 }))).toBe(false)
  })

  it('uses the visible playing lines and the whole ball for out-of-bounds checks', () => {
    expect(checkOutOfBounds(moving({ x: COURT.inset + PHYSICS.ballRadius + 1 }))).toBe(false)
    expect(checkOutOfBounds(moving({ x: COURT.inset + PHYSICS.ballRadius }))).toBe(true)
    expect(checkOutOfBounds(moving({ y: COURT.top + PHYSICS.ballRadius - 1 }))).toBe(true)
    expect(checkOutOfBounds(moving({ y: COURT.bottom - PHYSICS.ballRadius + 1 }))).toBe(true)
    expect(isValidJackPosition(moving({ x: -20, radius: PHYSICS.jackRadius, vx: 0 }))).toBe(false)
  })

  it('returns an out-of-bounds Jack to the penalty-box cross', () => {
    const replaced = placeJackAtCentre(moving({ kind: 'jack', radius: PHYSICS.jackRadius, x: 120, y: 0, vx: 80, vy: -40, outOfBounds: true }))
    expect(replaced).toMatchObject({ x: COURT.penaltyBox.centreX, y: COURT.penaltyBox.centreY, vx: 0, vy: 0, outOfBounds: false })
  })

  it('friction reduces speed and clamps low speed to zero', () => {
    expect(applyFriction(moving(), .1).vx).toBeLessThan(200)
    const stopped = applyFriction(moving({ vx: PHYSICS.stopSpeed + 1 }), .1)
    expect(stopped.vx).toBe(0)
    expect(areAllBallsStopped([stopped])).toBe(true)
  })

  it('separates colliding balls and transfers velocity', () => {
    const [a, b] = resolveAllCollisions([moving({ x: 100, vx: 100 }), moving({ x: 115, vx: 0 })])
    expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeGreaterThanOrEqual(PHYSICS.ballRadius * 2 - .01)
    expect(b.vx).toBeGreaterThan(0)
  })

  it('does not leave a cluster permanently overlapped', () => {
    let balls = [moving({ x: 100, vx: 0 }), moving({ x: 104, vx: 0 }), moving({ x: 108, vx: 0 })]
    for (let i = 0; i < 5; i += 1) balls = resolveAllCollisions(balls)
    for (let i = 0; i < balls.length; i += 1) for (let j = i + 1; j < balls.length; j += 1) {
      expect(Math.hypot(balls[j].x - balls[i].x, balls[j].y - balls[i].y)).toBeGreaterThanOrEqual(PHYSICS.ballRadius * 2 - .2)
    }
  })

  it('sub-steps fast movement and still settles under reduced-motion-sized frames', () => {
    let balls = [moving({ vx: 500 })]
    for (let i = 0; i < 180; i += 1) balls = stepPhysics(balls, .05)
    expect(areAllBallsStopped(balls)).toBe(true)
  })
})
