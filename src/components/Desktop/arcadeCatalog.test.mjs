import assert from 'node:assert/strict'
import test from 'node:test'
import {
  games,
  gameRoute,
  parseGameId,
  parseGameRoute,
} from './arcadeCatalog.ts'

test('The catalog and route builder round trip every game', () => {
  assert.deepEqual(
    games.map(game => game.id),
    [
      'asteroids',
      'snake',
      'breakout',
      'lights-out',
      'pixel-studio',
      'beat-lab',
      'gravity-sling',
      'prism-relay',
    ],
  )
  for (const game of games) {
    assert.equal(parseGameId(game.id), game.id)
    assert.equal(gameRoute(game.id), `/arcade?game=${game.id}`)
    assert.equal(parseGameRoute(gameRoute(game.id)), game.id)
  }
})

test('Game routes parse the exact query parameter rather than substrings', () => {
  assert.equal(parseGameRoute('/arcade?game=asteroids&from=dock'), 'asteroids')
  assert.equal(
    parseGameRoute('/arcade?from=dock&game=breakout#play'),
    'breakout',
  )
  assert.equal(parseGameRoute('/arcade?game=%61steroids'), 'asteroids')
  assert.equal(parseGameRoute('/arcade?game=snake'), 'snake')
  for (const route of [
    undefined,
    '',
    '/arcade',
    '/arcade?game=ASTERoids',
    '/arcade?game=breakout-extra',
    '/arcade?other=game=breakout',
    '/arcade?game=unknown',
    '/arcade?game=',
    '/arcade#game=breakout',
  ])
    assert.equal(parseGameRoute(route), null)
  for (const value of [null, undefined, 4, {}, 'BREAKOUT', 'snake ']) {
    assert.equal(parseGameId(value), null)
  }
})
