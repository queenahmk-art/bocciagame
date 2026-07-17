export default function BocciaLeaderboard({ entries, t, currentEntryId = null, limit = 10, compact = false }) {
  const visibleEntries = entries.slice(0, limit)
  return (
    <section className={`leaderboard-panel ${compact ? 'compact-leaderboard' : ''}`} aria-labelledby={compact ? 'landing-leaderboard-title' : 'results-leaderboard-title'}>
      <header className="leaderboard-heading">
        <div><p className="eyebrow">Top {limit}</p><h2 id={compact ? 'landing-leaderboard-title' : 'results-leaderboard-title'}>{t('leaderboard')}</h2></div>
        <span className="storage-badge">{t('deviceOnly')}</span>
      </header>
      <p className="leaderboard-note">{t('leaderboardNote')}</p>
      {visibleEntries.length ? (
        <ol className="leaderboard-list">
          {visibleEntries.map((entry, index) => (
            <li key={entry.id} className={entry.id === currentEntryId ? 'current-entry' : ''}>
              <span className="rank-number" aria-label={t('rankNumber', { rank: index + 1 })}>{index + 1}</span>
              <span className="leaderboard-player"><strong>{entry.playerName}</strong><small>{t(entry.difficulty)} · {t('ballsScoredValue', { balls: entry.ballsScored })}</small></span>
              <strong className="leaderboard-points">{entry.score.toLocaleString()}<small>{t('pointsShort')}</small></strong>
            </li>
          ))}
        </ol>
      ) : <div className="leaderboard-empty"><span aria-hidden="true">◎</span><p>{t('leaderboardEmpty')}</p></div>}
      <div className="score-rule-row" aria-label={t('scoringRules')}>
        <span><i className="beginner-dot" />{t('beginner')}: {t('pointsPerBall', { points: 100 })}</span>
        <span><i className="advanced-dot" />{t('tactical')}: {t('pointsPerBall', { points: 200 })}</span>
      </div>
    </section>
  )
}
