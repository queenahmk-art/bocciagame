import { DIFFICULTIES } from './constants.js'

const POINTS_PER_BALL = Object.freeze({
  [DIFFICULTIES.BEGINNER]: 100,
  [DIFFICULTIES.TACTICAL]: 200,
})

export function pointsPerBall(difficulty) {
  return POINTS_PER_BALL[difficulty] ?? POINTS_PER_BALL[DIFFICULTIES.BEGINNER]
}

export function calculateGamePoints(ballsScored, difficulty) {
  const validBalls = Math.max(0, Math.floor(Number(ballsScored) || 0))
  return validBalls * pointsPerBall(difficulty)
}
