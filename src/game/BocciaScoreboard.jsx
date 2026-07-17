import { leadingSide } from './scoring.js'
import { calculateLeaderboardScore } from './leaderboard.js'

export default function BocciaScoreboard({ state, t }) {
  const leader = state.jack ? leadingSide(state.balls, state.jack) : { side: null }
  const leaderText = leader.side === 'red' ? t('redSide') : leader.side === 'blue' ? t('blueSide') : leader.side === 'tie' ? t('tied') : t('none')
  const turnText = state.turn === 'red' ? t('yourTurn') : state.turn === 'blue' ? t('computerTurn') : t('scoring')
  return (
    <section className="scoreboard" aria-label={t('score')}>
      <div className="end-marker"><strong>{t('end', { current: state.end })}</strong><span>{t('ofEnds', { total: state.totalEnds })}</span></div>
      <div className="score-card red"><span>{state.playerName || t('player')} · {t('redSide')}</span><strong>{state.total.red}</strong><small>{t('remaining')}: {state.remaining.red}</small><small>{t('rankingPoints')}: {calculateLeaderboardScore(state.total.red, state.difficulty)}</small></div>
      <div className="score-card blue"><span>{t('computer')} · {t('blueSide')}</span><strong>{state.total.blue}</strong><small>{t('remaining')}: {state.remaining.blue}</small></div>
      <dl className="match-facts">
        <div><dt>{t('currentTurn')}</dt><dd>{turnText}</dd></div>
        <div><dt>{t('currentLeader')}</dt><dd>{leaderText}</dd></div>
        <div><dt>{t('difficulty')}</dt><dd>{t(state.difficulty)}</dd></div>
      </dl>
    </section>
  )
}
