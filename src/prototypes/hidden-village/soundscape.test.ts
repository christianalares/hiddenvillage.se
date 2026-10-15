import assert from 'node:assert/strict'
import { test } from 'node:test'
import { FootstepCadence, soundscapeAt, sourcePan, SoundPose } from './soundscape-model'

test('the exposed moor and ridge have more wind than the sheltered village', () => {
  assert.ok(soundscapeAt(-9, 205).wind > soundscapeAt(0, 5).wind * 3)
  assert.ok(soundscapeAt(-90, 123).wind > soundscapeAt(-9, 123).wind * 3)
  assert.ok(soundscapeAt(-80, -28).wind < soundscapeAt(-90, 123).wind)
})

test('water follows the crossing and pond; footfall materials follow the route', () => {
  assert.equal(soundscapeAt(-3, 54).surface, 'wood')
  assert.equal(soundscapeAt(0, 5).surface, 'stone')
  assert.equal(soundscapeAt(-9, 205).surface, 'grass')
  assert.equal(soundscapeAt(-9, 80).surface, 'leaves')
  assert.ok(soundscapeAt(-3, 54).water > .5)
  assert.ok(soundscapeAt(-25, -26).water > .25)
  assert.equal(soundscapeAt(-90, 123).water, 0)
  assert.equal(soundscapeAt(0, -62).water, 0)
})

test('the last light releases tension; all mix levels stay bounded across the world', () => {
  assert.ok(soundscapeAt(0, -62).score < soundscapeAt(-9, 81).score / 2)
  for (let x = -120; x < 40; x += 2) for (let z = -65; z <= 210; z += 2) {
    const mix = soundscapeAt(x, z)
    for (const level of [mix.woodland, mix.wind, mix.water, mix.score]) assert.ok(level >= 0 && level <= 1)
  }
})

test('a fixed sound changes ears when the listener turns around', () => {
  const pose: SoundPose = { x: 0, y: 2, z: 0, forwardX: 0, forwardZ: -1, metres: 0, walking: false }
  assert.equal(sourcePan(pose, 10, 0), .85)
  assert.equal(sourcePan({ ...pose, forwardZ: 1 }, 10, 0), -.85)
  assert.equal(sourcePan(pose, 0, -10), 0)
  assert.equal(sourcePan({ ...pose, forwardZ: 0 }, 10, 0), 0)
})

test('steps follow forward and backward travel, never looking or inspection', () => {
  const cadence = new FootstepCadence()
  assert.equal(cadence.update(0, 0, true), false)
  assert.equal(cadence.update(.4, .3, true), false)
  assert.equal(cadence.update(.9, .6, true), true)
  assert.equal(cadence.update(0, 1.2, true), true)
  assert.equal(cadence.update(0, 4, true), false)
  assert.equal(cadence.update(3, 5, false), false)
  assert.equal(cadence.update(3, 6, true), false)
})

test('fast scrolling is rate limited without queued steps after stopping', () => {
  const cadence = new FootstepCadence()
  cadence.update(0, 0, true)
  assert.equal(cadence.update(4, .1, true), true)
  assert.equal(cadence.update(8, .2, true), false)
  assert.equal(cadence.update(12, .3, true), false)
  assert.equal(cadence.update(16, .4, true), true)
  assert.equal(cadence.update(16, .8, false), false)
  assert.equal(cadence.update(16.1, 1, true), false)
})

test('teleports, muted travel and hidden-tab resumes cannot emit a backlog', () => {
  const cadence = new FootstepCadence()
  cadence.update(0, 0, true)
  assert.equal(cadence.update(80, .1, true), false)
  assert.equal(cadence.update(80, 1, false), false)
  cadence.reset()
  assert.equal(cadence.update(140, 10, true), false)
  assert.equal(cadence.update(141, 10.5, true), true)
})
