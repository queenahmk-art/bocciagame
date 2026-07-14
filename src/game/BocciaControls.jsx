import { PHYSICS } from './constants.js'

export default function BocciaControls({ state, t, disabled, onAngle, onPower, onThrow }) {
  const handleKeys = (event) => {
    if (disabled) return
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); onAngle(state.angle + (event.key === 'ArrowLeft' ? -1 : 1))
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault(); onPower(state.power + (event.key === 'ArrowUp' ? 2 : -2))
    }
  }
  return (
    <section className="controls" aria-label={t('throw')} onKeyDown={handleKeys}>
      <div className="control-heading">
        <span className="eyebrow">{state.phase === 'jack' ? t('jack') : state.turn === 'blue' ? t('blueSide') : t('redSide')}</span>
        <strong>{disabled ? (state.aiThinking ? t('aiPlanning') : t('moving')) : t('yourTurn')}</strong>
      </div>
      <label htmlFor="direction">{t('direction')} <output>{Math.round(state.angle)}°</output></label>
      <input id="direction" type="range" min="-34" max="34" step="1" value={state.angle} disabled={disabled}
        aria-label={t('direction')} aria-valuetext={t('angleValue', { value: Math.round(state.angle) })} onChange={(event) => onAngle(Number(event.target.value))} />
      <p className="control-help">{t('dragAim')}</p>
      <label htmlFor="power">{t('power')} <output>{Math.round(state.power)}</output></label>
      <input id="power" type="range" min={PHYSICS.minPower} max={PHYSICS.maxPower} step="1" value={state.power} disabled={disabled}
        aria-label={t('power')} aria-valuetext={t('powerValue', { value: Math.round(state.power) })} onChange={(event) => onPower(Number(event.target.value))} />
      <div className="power-labels" aria-hidden="true"><span>{t('low')}</span><span>{t('medium')}</span><span>{t('high')}</span></div>
      <button className="primary throw-button" disabled={disabled} onClick={onThrow} aria-label={state.phase === 'jack' ? t('throwJack') : t('throw')}>
        <span aria-hidden="true">↥</span>{state.phase === 'jack' ? t('throwJack') : t('throw')}
      </button>
    </section>
  )
}
