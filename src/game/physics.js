import { COURT, PHYSICS } from './constants.js'

export function updateBallPosition(ball, dt) {
  if (ball.outOfBounds) return ball
  return { ...ball, x: ball.x + ball.vx * dt, y: ball.y + ball.vy * dt }
}

export function applyFriction(ball, dt) {
  if (ball.outOfBounds) return ball
  const speed = Math.hypot(ball.vx, ball.vy)
  if (speed <= PHYSICS.stopSpeed) return { ...ball, vx: 0, vy: 0 }
  const next = Math.max(0, speed - PHYSICS.friction * dt)
  if (next <= PHYSICS.stopSpeed) return { ...ball, vx: 0, vy: 0 }
  const scale = next / speed
  return { ...ball, vx: ball.vx * scale, vy: ball.vy * scale }
}

export function resolveBallCollision(first, second) {
  if (first.outOfBounds || second.outOfBounds) return [first, second]
  const dx = second.x - first.x
  const dy = second.y - first.y
  const distance = Math.hypot(dx, dy)
  const minimum = (first.radius ?? PHYSICS.ballRadius) + (second.radius ?? PHYSICS.ballRadius)
  if (distance >= minimum) return [first, second]

  const safeDistance = distance || 0.0001
  const nx = distance ? dx / safeDistance : 1
  const ny = distance ? dy / safeDistance : 0
  const overlap = minimum - safeDistance
  let a = { ...first, x: first.x - nx * overlap / 2, y: first.y - ny * overlap / 2 }
  let b = { ...second, x: second.x + nx * overlap / 2, y: second.y + ny * overlap / 2 }
  const relative = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
  if (relative >= 0) return [a, b]
  const impulse = -(1 + PHYSICS.restitution) * relative / 2
  a = { ...a, vx: a.vx - impulse * nx, vy: a.vy - impulse * ny }
  b = { ...b, vx: b.vx + impulse * nx, vy: b.vy + impulse * ny }
  return [a, b]
}

export function resolveAllCollisions(balls) {
  const result = balls.map((ball) => ({ ...ball }))
  for (let pass = 0; pass < 3; pass += 1) {
    for (let i = 0; i < result.length; i += 1) {
      for (let j = i + 1; j < result.length; j += 1) {
        ;[result[i], result[j]] = resolveBallCollision(result[i], result[j])
      }
    }
  }
  return result
}

export function checkOutOfBounds(ball, court = COURT) {
  const r = ball.radius ?? PHYSICS.ballRadius
  // The dark court boundary is the playing limit. A ball is out as soon as
  // any part reaches or crosses it; the surrounding canvas is only visual padding.
  return ball.x - r <= court.inset
    || ball.x + r >= court.width - court.inset
    || ball.y - r <= court.top
    || ball.y + r >= court.bottom
}

export function placeJackAtCentre(jack, court = COURT) {
  if (!jack) return null
  return { ...jack, x: court.centre.x, y: court.centre.y, vx: 0, vy: 0, outOfBounds: false }
}

export function isBallStopped(ball) {
  return ball.outOfBounds || Math.hypot(ball.vx, ball.vy) <= PHYSICS.stopSpeed
}

export function areAllBallsStopped(balls) {
  return balls.every(isBallStopped)
}

export function stepPhysics(balls, elapsed) {
  let result = balls
  let remaining = Math.min(elapsed, 0.05)
  while (remaining > 0) {
    const dt = Math.min(PHYSICS.fixedStep, remaining)
    result = result.map((ball) => applyFriction(updateBallPosition(ball, dt), dt))
    result = resolveAllCollisions(result)
    result = result.map((ball) => checkOutOfBounds(ball) ? { ...ball, outOfBounds: true, vx: 0, vy: 0 } : ball)
    remaining -= dt
  }
  return result
}

export function getJackVLineY(x, court = COURT) {
  const line = court.jackVLine
  const leftSlope = (line.apexY - line.sideY) / (line.apexX - line.leftX)
  const rightSlope = (line.apexY - line.sideY) / (line.rightX - line.apexX)
  const leftArm = line.sideY + leftSlope * (x - line.leftX)
  const rightArm = line.sideY + rightSlope * (line.rightX - x)
  return Math.min(leftArm, rightArm)
}

export function isValidJackPosition(jack, court = COURT) {
  if (!jack || jack.outOfBounds) return false
  const r = jack.radius ?? PHYSICS.jackRadius
  const line = court.jackVLine
  const slope = (line.apexY - line.sideY) / (line.apexX - line.leftX)
  // Project the radius onto the sloping boundary so the whole Jack,
  // not only its centre, must be beyond both arms of the V line.
  const perpendicularClearance = r * Math.sqrt(1 + slope ** 2)
  return jack.y + perpendicularClearance < getJackVLineY(jack.x, court)
    && jack.x - r >= court.inset
    && jack.x + r <= court.width - court.inset
    && jack.y - r >= court.top
}
