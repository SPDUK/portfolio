export const games = [
  { id: 'asteroids', label: 'Asteroids' },
  { id: 'snake', label: 'Snake' },
  { id: 'breakout', label: 'Breakout' },
] as const

export type GameId = (typeof games)[number]['id']

export function parseGameId(value: unknown): GameId | null {
  return games.find(game => game.id === value)?.id ?? null
}

export function parseGameRoute(route?: string): GameId {
  const query = route?.split('?')[1]?.split('#')[0] ?? ''
  return parseGameId(new URLSearchParams(query).get('game')) ?? 'snake'
}

export function gameRoute(game: GameId): string {
  return game === 'snake' ? '/arcade' : `/arcade?game=${game}`
}
