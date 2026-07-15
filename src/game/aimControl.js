const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

export function angleFromAimPad(clientX, clientY, rect) {
  const originX = rect.left + rect.width / 2
  const originY = rect.top + rect.height * 0.72
  const dx = clientX - originX
  const minimumForward = Math.max(rect.height * 0.12, 1)
  const dy = Math.min(clientY - originY, -minimumForward)
  return clamp(Math.atan2(dx, -dy) * 180 / Math.PI, -34, 34)
}

export function nudgeAimAngle(angle, direction) {
  return clamp(angle + direction, -34, 34)
}
