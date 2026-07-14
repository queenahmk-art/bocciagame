export function distanceToJack(ball, jack) {
  return Math.hypot(ball.x - jack.x, ball.y - jack.y)
}

export function validBalls(balls, side) {
  return balls.filter((ball) => ball.side === side && !ball.outOfBounds && ball.kind !== 'jack')
}

export function closestBall(balls, jack, side) {
  let closest = null
  for (const ball of validBalls(balls, side)) {
    const distance = distanceToJack(ball, jack)
    if (!closest || distance < closest.distance) closest = { ball, distance }
  }
  return closest
}

export function scoreEnd(balls, jack, epsilon = 0.001) {
  const red = validBalls(balls, 'red').map((ball) => distanceToJack(ball, jack)).sort((a, b) => a - b)
  const blue = validBalls(balls, 'blue').map((ball) => distanceToJack(ball, jack)).sort((a, b) => a - b)
  if (!red.length && !blue.length) return { side: null, points: 0, red: 0, blue: 0, reason: 'noBalls' }
  const redNearest = red[0] ?? Infinity
  const blueNearest = blue[0] ?? Infinity
  if (Math.abs(redNearest - blueNearest) <= epsilon) return { side: null, points: 0, red: 0, blue: 0, reason: 'tie' }
  const side = redNearest < blueNearest ? 'red' : 'blue'
  const opponentNearest = side === 'red' ? blueNearest : redNearest
  const distances = side === 'red' ? red : blue
  const points = distances.filter((distance) => distance < opponentNearest - epsilon).length
  return { side, points, red: side === 'red' ? points : 0, blue: side === 'blue' ? points : 0, reason: 'score' }
}

export function leadingSide(balls, jack, epsilon = 0.001) {
  const red = closestBall(balls, jack, 'red')
  const blue = closestBall(balls, jack, 'blue')
  if (!red && !blue) return { side: null, distance: null }
  if (!red) return { side: 'blue', distance: blue.distance }
  if (!blue) return { side: 'red', distance: red.distance }
  if (Math.abs(red.distance - blue.distance) <= epsilon) return { side: 'tie', distance: red.distance }
  return red.distance < blue.distance ? { side: 'red', distance: red.distance } : { side: 'blue', distance: blue.distance }
}
