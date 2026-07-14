import { describe, expect, it } from 'vitest'
import { COURT, DIFFICULTIES, PHYSICS } from '../game/constants.js'
import { chooseAIJack, chooseAIShot } from '../game/computerAI.js'
import { isValidJackPosition } from '../game/physics.js'

const sequence = (values) => { let index = 0; return () => values[index++ % values.length] }
const jack = { x: 180, y: 300 }

describe('computer AI', () => {
  it('always emits a valid direction and power', () => {
    for (const difficulty of Object.values(DIFFICULTIES)) {
      const shot = chooseAIShot({ difficulty, balls: [], jack, remaining: { blue: 6 } }, sequence([.1, .3, .8]))
      expect(shot.angle).toBeGreaterThanOrEqual(-34); expect(shot.angle).toBeLessThanOrEqual(34)
      expect(shot.power).toBeGreaterThanOrEqual(PHYSICS.minPower); expect(shot.power).toBeLessThanOrEqual(PHYSICS.maxPower)
    }
  })

  it('chooses varied valid Jack target zones', () => {
    const shots = [chooseAIJack(() => .05), chooseAIJack(() => .85)]
    expect(shots[0].target).not.toEqual(shots[1].target)
    for (const shot of shots) {
      expect(shot.target.x).toBeGreaterThan(0); expect(shot.target.x).toBeLessThan(COURT.width)
      expect(isValidJackPosition({ ...shot.target, radius: PHYSICS.jackRadius, outOfBounds: false })).toBe(true)
    }
  })

  it('uses a tactical hit when the player is leading', () => {
    const balls = [{ id: 'r', kind: 'colour', side: 'red', x: 185, y: 305, outOfBounds: false }]
    const shot = chooseAIShot({ difficulty: 'tactical', balls, jack, remaining: { blue: 4 } }, () => .1)
    expect(shot.strategy).toBe('hit')
  })

  it('Beginner and Tactical decisions differ', () => {
    const balls = [{ id: 'r', kind: 'colour', side: 'red', x: 185, y: 305, outOfBounds: false }]
    const beginner = chooseAIShot({ difficulty: 'beginner', balls, jack, remaining: { blue: 4 } }, () => .1)
    const tactical = chooseAIShot({ difficulty: 'tactical', balls, jack, remaining: { blue: 4 } }, () => .1)
    expect(beginner.strategy).toBe('draw'); expect(tactical.strategy).toBe('hit')
  })
})
