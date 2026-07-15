import { memo, useEffect, useRef } from 'react'
import { COURT, PHYSICS } from './constants.js'
import { areAllBallsStopped, stepPhysics } from './physics.js'

function drawBall(context, ball) {
  if (ball.outOfBounds) return
  const radius = ball.radius ?? PHYSICS.ballRadius
  const colours = ball.kind === 'jack'
    ? { fill: '#fffdf2', edge: '#202c28', text: '#202c28', mark: 'J' }
    : ball.side === 'red'
      ? { fill: '#d94038', edge: '#7e171b', text: '#ffffff', mark: 'R' }
      : { fill: '#2872c7', edge: '#113f78', text: '#ffffff', mark: 'B' }
  const gradient = context.createRadialGradient(ball.x - radius * 0.35, ball.y - radius * 0.35, 1, ball.x, ball.y, radius)
  gradient.addColorStop(0, '#ffffffbb')
  gradient.addColorStop(0.32, colours.fill)
  gradient.addColorStop(1, colours.edge)
  context.beginPath()
  context.arc(ball.x, ball.y, radius, 0, Math.PI * 2)
  context.fillStyle = gradient
  context.fill()
  context.strokeStyle = colours.edge
  context.lineWidth = ball.kind === 'jack' ? 2.5 : 1.5
  context.stroke()
  context.fillStyle = colours.text
  context.font = `700 ${ball.kind === 'jack' ? 9 : 10}px system-ui`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(colours.mark, ball.x, ball.y + 0.5)
}

function drawCourt(context, balls, aim, interactive, labels) {
  context.clearRect(0, 0, COURT.width, COURT.height)
  const background = context.createLinearGradient(0, 0, COURT.width, COURT.height)
  background.addColorStop(0, '#d9e0d7')
  background.addColorStop(1, '#bcc8bd')
  context.fillStyle = background
  context.fillRect(0, 0, COURT.width, COURT.height)

  context.fillStyle = '#f7f7f0'
  context.fillRect(COURT.inset, COURT.top, COURT.width - COURT.inset * 2, COURT.bottom - COURT.top)
  context.strokeStyle = '#1d3830'
  context.lineWidth = 3
  context.strokeRect(COURT.inset, COURT.top, COURT.width - COURT.inset * 2, COURT.bottom - COURT.top)

  const vLine = COURT.jackVLine
  context.fillStyle = '#f2ead8'
  context.beginPath()
  context.moveTo(COURT.inset, vLine.sideY)
  context.lineTo(vLine.apexX, vLine.apexY)
  context.lineTo(COURT.width - COURT.inset, vLine.sideY)
  context.lineTo(COURT.width - COURT.inset, COURT.throwLine)
  context.lineTo(COURT.inset, COURT.throwLine)
  context.closePath()
  context.fill()

  context.strokeStyle = '#1d3830'
  context.lineWidth = 3
  context.beginPath()
  context.moveTo(vLine.leftX, vLine.sideY)
  context.lineTo(vLine.apexX, vLine.apexY)
  context.lineTo(vLine.rightX, vLine.sideY)
  context.stroke()

  context.strokeStyle = '#9e2830'
  context.lineWidth = 3
  context.beginPath(); context.moveTo(COURT.inset, COURT.throwLine); context.lineTo(COURT.width - COURT.inset, COURT.throwLine); context.stroke()

  const boxWidth = (COURT.width - COURT.inset * 2) / 6
  context.strokeStyle = '#1d3830'
  context.lineWidth = 2
  context.font = '700 15px system-ui'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = '#33483f'
  for (let index = 1; index < 6; index += 1) {
    const x = COURT.inset + boxWidth * index
    context.beginPath(); context.moveTo(x, COURT.throwLine); context.lineTo(x, COURT.bottom); context.stroke()
  }
  for (let index = 0; index < 6; index += 1) {
    context.fillText(String(index + 1), COURT.inset + boxWidth * (index + 0.5), COURT.throwLine + (COURT.bottom - COURT.throwLine) * 0.68)
  }

  context.fillStyle = '#6e5540'
  context.font = '700 9px system-ui'
  context.textAlign = 'left'
  context.textBaseline = 'alphabetic'
  context.fillText(labels.validLine, COURT.inset + 7, vLine.sideY - 10)
  context.fillText(labels.throwLine, COURT.inset + 7, COURT.throwLine - 8)

  context.strokeStyle = '#5b6c64'
  context.lineWidth = 1.5
  const penalty = COURT.penaltyBox
  const penaltyLeft = penalty.centreX - penalty.size / 2
  const penaltyTop = penalty.centreY - penalty.size / 2
  context.fillStyle = '#f7f7f0'
  context.fillRect(penaltyLeft, penaltyTop, penalty.size, penalty.size)
  context.strokeStyle = '#263c34'
  context.lineWidth = 2.5
  context.strokeRect(penaltyLeft, penaltyTop, penalty.size, penalty.size)
  context.lineWidth = 1.8
  context.beginPath()
  context.moveTo(penalty.centreX, penaltyTop)
  context.lineTo(penalty.centreX, penaltyTop + penalty.size)
  context.moveTo(penaltyLeft, penalty.centreY)
  context.lineTo(penaltyLeft + penalty.size, penalty.centreY)
  context.stroke()

  context.strokeStyle = '#5b6c64'
  context.lineWidth = 1.5
  context.beginPath()
  context.moveTo(COURT.centre.x - 8, COURT.centre.y); context.lineTo(COURT.centre.x + 8, COURT.centre.y)
  context.moveTo(COURT.centre.x, COURT.centre.y - 8); context.lineTo(COURT.centre.x, COURT.centre.y + 8)
  context.stroke()

  if (interactive) {
    const radians = aim.angle * Math.PI / 180
    const startX = COURT.width / 2
    const startY = COURT.throwLine + 35
    const length = 235
    const targetX = startX + Math.sin(radians) * length
    const targetY = startY - Math.cos(radians) * length
    context.save()
    context.setLineDash([8, 7])
    context.strokeStyle = '#c58f17'
    context.lineWidth = 3
    context.beginPath(); context.moveTo(startX, startY); context.lineTo(targetX, targetY); context.stroke()
    context.setLineDash([])
    context.fillStyle = '#fff7d8'; context.strokeStyle = '#815d0f'; context.lineWidth = 2
    context.beginPath(); context.arc(targetX, targetY, 10, 0, Math.PI * 2); context.fill(); context.stroke()
    context.restore()
  }
  balls.forEach((ball) => drawBall(context, ball))
}

function BocciaCourt({ simulationRef, busy, aim, interactive, onSettled, t, reducedMotion }) {
  const canvasRef = useRef(null)
  const latestRef = useRef({ busy, aim, interactive, onSettled, t, reducedMotion })
  latestRef.current = { busy, aim, interactive, onSettled, t, reducedMotion }

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    let frame = 0
    let lastTime = performance.now()
    let paused = document.hidden
    let settlementSent = false

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = COURT.width * dpr
      canvas.height = COURT.height * dpr
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const visibility = () => { paused = document.hidden; lastTime = performance.now() }
    resize()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', visibility)

    const tick = (time) => {
      const current = latestRef.current
      if (!paused && current.busy) {
        const elapsed = current.reducedMotion ? Math.min((time - lastTime) / 1000 * 2.5, 0.05) : Math.min((time - lastTime) / 1000, 0.05)
        simulationRef.current = stepPhysics(simulationRef.current, elapsed)
        if (areAllBallsStopped(simulationRef.current) && !settlementSent) {
          settlementSent = true
          queueMicrotask(() => current.onSettled(simulationRef.current))
        }
      } else if (!current.busy) settlementSent = false
      lastTime = time
      drawCourt(context, simulationRef.current, current.aim, current.interactive, {
        validLine: current.t('validLine'), throwLine: current.t('throwLine'),
      })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [simulationRef])

  return (
    <canvas
      ref={canvasRef}
      className="boccia-court"
      role="img"
      aria-label={t('canvasLabel')}
    />
  )
}

export default memo(BocciaCourt)
