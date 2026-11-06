export const games = [
  {
    id: 'asteroids',
    label: 'Asteroids',
    description: 'Pilot your ship. Clear the field.',
  },
  {
    id: 'snake',
    label: 'Snake',
    description: 'Follow the food. Mind your tail.',
  },
  {
    id: 'breakout',
    label: 'Breakout',
    description: 'Keep the ball alive. Break every brick.',
  },
  {
    id: 'lights-out',
    label: 'Lights Out',
    description: 'One switch changes everything. Find the dark.',
  },
  {
    id: 'pixel-studio',
    label: 'Pixel Studio',
    description: 'A little canvas. Make something yours.',
  },
  {
    id: 'beat-lab',
    label: 'Beat Lab',
    description: 'Four tracks. Eight steps. Find your rhythm.',
  },
  {
    id: 'gravity-sling',
    label: 'Gravity Sling',
    description: 'Aim a little wider. Let gravity do the rest.',
  },
  {
    id: 'prism-relay',
    label: 'Prism Relay',
    description: 'Turn the mirrors. Bring the light home.',
  },
] as const

export type GameId = (typeof games)[number]['id']

export function parseGameId(value: unknown): GameId | null {
  return games.find(game => game.id === value)?.id ?? null
}

export function parseGameRoute(route?: string): GameId | null {
  const query = route?.split('?')[1]?.split('#')[0] ?? ''
  return parseGameId(new URLSearchParams(query).get('game'))
}

export function gameRoute(game: GameId): string {
  return `/arcade?game=${game}`
}
