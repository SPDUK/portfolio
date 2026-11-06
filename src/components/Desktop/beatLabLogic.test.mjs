import assert from 'node:assert/strict'
import test from 'node:test'
import {
  hasBeat,
  readBeatSession,
  scheduleBeatWindow,
  toggleBeat,
} from './beatLabLogic.ts'

test('Toggling a pad affects only that instrument and step, and toggles back off', () => {
  const pattern = [1, 0, 170, 33]
  const edited = toggleBeat(pattern, 1, 7)
  assert.equal(hasBeat(edited, 1, 7), true)
  assert.deepEqual(edited, [1, 128, 170, 33])
  assert.deepEqual(pattern, [1, 0, 170, 33])
  assert.deepEqual(toggleBeat(edited, 1, 7), pattern)
  assert.equal(hasBeat(edited, 1, 0), false)
})

test('Saved rhythms round trip, including silence and tempo boundaries', () => {
  for (const tempo of [60, 104, 160]) {
    const session = { pattern: [0, 255, 170, 33], tempo }
    assert.deepEqual(readBeatSession(JSON.stringify(session)), session)
  }
  for (const value of [
    null,
    '',
    'broken',
    'null',
    '[]',
    '{"pattern":[1,2,3],"tempo":100}',
    '{"pattern":[0,0,0,256],"tempo":100}',
    '{"pattern":[0,0,-1,0],"tempo":100}',
    '{"pattern":[0,0,0.5,0],"tempo":100}',
    '{"pattern":[0,0,"1",0],"tempo":100}',
    '{"pattern":[0,0,0,0],"tempo":59}',
    '{"pattern":[0,0,0,0],"tempo":161}',
    '{"pattern":[0,0,0,0],"tempo":"104"}',
  ]) {
    assert.equal(readBeatSession(value), null)
  }
})

test('The audio scheduler loops all eight eighth notes without duplicate hits', () => {
  let cursor = { step: 0, time: 0.035 }
  const events = []
  for (let tick = 0; tick < 80; tick += 1) {
    const result = scheduleBeatWindow(cursor, tick * 0.025, 120)
    events.push(...result.events)
    cursor = result.cursor
  }
  assert.deepEqual(
    events.slice(0, 8).map(event => event.step),
    [0, 1, 2, 3, 4, 5, 6, 7],
  )
  assert.equal(events[8].step, 0)
  for (let index = 1; index < events.length; index += 1) {
    assert.ok(
      Math.abs(events[index].time - events[index - 1].time - 0.25) < 0.00001,
    )
  }
})

test('A stalled audio scheduler skips overdue time rather than bursting old notes', () => {
  const result = scheduleBeatWindow({ step: 3, time: 0.2 }, 50, 160)
  assert.deepEqual(result.events, [{ step: 3, time: 50.02 }])
  assert.equal(result.cursor.step, 4)
  assert.ok(result.cursor.time > 50.2)
  assert.deepEqual(scheduleBeatWindow(result.cursor, 50.025, 160).events, [])
})
