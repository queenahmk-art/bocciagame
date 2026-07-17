import { DIFFICULTIES } from './constants.js'

export const LEADERBOARD_STORAGE_KEY = 'boccia-leaderboard-v1'
export const MAX_PLAYER_NAME_LENGTH = 24
export const MAX_LEADERBOARD_ENTRIES = 50

const POINTS_PER_BALL = Object.freeze({
  [DIFFICULTIES.BEGINNER]: 100,
  [DIFFICULTIES.TACTICAL]: 200,
})

export function normalizePlayerName(value = '') {
  return String(value).trim().replace(/\s+/g, ' ').slice(0, MAX_PLAYER_NAME_LENGTH)
}

export function pointsPerBall(difficulty) {
  return POINTS_PER_BALL[difficulty] ?? POINTS_PER_BALL[DIFFICULTIES.BEGINNER]
}

export function calculateLeaderboardScore(ballsScored, difficulty) {
  const validBalls = Math.max(0, Math.floor(Number(ballsScored) || 0))
  return validBalls * pointsPerBall(difficulty)
}

export function createLeaderboardEntry({ id, playerName, difficulty, ballsScored, completedAt }) {
  const name = normalizePlayerName(playerName)
  const validDifficulty = difficulty === DIFFICULTIES.TACTICAL ? DIFFICULTIES.TACTICAL : DIFFICULTIES.BEGINNER
  const validBalls = Math.max(0, Math.floor(Number(ballsScored) || 0))
  return {
    id: String(id),
    playerName: name,
    difficulty: validDifficulty,
    ballsScored: validBalls,
    score: calculateLeaderboardScore(validBalls, validDifficulty),
    completedAt: String(completedAt),
  }
}

function isValidEntry(entry) {
  return entry && typeof entry.id === 'string' && normalizePlayerName(entry.playerName)
    && [DIFFICULTIES.BEGINNER, DIFFICULTIES.TACTICAL].includes(entry.difficulty)
    && Number.isFinite(entry.ballsScored)
}

export function rankLeaderboard(entries = []) {
  return entries.filter(isValidEntry).map((entry) => ({
    ...entry,
    playerName: normalizePlayerName(entry.playerName),
    ballsScored: Math.max(0, Math.floor(entry.ballsScored)),
    score: calculateLeaderboardScore(entry.ballsScored, entry.difficulty),
  })).sort((first, second) => second.score - first.score
    || second.ballsScored - first.ballsScored
    || String(first.completedAt).localeCompare(String(second.completedAt)))
}

export function readLeaderboard(storage = globalThis.localStorage) {
  try {
    const saved = JSON.parse(storage?.getItem(LEADERBOARD_STORAGE_KEY) ?? '[]')
    return rankLeaderboard(Array.isArray(saved) ? saved : [])
  } catch {
    return []
  }
}

export function recordLeaderboardEntry(entry, storage = globalThis.localStorage) {
  const ranked = rankLeaderboard([...readLeaderboard(storage), entry]).slice(0, MAX_LEADERBOARD_ENTRIES)
  try { storage?.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(ranked)) } catch { /* Storage can be unavailable in private browsing. */ }
  return ranked
}
