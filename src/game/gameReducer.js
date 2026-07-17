import { BALLS_PER_SIDE, DIFFICULTIES, TOTAL_ENDS } from './constants.js'

export function createInitialGame({ language = 'zh-Hant-HK', difficulty = DIFFICULTIES.BEGINNER } = {}) {
  return {
    language, difficulty, screen: 'start', tutorialOpen: true, tutorialStep: 0,
    sound: true, end: 1, totalEnds: TOTAL_ENDS, total: { red: 0, blue: 0 }, endScores: [],
    phase: 'jack', jackThrower: 'red', jackAttempts: 0, turn: 'red', remaining: { red: BALLS_PER_SIDE, blue: BALLS_PER_SIDE },
    thrown: { red: 0, blue: 0 }, balls: [], jack: null, lastThrower: null,
    busy: false, aiThinking: false, angle: 0, power: 52, announcement: '', message: '', coach: '', result: null,
    gamePoints: 0,
  }
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'PATCH': return { ...state, ...action.payload }
    case 'START': return { ...createInitialGame({ language: state.language, difficulty: state.difficulty }), screen: 'game', tutorialOpen: false }
    case 'RESTART': return { ...createInitialGame({ language: state.language, difficulty: state.difficulty }), screen: 'game', tutorialOpen: false }
    case 'HOME': return { ...createInitialGame({ language: state.language, difficulty: state.difficulty }), tutorialOpen: false }
    case 'NEXT_END': {
      const nextEnd = state.end + 1
      const thrower = nextEnd % 2 === 1 ? 'red' : 'blue'
      return { ...state, end: nextEnd, phase: 'jack', jackThrower: thrower, jackAttempts: 0, turn: thrower,
        remaining: { red: BALLS_PER_SIDE, blue: BALLS_PER_SIDE }, thrown: { red: 0, blue: 0 }, balls: [], jack: null,
        lastThrower: null, busy: false, aiThinking: false, angle: 0, power: 52, message: '', coach: '' }
    }
    default: return state
  }
}

export function resolveInvalidJackTurn(side, jackAttempts = 0) {
  if (jackAttempts === 0) {
    return { action: 'handoff', side: side === 'red' ? 'blue' : 'red', jackAttempts: 1 }
  }
  return { action: 'place', side, jackAttempts: jackAttempts + 1 }
}

export function appendEndScore(state, score) {
  return {
    total: { red: state.total.red + score.red, blue: state.total.blue + score.blue },
    endScores: [...state.endScores, { end: state.end, red: score.red, blue: score.blue }],
  }
}

export function canLaunchShot(state) {
  return state.screen === 'game' && !state.busy && !state.aiThinking
    && ['jack', 'color'].includes(state.phase) && Boolean(state.turn)
    && (state.phase === 'jack' || state.remaining[state.turn] > 0)
}

export function isFinalEnd(end) {
  return end >= TOTAL_ENDS
}
