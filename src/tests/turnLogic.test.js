import { describe, expect, it } from 'vitest'
import { determineNextTurn } from '../game/turnLogic.js'

const jack = { x: 100, y: 100 }
const ball = (side, x, outOfBounds = false) => ({ side, x, y: 100, outOfBounds, kind: 'colour' })
const base = { jack, jackThrower: 'red', lastThrower: 'blue' }

describe('turn logic', () => {
  it('makes the Jack thrower play the first coloured ball', () => {
    expect(determineNextTurn({ ...base, balls: [], remaining: { red: 6, blue: 6 }, thrown: { red: 0, blue: 0 } }).side).toBe('red')
  })

  it('makes the opponent play the second coloured ball', () => {
    expect(determineNextTurn({ ...base, balls: [ball('red', 115)], remaining: { red: 5, blue: 6 }, thrown: { red: 1, blue: 0 } }).side).toBe('blue')
  })

  it('makes the farther side continue rather than alternating', () => {
    const result = determineNextTurn({ ...base, balls: [ball('red', 112), ball('blue', 140)], remaining: { red: 5, blue: 5 }, thrown: { red: 1, blue: 1 } })
    expect(result).toMatchObject({ side: 'blue', reason: 'fartherContinues' })
  })

  it('treats a side with no valid on-court ball as farther', () => {
    const result = determineNextTurn({ ...base, balls: [ball('red', 112), ball('blue', 140, true)], remaining: { red: 5, blue: 5 }, thrown: { red: 1, blue: 1 } })
    expect(result.side).toBe('blue')
  })

  it('switches to the other side when the farther side is out of balls', () => {
    const result = determineNextTurn({ ...base, balls: [ball('red', 112), ball('blue', 140)], remaining: { red: 3, blue: 0 }, thrown: { red: 3, blue: 6 } })
    expect(result).toMatchObject({ side: 'red', reason: 'otherSideFinishes' })
  })

  it('ends when both sides are out of balls', () => {
    expect(determineNextTurn({ ...base, balls: [], remaining: { red: 0, blue: 0 }, thrown: { red: 6, blue: 6 } })).toMatchObject({ side: null, endComplete: true })
  })

  it('uses the documented simplified tie rule: last thrower continues', () => {
    const result = determineNextTurn({ ...base, balls: [ball('red', 120), ball('blue', 80)], remaining: { red: 5, blue: 5 }, thrown: { red: 1, blue: 1 } })
    expect(result.side).toBe('blue')
  })
})
