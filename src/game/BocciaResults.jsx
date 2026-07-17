import { pointsPerBall } from './gamePoints.js'

export default function BocciaResults({ state, t, onAgain, onHome, onDifficulty }) {
  const message = state.total.red > state.total.blue ? t('playerWins') : state.total.blue > state.total.red ? t('aiWins') : t('draw')
  const winner = state.total.red > state.total.blue ? t('player') : state.total.blue > state.total.red ? t('computer') : t('tied')
  const multiplier = pointsPerBall(state.difficulty)
  return (
    <section className="results-panel" aria-labelledby="results-title">
      <p className="eyebrow">{t('matchComplete')}</p><h2 id="results-title">{t('results')}</h2>
      <div className="final-score"><span>{state.total.red}</span><i>—</i><span>{state.total.blue}</span></div>
      <p className="winner"><strong>{t('winner')}: {winner}</strong><br />{message}</p>
      <div className="game-points-card"><small>{t('gamePoints')}</small><strong>{state.gamePoints.toLocaleString()}</strong><p>{t('scoreFormula', { balls: state.total.red, multiplier })}</p></div>
      <h3>{t('endScores')}</h3>
      <div className="end-score-grid">{state.endScores.map((score) => <div key={score.end}><span>{t('end', { current: score.end })}</span><strong>{score.red} — {score.blue}</strong></div>)}</div>
      <div className="result-actions"><button className="primary" onClick={onAgain}>{t('playAgain')}</button><button onClick={onDifficulty}>{t('switchDifficulty')}</button><button onClick={onHome}>{t('home')}</button></div>
    </section>
  )
}
