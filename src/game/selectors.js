import { leadingSide } from './scoring.js'

export function courtSummary(state, t) {
  const lead = state.jack ? leadingSide(state.balls, state.jack) : { side: null, distance: null }
  const closest = !lead.side
    ? t('noClosestSummary')
    : t('closestSummary', {
      side: lead.side === 'red' ? t('redBall') : lead.side === 'blue' ? t('blueBall') : t('tied'),
      distance: Math.round(lead.distance),
    })
  return `${closest} ${t('ballsSummary', state.remaining)}`
}

export function coachTip(state) {
  if (state.lastShotOut) return 'coachHard'
  if (state.power > 82) return 'coachHard'
  if (!state.jack) return 'coachSide'
  const lead = leadingSide(state.balls, state.jack)
  if (lead.side === 'red' && lead.distance < 45) return 'coachProtect'
  if (lead.side === 'red') return 'coachCloser'
  if (lead.side === 'blue' && lead.distance < 45) return 'coachHit'
  if (state.power > 64) return 'coachSofter'
  return 'coachSide'
}
