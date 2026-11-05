import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultPreferences, readPreferences } from './model.ts'

test('retired wallpapers migrate to Afterglow without resetting other preferences', () => {
  for (const wallpaper of ['eclipse', 'cinder', 'red-rain']) {
    assert.deepEqual(
      readPreferences(
        JSON.stringify({ wallpaper, motion: false, sound: true }),
      ),
      { wallpaper: 'afterglow', motion: false, sound: true },
    )
  }
})

test('each replacement wallpaper survives restoring a saved session', () => {
  for (const wallpaper of [
    'afterglow',
    'night-drive',
    'redshift',
    'feedback',
    'last-train',
  ]) {
    const saved = { wallpaper, motion: false, sound: true }
    assert.deepEqual(readPreferences(JSON.stringify(saved)), saved)
  }
})

test('missing or unreadable preferences fall back to the new default', () => {
  assert.equal(defaultPreferences.wallpaper, 'afterglow')
  for (const value of [null, '', '{broken', 'null', '[]']) {
    assert.deepEqual(readPreferences(value), defaultPreferences)
  }
})
