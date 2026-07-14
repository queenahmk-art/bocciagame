import { describe, expect, it } from 'vitest'
import { closestBall, scoreEnd } from '../game/scoring.js'

const jack = { x: 100, y: 100 }
const ball = (side, x, y = 100, outOfBounds = false) => ({ side, x, y, outOfBounds, kind: 'colour' })

describe('scoring', () => {
  it('finds the nearest valid ball and ignores out-of-bounds balls', () => {
    const closest = closestBall([ball('red', 102, 100, true), ball('red', 118)], jack, 'red')
    expect(closest.distance).toBe(18)
  })

  it('awards one point for one scoring ball', () => {
    expect(scoreEnd([ball('red', 110), ball('blue', 120)], jack)).toMatchObject({ red: 1, blue: 0, points: 1 })
  })

  it('awards one point for every ball inside the opponent nearest distance', () => {
    const result = scoreEnd([ball('red', 120), ball('red', 128), ball('red', 160), ball('blue', 135), ball('blue', 150)], jack)
    expect(result).toMatchObject({ side: 'red', red: 2, points: 2 })
  })

  it('scores an exact nearest-distance tie as zero', () => {
    expect(scoreEnd([ball('red', 120), ball('blue', 80)], jack)).toMatchObject({ side: null, points: 0, reason: 'tie' })
  })
})
