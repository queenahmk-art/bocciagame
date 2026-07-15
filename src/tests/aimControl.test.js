import { describe, expect, it } from 'vitest'
import { angleFromAimPad, nudgeAimAngle } from '../game/aimControl.js'

const rect = { left: 0, top: 0, width: 100, height: 100 }

describe('circular direction control', () => {
  it('aims straight when dragged above the centre pivot', () => {
    expect(angleFromAimPad(50, 10, rect)).toBeCloseTo(0)
  })

  it('maps left and right drags to bounded shot angles', () => {
    expect(angleFromAimPad(0, 10, rect)).toBeLessThan(0)
    expect(angleFromAimPad(100, 10, rect)).toBeGreaterThan(0)
    expect(angleFromAimPad(100, 90, rect)).toBe(34)
  })

  it('keeps keyboard adjustments within the playable range', () => {
    expect(nudgeAimAngle(-34, -1)).toBe(-34)
    expect(nudgeAimAngle(34, 1)).toBe(34)
    expect(nudgeAimAngle(0, 1)).toBe(1)
  })
})
