import { describe, expect, it } from 'vitest'
import { appendEndScore, canLaunchShot, createInitialGame, gameReducer, isFinalEnd, resolveInvalidJackTurn } from '../game/gameReducer.js'

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
    const dirty = { ...createInitialGame({ language: 'en-HK', difficulty: 'tactical', playerName: 'Ada' }), screen: 'game', total: { red: 5, blue: 2 }, balls: [{}] }
    const reset = gameReducer(dirty, { type: 'RESTART' })
    expect(reset.total).toEqual({ red: 0, blue: 0 }); expect(reset.balls).toEqual([])
    expect(reset.language).toBe('en-HK'); expect(reset.difficulty).toBe('tactical')
    expect(reset.playerName).toBe('Ada')
  })

  it('requires the submitted player name to be carried into a new game', () => {
    const started = gameReducer(createInitialGame({ playerName: '  draft  ' }), { type: 'START', payload: { playerName: 'Draft' } })
    expect(started).toMatchObject({ screen: 'game', playerName: 'Draft', tutorialOpen: false })
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

  it('hands the first invalid Jack to the other colour', () => {
    expect(resolveInvalidJackTurn('red', 0)).toEqual({ action: 'handoff', side: 'blue', jackAttempts: 1 })
    expect(resolveInvalidJackTurn('blue', 0)).toEqual({ action: 'handoff', side: 'red', jackAttempts: 1 })
  })

  it('places the Jack after both colours have made an invalid attempt', () => {
    expect(resolveInvalidJackTurn('blue', 1)).toEqual({ action: 'place', side: 'blue', jackAttempts: 2 })
  })

  it('resets Jack attempts at the start of every end', () => {
    const next = gameReducer({ ...createInitialGame(), jackAttempts: 2, end: 1 }, { type: 'NEXT_END' })
    expect(next).toMatchObject({ end: 2, jackThrower: 'blue', turn: 'blue', jackAttempts: 0 })
  })
})
