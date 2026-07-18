import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import BocciaCourt from './BocciaCourt.jsx'
import BocciaControls from './BocciaControls.jsx'
import BocciaScoreboard from './BocciaScoreboard.jsx'
import BocciaTutorial from './BocciaTutorial.jsx'
import BocciaResults from './BocciaResults.jsx'
import BocciaStatus from './BocciaStatus.jsx'
import { COURT, DIFFICULTIES, PHYSICS, launchSpeed } from './constants.js'
import { chooseAIJack, chooseAIShot } from './computerAI.js'
import { appendEndScore, canLaunchShot, createInitialGame, gameReducer, isFinalEnd, resolveInvalidJackTurn } from './gameReducer.js'
import { isValidJackPosition, placeJackAtCentre } from './physics.js'
import { scoreEnd } from './scoring.js'
import { determineNextTurn } from './turnLogic.js'
import { coachTip, courtSummary } from './selectors.js'
import { calculateGamePoints } from './gamePoints.js'
import { translate, translations } from '../i18n/translations.js'
import '../styles/boccia-game.css'

const validLanguage = (language) => language in translations ? language : 'zh-Hant-HK'
const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

export default function BocciaGame({
  initialLanguage = 'zh-Hant-HK',
  initialDifficulty = DIFFICULTIES.BEGINNER,
  compactMode = false,
  onExit,
  rulesUrl,
  contactUrl,
}) {
  const isEmbedded = typeof window !== 'undefined' && window.self !== window.top
  const [state, dispatch] = useReducer(gameReducer, null, () => createInitialGame({
    language: validLanguage(initialLanguage),
    difficulty: Object.values(DIFFICULTIES).includes(initialDifficulty) ? initialDifficulty : DIFFICULTIES.BEGINNER,
  }))
  const [reducedMotion, setReducedMotion] = useState(false)
  const stateRef = useRef(state)
  const simulationRef = useRef([])
  const shotCounterRef = useRef(0)
  const settlingRef = useRef(false)
  const timersRef = useRef(new Set())
  stateRef.current = state

  const t = useCallback((key, variables) => translate(state.language, key, variables), [state.language])
  const summary = useMemo(() => courtSummary(state, t), [state, t])
  const playerCanThrow = state.screen === 'game' && state.phase !== 'endTransition' && state.phase !== 'scoring'
    && state.turn === 'red' && !state.busy && !state.aiThinking

  const later = useCallback((callback, delay) => {
    const timer = window.setTimeout(() => { timersRef.current.delete(timer); callback() }, delay)
    timersRef.current.add(timer)
    return timer
  }, [])

  useEffect(() => () => {
    for (const timer of timersRef.current) window.clearTimeout(timer)
    timersRef.current.clear()
  }, [])

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    update()
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])

  useEffect(() => {
    document.documentElement.lang = state.language
  }, [state.language])

  const sound = useCallback(() => {
    if (!stateRef.current.sound) return
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      const context = new AudioContext()
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.frequency.value = 310
      gain.gain.setValueAtTime(0.035, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.09)
      oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + 0.1)
      oscillator.addEventListener('ended', () => context.close(), { once: true })
    } catch { /* Sound is an optional enhancement. */ }
  }, [])

  const finishEnd = useCallback((balls, jack) => {
    const current = stateRef.current
    const score = scoreEnd(balls, jack)
    const additions = appendEndScore(current, score)
    const messageKey = score.reason === 'tie' ? 'tieScore' : score.reason === 'noBalls' ? 'noScore' : `${score.side}Scores`
    const message = translate(current.language, messageKey, { points: score.points })
    const complete = isFinalEnd(current.end)
    const gamePoints = complete ? calculateGamePoints(additions.total.red, current.difficulty) : current.gamePoints
    const nextState = {
      ...additions, balls, jack, result: score, busy: false, aiThinking: false,
      phase: complete ? 'complete' : 'endTransition', screen: complete ? 'results' : 'game',
      message, announcement: `${message} ${complete ? translate(current.language, 'matchComplete') : ''}`,
      gamePoints,
    }
    dispatch({ type: 'PATCH', payload: nextState })
  }, [])

  const handleSettled = useCallback((settledBalls) => {
    if (settlingRef.current) return
    settlingRef.current = true
    const current = stateRef.current
    const shot = settledBalls.find((ball) => ball.id === current.activeShotId)
    if (!shot) { settlingRef.current = false; return }
    const wasOut = shot.outOfBounds

    if (shot.kind === 'jack') {
      if (!isValidJackPosition(shot)) {
        const resolution = resolveInvalidJackTurn(shot.side, current.jackAttempts)
        if (resolution.action === 'handoff') {
          const withoutShot = settledBalls.filter((ball) => ball.id !== shot.id)
          const nextSideName = translate(current.language, resolution.side === 'red' ? 'redSide' : 'blueSide')
          simulationRef.current = withoutShot
          const message = translate(current.language, 'jackInvalidHandoff', { side: nextSideName })
          dispatch({ type: 'PATCH', payload: { balls: withoutShot, jack: null, phase: 'jack', turn: resolution.side,
            jackThrower: resolution.side, jackAttempts: resolution.jackAttempts, busy: false, aiThinking: false,
            message, announcement: message } })
        } else {
          const safeJack = placeJackAtCentre(shot)
          const safeBalls = settledBalls.map((ball) => ball.id === shot.id ? safeJack : ball)
          const sideName = translate(current.language, shot.side === 'red' ? 'redSide' : 'blueSide')
          const message = translate(current.language, 'jackPlacedAfterInvalid', { side: sideName })
          simulationRef.current = safeBalls
          dispatch({ type: 'PATCH', payload: { balls: safeBalls, jack: safeJack, phase: 'color', turn: shot.side,
            jackThrower: shot.side, jackAttempts: resolution.jackAttempts, busy: false, aiThinking: false,
            message, announcement: `${message} ${shot.side === 'red' ? translate(current.language, 'yourTurn') : translate(current.language, 'computerTurn')}` } })
        }
      } else {
        const stoppedJack = { ...shot, vx: 0, vy: 0 }
        const balls = settledBalls.map((ball) => ball.id === shot.id ? stoppedJack : ball)
        simulationRef.current = balls
        dispatch({ type: 'PATCH', payload: { balls, jack: stoppedJack, phase: 'color', turn: shot.side, jackThrower: shot.side,
          busy: false, aiThinking: false, message: '', announcement: shot.side === 'red' ? translate(current.language, 'yourTurn') : translate(current.language, 'computerTurn') } })
      }
      later(() => { settlingRef.current = false }, 0)
      return
    }

    let balls = settledBalls
    let jack = balls.find((ball) => ball.kind === 'jack') ?? current.jack
    let jackReplaced = false
    if (jack?.outOfBounds) {
      jackReplaced = true
      jack = placeJackAtCentre(jack)
      balls = balls.map((ball) => ball.id === jack.id ? jack : ball)
      simulationRef.current = balls
    }
    const turn = determineNextTurn({ jack, balls, remaining: current.remaining, thrown: current.thrown,
      jackThrower: current.jackThrower, lastThrower: shot.side })
    const message = jackReplaced ? translate(current.language, 'jackReplaced')
      : wasOut ? translate(current.language, 'ballOut')
        : turn.reason === 'fartherContinues' ? translate(current.language, 'fartherContinues') : ''
    const coach = shot.side === 'red' ? translate(current.language, coachTip({ ...current, balls, jack, lastShotOut: wasOut })) : current.coach
    const base = { balls, jack, busy: false, aiThinking: false, lastThrower: shot.side, message, coach,
      announcement: `${wasOut ? translate(current.language, 'ballOut') : ''} ${turn.endComplete ? translate(current.language, 'scoring') : turn.side === 'red' ? translate(current.language, 'yourTurn') : translate(current.language, 'computerTurn')}`.trim() }
    if (turn.endComplete) {
      dispatch({ type: 'PATCH', payload: { ...base, phase: 'scoring', turn: null } })
      later(() => finishEnd(balls, jack), reducedMotion ? 50 : 650)
    } else dispatch({ type: 'PATCH', payload: { ...base, turn: turn.side } })
    later(() => { settlingRef.current = false }, 0)
  }, [finishEnd, later, reducedMotion])

  const launchShot = useCallback((angle, power) => {
    const current = stateRef.current
    const aiReady = current.screen === 'game' && current.turn === 'blue' && current.aiThinking && !current.busy
      && ['jack', 'color'].includes(current.phase) && (current.phase === 'jack' || current.remaining.blue > 0)
    if (!canLaunchShot(current) && !aiReady) return false
    const side = current.turn
    const kind = current.phase === 'jack' ? 'jack' : 'colour'
    if (kind === 'colour' && current.remaining[side] <= 0) return false
    const radians = clamp(angle, -34, 34) * Math.PI / 180
    const speed = launchSpeed(power)
    const ball = {
      id: `${kind}-${side}-${++shotCounterRef.current}`, kind, side,
      x: COURT.width / 2, y: COURT.throwLine + 35,
      vx: Math.sin(radians) * speed, vy: -Math.cos(radians) * speed,
      radius: kind === 'jack' ? PHYSICS.jackRadius : PHYSICS.ballRadius,
      outOfBounds: false,
    }
    const balls = [...current.balls, ball]
    const payload = { balls, busy: true, aiThinking: false, activeShotId: ball.id, message: '',
      announcement: translate(current.language, 'moving') }
    if (kind === 'colour') {
      payload.remaining = { ...current.remaining, [side]: current.remaining[side] - 1 }
      payload.thrown = { ...current.thrown, [side]: current.thrown[side] + 1 }
    }
    simulationRef.current = balls
    dispatch({ type: 'PATCH', payload })
    sound()
    return true
  }, [sound])

  useEffect(() => {
    if (state.screen !== 'game' || state.turn !== 'blue' || state.busy || state.aiThinking || !['jack', 'color'].includes(state.phase)) return undefined
    dispatch({ type: 'PATCH', payload: { aiThinking: true, announcement: t('aiPlanning'), message: t('aiPlanning') } })
    const delay = reducedMotion ? 80 : 600 + Math.round(Math.random() * 600)
    const timer = later(() => {
      const current = stateRef.current
      const shot = current.phase === 'jack'
        ? chooseAIJack()
        : chooseAIShot({ difficulty: current.difficulty, balls: current.balls, jack: current.jack, remaining: current.remaining })
      launchShot(shot.angle, shot.power)
    }, delay)
    return () => { window.clearTimeout(timer); timersRef.current.delete(timer) }
  }, [state.screen, state.turn, state.busy, state.phase, state.end, launchShot, later, reducedMotion, t])

  const start = () => {
    simulationRef.current = []
    dispatch({ type: 'START' })
  }
  const restart = () => {
    simulationRef.current = []
    dispatch({ type: 'RESTART' })
  }
  const nextEnd = () => {
    simulationRef.current = []
    dispatch({ type: 'NEXT_END' })
    dispatch({ type: 'PATCH', payload: { announcement: t('newEnd', { end: state.end + 1 }) } })
  }
  const home = () => { simulationRef.current = []; dispatch({ type: 'HOME' }) }
  const setDifficulty = (difficulty) => dispatch({ type: 'PATCH', payload: { difficulty } })
  const changeLanguage = () => dispatch({ type: 'PATCH', payload: { language: state.language === 'zh-Hant-HK' ? 'en-HK' : 'zh-Hant-HK' } })
  const setAngle = (angle) => { if (playerCanThrow) dispatch({ type: 'PATCH', payload: { angle: clamp(angle, -34, 34) } }) }
  const setPower = (power) => { if (playerCanThrow) dispatch({ type: 'PATCH', payload: { power: clamp(power, PHYSICS.minPower, PHYSICS.maxPower) } }) }

  return (
    <main className={`boccia-game-app ${compactMode ? 'compact' : ''} ${isEmbedded ? 'is-embedded' : ''}`}>
      {!isEmbedded ? (
        <header className="game-header">
          <a className="brand" href="#game"><span className="brand-mark" aria-hidden="true">B</span><span><strong>{t('gameName')}</strong><small>{t('englishName')}</small></span></a>
          <nav aria-label={t('gameHelp')}>
            {state.screen === 'game' ? <button onClick={() => dispatch({ type: 'PATCH', payload: { tutorialOpen: true, tutorialStep: 0 } })}>{t('gameHelp')}</button> : null}
            <button onClick={changeLanguage} aria-label={t('language')}>{t('language')}</button>
            <button onClick={() => dispatch({ type: 'PATCH', payload: { sound: !state.sound } })} aria-label={state.sound ? t('soundOff') : t('soundOn')}>{state.sound ? '◉' : '○'} <span className="optional-label">{state.sound ? t('soundOff') : t('soundOn')}</span></button>
            {compactMode && onExit ? <button onClick={onExit}>{t('compactExit')}</button> : null}
          </nav>
        </header>
      ) : null}

      {state.screen === 'start' ? (
        <section className="landing" id="game">
          <div className="landing-copy">
            <p className="eyebrow">Player vs AI · 4 Ends</p>
            <h1>{t('gameName')}</h1><p className="subtitle">{t('subtitle')}</p>
            <p className="disclaimer">{t('disclaimer')}</p>
            <fieldset className="difficulty-picker"><legend>{t('difficulty')}</legend>
              <button className={state.difficulty === 'beginner' ? 'selected' : ''} onClick={() => setDifficulty('beginner')}><strong>{t('beginner')}</strong><small>{t('beginnerScoreRule')}</small></button>
              <button className={state.difficulty === 'tactical' ? 'selected' : ''} onClick={() => setDifficulty('tactical')}><strong>{t('tactical')}</strong><small>{t('advancedScoreRule')}</small></button>
            </fieldset>
            <div className="landing-actions"><button className="primary" onClick={start}>{t('startGame')}</button><button onClick={() => dispatch({ type: 'PATCH', payload: { tutorialOpen: true, tutorialStep: 0 } })}>{t('gameHelp')}</button></div>
            {(rulesUrl || contactUrl) ? <p className="external-links">{rulesUrl ? <a href={rulesUrl}>{t('officialRules')}</a> : null}{contactUrl ? <a href={contactUrl}>{t('contact')}</a> : null}</p> : null}
          </div>
          <div className="landing-art" aria-hidden="true"><div className="mini-court"><i className="ball jack">J</i><i className="ball red">R</i><i className="ball blue">B</i><span /></div></div>
        </section>
      ) : null}

      {state.screen === 'game' ? (
        <div className="game-shell" id="game">
          <BocciaScoreboard state={state} t={t} />
          <section className="court-column">
            <BocciaCourt simulationRef={simulationRef} busy={state.busy} aim={{ angle: state.angle, power: state.power }} interactive={playerCanThrow}
              onSettled={handleSettled} t={t} reducedMotion={reducedMotion} />
            <BocciaStatus message={state.message} coach={state.coach} summary={summary} t={t} />
          </section>
          <aside className="control-column">
            <BocciaControls state={state} t={t} disabled={!playerCanThrow} onAngle={setAngle} onPower={setPower} onThrow={() => launchShot(state.angle, state.power)} />
            <button className="restart-button" onClick={restart}>{t('restart')}</button>
            <details className="rules-drawer"><summary>{t('rulesTitle')}</summary><p>{t('rulesText')}</p></details>
          </aside>
          {state.phase === 'endTransition' ? <section className="end-transition" role="dialog" aria-labelledby="end-score-title"><p className="eyebrow">{t('end', { current: state.end })}</p><h2 id="end-score-title">{state.message}</h2><div className="mini-score"><span>{t('redSide')} <strong>{state.result.red}</strong></span><span>{t('blueSide')} <strong>{state.result.blue}</strong></span></div><button className="primary" onClick={nextEnd}>{t('nextEnd')}</button></section> : null}
        </div>
      ) : null}

      {state.screen === 'results' ? <BocciaResults state={state} t={t} onAgain={restart} onHome={home}
        onDifficulty={() => { setDifficulty(state.difficulty === 'beginner' ? 'tactical' : 'beginner'); restart() }} /> : null}

      <BocciaTutorial open={state.tutorialOpen} step={state.tutorialStep} t={t} inGame={state.screen === 'game'}
        onStep={(step) => dispatch({ type: 'PATCH', payload: { tutorialStep: clamp(step, 0, 4) } })}
        onClose={() => dispatch({ type: 'PATCH', payload: { tutorialOpen: false } })} onStart={start} />
      <div className="live-region" aria-live="polite" aria-atomic="true">{state.announcement}</div>
    </main>
  )
}
