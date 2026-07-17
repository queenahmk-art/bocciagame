import BocciaLeaderboard from './BocciaLeaderboard.jsx'
import { pointsPerBall } from './leaderboard.js'

export default function BocciaResults({ state, leaderboard, t, onAgain, onHome, onDifficulty }) {
  const message = state.total.red > state.total.blue ? t('playerWins') : state.total.blue > state.total.red ? t('aiWins') : t('draw')
  const winner = state.total.red > state.total.blue ? state.playerName : state.total.blue > state.total.red ? t('computer') : t('tied')
  const multiplier = pointsPerBall(state.difficulty)
  return (
    <section className="results-panel" aria-labelledby="results-title">
      <div className="results-layout">
        <div className="result-summary">
          <p className="eyebrow">{t('matchComplete')}</p><h2 id="results-title">{t('results')}</h2>
          <div className="final-score"><span>{state.total.red}</span><i>—</i><span>{state.total.blue}</span></div>
          <p className="winner"><strong>{t('winner')}: {winner}</strong><br />{message}</p>
          <div className="ranking-score-card"><span>{state.playerName}</span><small>{t('rankingPoints')}</small><strong>{state.rankingScore.toLocaleString()}</strong><p>{t('scoreFormula', { balls: state.total.red, multiplier })}</p></div>
          <h3>{t('endScores')}</h3>
          <div className="end-score-grid">{state.endScores.map((score) => <div key={score.end}><span>{t('end', { current: score.end })}</span><strong>{score.red} — {score.blue}</strong></div>)}</div>
        </div>
        <BocciaLeaderboard entries={leaderboard} t={t} currentEntryId={state.leaderboardEntryId} />
      </div>
      <div className="result-actions"><button className="primary" onClick={onAgain}>{t('playAgain')}</button><button onClick={onDifficulty}>{t('switchDifficulty')}</button><button onClick={onHome}>{t('home')}</button></div>
    </section>
  )
}
