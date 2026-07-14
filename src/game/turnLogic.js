import { closestBall } from './scoring.js'

export function determineNextTurn({ jack, balls, remaining, thrown, jackThrower, lastThrower }) {
  if (remaining.red <= 0 && remaining.blue <= 0) return { side: null, endComplete: true, reason: 'noBalls' }
  const other = jackThrower === 'red' ? 'blue' : 'red'
  if (thrown[jackThrower] === 0) return { side: jackThrower, endComplete: false, reason: 'jackThrowerFirst' }
  if (thrown[other] === 0 && remaining[other] > 0) return { side: other, endComplete: false, reason: 'opponentFirst' }

  const red = closestBall(balls, jack, 'red')
  const blue = closestBall(balls, jack, 'blue')
  let farther
  if (!red && !blue) farther = lastThrower
  else if (!red) farther = 'red'
  else if (!blue) farther = 'blue'
  else if (Math.abs(red.distance - blue.distance) <= 0.001) {
    // Simplified tie rule: the side that just threw continues.
    farther = lastThrower
  } else farther = red.distance > blue.distance ? 'red' : 'blue'

  if (remaining[farther] > 0) return { side: farther, endComplete: false, reason: 'fartherContinues' }
  const fallback = farther === 'red' ? 'blue' : 'red'
  if (remaining[fallback] > 0) return { side: fallback, endComplete: false, reason: 'otherSideFinishes' }
  return { side: null, endComplete: true, reason: 'noBalls' }
}
