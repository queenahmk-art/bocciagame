import { COURT, DIFFICULTIES, PHYSICS, powerForDistance } from './constants.js'
import { closestBall, leadingSide } from './scoring.js'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
const randomBetween = (random, min, max) => min + random() * (max - min)

function shotToTarget(target, difficulty, random) {
  const start = { x: COURT.width / 2, y: COURT.throwLine + 35 }
  const dx = target.x - start.x
  const dy = target.y - start.y
  const baseAngle = Math.atan2(dx, -dy) * 180 / Math.PI
  const angleError = difficulty === DIFFICULTIES.BEGINNER ? randomBetween(random, -8, 8) : randomBetween(random, -2.5, 2.5)
  const powerError = difficulty === DIFFICULTIES.BEGINNER ? randomBetween(random, -12, 12) : randomBetween(random, -4, 4)
  return {
    angle: clamp(baseAngle + angleError, -34, 34),
    power: clamp(powerForDistance(Math.hypot(dx, dy)) + powerError, PHYSICS.minPower, PHYSICS.maxPower),
    target,
  }
}

export function chooseAIJack(random = Math.random) {
  const zones = [
    { x: 115, y: 275 }, { x: 180, y: 235 }, { x: 245, y: 300 }, { x: 145, y: 390 }, { x: 220, y: 365 },
  ]
  const zone = zones[Math.floor(random() * zones.length)]
  const target = { x: zone.x + randomBetween(random, -15, 15), y: zone.y + randomBetween(random, -15, 15) }
  return { ...shotToTarget(target, DIFFICULTIES.TACTICAL, random), strategy: 'jack' }
}

export function chooseAIShot({ difficulty = DIFFICULTIES.BEGINNER, balls = [], jack, remaining = {} }, random = Math.random) {
  if (!jack) return chooseAIJack(random)
  let strategy = 'draw'
  let target = { x: jack.x, y: jack.y }
  if (difficulty === DIFFICULTIES.TACTICAL) {
    const leader = leadingSide(balls, jack)
    const red = closestBall(balls, jack, 'red')
    const blue = closestBall(balls, jack, 'blue')
    const roll = random()
    if (leader.side === 'red' && red && roll < 0.42) {
      strategy = 'hit'
      target = { x: red.ball.x, y: red.ball.y }
    } else if (blue && leader.side === 'red' && roll < 0.62) {
      strategy = 'promote'
      target = { x: blue.ball.x, y: blue.ball.y }
    } else if (leader.side === 'blue' && (remaining.blue ?? 0) <= 3 && roll < 0.42) {
      strategy = 'block'
      const vectorY = COURT.throwLine - jack.y
      target = { x: jack.x, y: jack.y + Math.min(62, vectorY * 0.22) }
    } else {
      target = { x: jack.x + randomBetween(random, -12, 12), y: jack.y + randomBetween(random, -9, 9) }
    }
  } else {
    target = { x: jack.x + randomBetween(random, -30, 30), y: jack.y + randomBetween(random, -28, 28) }
  }
  return { ...shotToTarget(target, difficulty, random), strategy }
}
