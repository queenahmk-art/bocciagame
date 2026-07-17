import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import BocciaResults from '../game/BocciaResults.jsx'
import { calculateLeaderboardScore, createLeaderboardEntry, LEADERBOARD_STORAGE_KEY, normalizePlayerName, pointsPerBall, rankLeaderboard, readLeaderboard, recordLeaderboardEntry } from '../game/leaderboard.js'
import { translate } from '../i18n/translations.js'

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial))
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
}

const entry = (overrides = {}) => createLeaderboardEntry({
  id: 'one', playerName: 'Ada', difficulty: 'beginner', ballsScored: 3, completedAt: '2026-07-17T00:00:00.000Z', ...overrides,
})

describe('leaderboard scoring and persistence', () => {
  it('awards 100 points per beginner ball and 200 per advanced ball', () => {
    expect(pointsPerBall('beginner')).toBe(100)
    expect(pointsPerBall('tactical')).toBe(200)
    expect(calculateLeaderboardScore(4, 'beginner')).toBe(400)
    expect(calculateLeaderboardScore(4, 'tactical')).toBe(800)
  })

  it('normalizes and limits player names', () => {
    expect(normalizePlayerName('  Ada   Wong  ')).toBe('Ada Wong')
    expect(normalizePlayerName('x'.repeat(40))).toHaveLength(24)
  })

  it('ranks higher points first', () => {
    const ranked = rankLeaderboard([
      entry({ id: 'low', playerName: 'Low', ballsScored: 5 }),
      entry({ id: 'high', playerName: 'High', difficulty: 'tactical', ballsScored: 3 }),
    ])
    expect(ranked.map(({ id }) => id)).toEqual(['high', 'low'])
  })

  it('records and reloads completed match entries', () => {
    const storage = memoryStorage()
    recordLeaderboardEntry(entry(), storage)
    expect(JSON.parse(storage.getItem(LEADERBOARD_STORAGE_KEY))).toHaveLength(1)
    expect(readLeaderboard(storage)[0]).toMatchObject({ playerName: 'Ada', score: 300 })
  })

  it('ignores malformed saved data', () => {
    expect(readLeaderboard(memoryStorage({ [LEADERBOARD_STORAGE_KEY]: '{broken' }))).toEqual([])
  })

  it('shows the player name, advanced score formula and leaderboard on results', () => {
    const completed = entry({ id: 'result', playerName: '測試玩家', difficulty: 'tactical', ballsScored: 4 })
    const markup = renderToStaticMarkup(React.createElement(BocciaResults, {
      state: {
        playerName: '測試玩家', difficulty: 'tactical', total: { red: 4, blue: 2 }, rankingScore: 800,
        leaderboardEntryId: 'result', endScores: [1, 2, 3, 4].map((end) => ({ end, red: 1, blue: end === 1 ? 2 : 0 })),
      },
      leaderboard: [completed], t: (key, variables) => translate('zh-Hant-HK', key, variables),
      onAgain: () => {}, onHome: () => {}, onDifficulty: () => {},
    }))
    expect(markup).toContain('測試玩家')
    expect(markup).toContain('4 個得分球 × 200 分')
    expect(markup).toContain('排行榜')
    expect(markup).toContain('800')
  })
})
