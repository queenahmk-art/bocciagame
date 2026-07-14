export default function BocciaStatus({ message, coach, summary, t }) {
  return (
    <section className="status-panel" aria-label={t('status')}>
      {message ? <p className="game-message"><span aria-hidden="true">●</span>{message}</p> : null}
      {coach ? <div className="coach-tip"><span aria-hidden="true">◎</span><div><strong>{t('coachTitle')}</strong><p>{coach}</p></div></div> : null}
      <p className="sr-summary">{summary}</p>
    </section>
  )
}
