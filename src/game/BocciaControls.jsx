import { PHYSICS } from './constants.js'
import { angleFromAimPad, nudgeAimAngle } from './aimControl.js'

export default function BocciaControls({ state, t, disabled, onAngle, onPower, onThrow }) {
  const updateDirection = (event) => {
    if (disabled) return
    const rect = event.currentTarget.getBoundingClientRect()
    onAngle(angleFromAimPad(event.clientX, event.clientY, rect))
  }

  const handleDirectionKeys = (event) => {
    if (disabled) return
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      onAngle(nudgeAimAngle(state.angle, event.key === 'ArrowLeft' ? -1 : 1))
    }
    if (event.key === 'Home') { event.preventDefault(); onAngle(-34) }
    if (event.key === 'End') { event.preventDefault(); onAngle(34) }
  }

  return (
    <section className="controls" aria-label={t('throw')}>
      <div className="control-heading">
        <span className="eyebrow">{state.phase === 'jack' ? t('jack') : state.turn === 'blue' ? t('blueSide') : t('redSide')}</span>
        <strong>{disabled ? (state.aiThinking ? t('aiPlanning') : t('moving')) : t('yourTurn')}</strong>
      </div>
      <div className="direction-control">
        <div className="control-label-row"><span id="direction-label">{t('direction')}</span><output>{Math.round(state.angle)}°</output></div>
        <div
          className="direction-pad"
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-labelledby="direction-label"
          aria-valuemin="-34"
          aria-valuemax="34"
          aria-valuenow={Math.round(state.angle)}
          aria-valuetext={t('angleValue', { value: Math.round(state.angle) })}
          aria-disabled={disabled}
          style={{ '--aim-angle': `${state.angle}deg` }}
          onPointerDown={(event) => {
            if (disabled) return
            event.currentTarget.setPointerCapture(event.pointerId)
            updateDirection(event)
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) updateDirection(event)
          }}
          onKeyDown={handleDirectionKeys}
        >
          <span className="aim-arm" aria-hidden="true"><span className={`aim-ball ${state.phase === 'jack' ? 'jack' : 'red'}`}>{state.phase === 'jack' ? 'J' : 'R'}</span></span>
          <span className="aim-origin" aria-hidden="true" />
          <span className="direction-range" aria-hidden="true"><span>{t('left')}</span><span>{t('centre')}</span><span>{t('right')}</span></span>
        </div>
        <p className="control-help">{t('aimPadHelp')}</p>
      </div>
      <div className="power-control">
        <label htmlFor="power">{t('power')} <output>{Math.round(state.power)}</output></label>
        <input id="power" type="range" min={PHYSICS.minPower} max={PHYSICS.maxPower} step="1" value={state.power} disabled={disabled}
          aria-label={t('power')} aria-valuetext={t('powerValue', { value: Math.round(state.power) })} onChange={(event) => onPower(Number(event.target.value))} />
        <div className="power-labels" aria-hidden="true"><span>{t('low')}</span><span>{t('medium')}</span><span>{t('high')}</span></div>
      </div>
      <button className="primary throw-button" disabled={disabled} onClick={onThrow} aria-label={state.phase === 'jack' ? t('throwJack') : t('throw')}>
        {state.phase === 'jack' ? t('throwJack') : t('throw')}
      </button>
    </section>
  )
}
