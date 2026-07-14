const steps = ['tutorial1', 'tutorial2', 'tutorial3', 'tutorial4', 'tutorial5']

export default function BocciaTutorial({ open, step, t, onStep, onClose, onStart, inGame = false }) {
  if (!open) return null
  return (
    <section className={`tutorial ${inGame ? 'in-game' : ''}`} role="dialog" aria-modal={!inGame} aria-labelledby="tutorial-title">
      <div className="tutorial-visual" aria-hidden="true"><span>{step + 1}</span><div className={`lesson-icon lesson-${step + 1}`}>J</div></div>
      <div>
        <p className="eyebrow">{step + 1} / {steps.length}</p>
        <h2 id="tutorial-title">{t('tutorialTitle')}</h2>
        <p className="tutorial-copy">{t(steps[step])}</p>
        {step === 3 ? <aside className="rule-note"><strong>{t('rulesTitle')}</strong><p>{t('rulesText')}</p></aside> : null}
        <div className="tutorial-actions">
          <button onClick={() => onStep(step - 1)} disabled={step === 0}>{t('previous')}</button>
          {step < steps.length - 1
            ? <button className="primary" onClick={() => onStep(step + 1)}>{t('next')}</button>
            : <button className="primary" onClick={inGame ? onClose : onStart}>{inGame ? t('close') : t('startGame')}</button>}
          {step < steps.length - 1 ? <button className="text-button" onClick={inGame ? onClose : onStart}>{t('skip')}</button> : null}
        </div>
      </div>
    </section>
  )
}
