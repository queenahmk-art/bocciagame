import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import BocciaResults from '../game/BocciaResults.jsx'
import { calculateGamePoints, pointsPerBall } from '../game/gamePoints.js'
import { translate } from '../i18n/translations.js'

describe('difficulty game points', () => {
  it('awards 100 points per beginner ball and 200 per advanced ball', () => {
    expect(pointsPerBall('beginner')).toBe(100)
    expect(pointsPerBall('tactical')).toBe(200)
    expect(calculateGamePoints(4, 'beginner')).toBe(400)
    expect(calculateGamePoints(4, 'tactical')).toBe(800)
  })

  it('clamps invalid scoring-ball counts', () => {
    expect(calculateGamePoints(-2, 'beginner')).toBe(0)
    expect(calculateGamePoints(2.9, 'tactical')).toBe(400)
  })

  it('shows the advanced score formula without a leaderboard or player name', () => {
    const markup = renderToStaticMarkup(React.createElement(BocciaResults, {
      state: {
        difficulty: 'tactical', total: { red: 4, blue: 2 }, gamePoints: 800,
        endScores: [1, 2, 3, 4].map((end) => ({ end, red: 1, blue: end === 1 ? 2 : 0 })),
      },
      t: (key, variables) => translate('zh-Hant-HK', key, variables),
      onAgain: () => {}, onHome: () => {}, onDifficulty: () => {},
    }))
    expect(markup).toContain('遊戲積分')
    expect(markup).toContain('4 個得分球 × 200 分')
    expect(markup).toContain('800')
    expect(markup).not.toContain('排行榜')
  })
})
