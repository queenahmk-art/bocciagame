import { describe, expect, it } from 'vitest'
import { appendEndScore, canLaunchShot, createInitialGame, gameReducer, isFinalEnd } from '../game/gameReducer.js'

describe('match flow', () => {
  it('recognises the fourth end as match completion', () => {
    expect(isFinalEnd(3)).toBe(false); expect(isFinalEnd(4)).toBe(true)
  })

  it('accumulates the total and keeps every end score', () => {
    let state = { ...createInitialGame(), total: { red: 0, blue: 0 }, endScores: [], end: 1 }
    for (let end = 1; end <= 4; end += 1) {
      state = { ...state, end, ...appendEndScore(state, { red: end % 2, blue: (end + 1) % 2 }) }
    }
    expect(state.total).toEqual({ red: 2, blue: 2 }); expect(state.endScores).toHaveLength(4)
  })

  it('restart clears play data but preserves language and difficulty', () => {
    const dirty = { ...createInitialGame({ language: 'en-HK', difficulty: 'tactical' }), screen: 'game', total: { red: 5, blue: 2 }, balls: [{}] }
    const reset = gameReducer(dirty, { type: 'RESTART' })
    expect(reset.total).toEqual({ red: 0, blue: 0 }); expect(reset.balls).toEqual([])
    expect(reset.language).toBe('en-HK'); expect(reset.difficulty).toBe('tactical')
  })

  it('prevents duplicate throws while busy or while AI is thinking', () => {
    const ready = { ...createInitialGame(), screen: 'game' }
    expect(canLaunchShot(ready)).toBe(true)
    expect(canLaunchShot({ ...ready, busy: true })).toBe(false)
    expect(canLaunchShot({ ...ready, aiThinking: true })).toBe(false)
  })

  it('changes language without resetting the active game', () => {
    const active = { ...createInitialGame(), screen: 'game', end: 3, balls: [{ id: 1 }] }
    const changed = gameReducer(active, { type: 'PATCH', payload: { language: 'en-HK' } })
    expect(changed).toMatchObject({ language: 'en-HK', end: 3, balls: [{ id: 1 }] })
  })
})
