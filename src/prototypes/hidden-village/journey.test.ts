import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Journey, forkStop, progressAt } from './journey'
import { routePosition } from './trail'
import { RouteDistance } from './route-distance'

test('a single End key, scrollbar drag or large swipe stops at the first unresolved fork', () => {
  const walk = new Journey()
  assert.equal(walk.request(1), progressAt(forkStop('ridge')))
  assert.equal(walk.pending, 'ridge')
  assert.equal(walk.request(1), progressAt(forkStop('ridge')))
  assert.equal(walk.request(0), progressAt(forkStop('ridge')))
})

test('either sign commits exactly six metres and discards momentum during departure', () => {
  for (const side of [true, false]) {
    const walk = new Journey()
    walk.request(1)
    const to = walk.choose(side)!
    assert.equal(walk.choices.ridge, side)
    const route = new RouteDistance(walk.choices)
    assert.ok(Math.abs(route.metres(to) - route.metres(progressAt(157)) - 6) < 1e-6)
    assert.equal(walk.choose(!side), null)
    assert.equal(walk.request(1), to)
    walk.arrive(to)
    assert.equal(walk.launching, null)
    assert.equal(walk.target, to)
    assert.equal(walk.request(1), progressAt(forkStop('pond')))
    assert.equal(walk.pending, 'pond')
  }
})

test('both forks gate travel, then free travel resumes to the last house', () => {
  const walk = new Journey()
  for (const id of ['ridge', 'pond']) {
    walk.request(1)
    assert.equal(walk.pending, id)
    walk.arrive(walk.choose(true)!)
  }
  assert.equal(walk.request(1), 1)
  assert.equal(walk.request(0.9), 0.9)
})

test('returning reopens a choice only after the camera has safely left its branch', () => {
  const walk = new Journey()
  walk.request(1); walk.arrive(walk.choose(true)!)
  walk.request(0)
  // Reversing scroll before the camera returns must not allow a sideways route switch.
  assert.equal(walk.request(progressAt(140)), progressAt(140))
  assert.equal(walk.pending, null)
  walk.arrive(progressAt(165))
  assert.equal(walk.request(1), progressAt(157))
  assert.equal(walk.pending, 'ridge')
})

test('a waypoint behind the sign can leave a pending decision; a forward one cannot bypass it', () => {
  const walk = new Journey()
  walk.request(1)
  assert.equal(walk.backTo(1), false)
  assert.equal(walk.backTo(0), true)
  assert.equal(walk.pending, null)
  assert.equal(walk.request(0), 0)
  assert.equal(walk.request(1), progressAt(157))
})

test('returning to the fork waypoint reopens its signs only after reaching it', () => {
  const walk = new Journey()
  walk.request(1); walk.arrive(walk.choose(true)!)
  const gate = progressAt(157)
  walk.request(gate)
  assert.equal(walk.pending, null)
  walk.arrive(gate)
  assert.equal(walk.pending, 'ridge')
  assert.equal(walk.choose(false), new RouteDistance(walk.choices).advance(gate, 6))
})

test('choosing does not move the camera sideways at either fork', () => {
  for (const id of ['ridge', 'pond'] as const) {
    const choices = { ridge: false, pond: false }
    const before = routePosition(forkStop(id), choices)
    choices[id] = true
    assert.deepEqual(routePosition(forkStop(id), choices), before)
    const departure = routePosition(forkStop(id) - 6, choices)
    const main = routePosition(forkStop(id) - 6, { ridge: false, pond: false })
    assert.ok(departure.x < main.x - 1, 'the guided departure visibly enters the chosen branch')
  }
})


test('scroll distance round trips on every combination and detours substantially extend the walk', () => {
  const main = new RouteDistance({ ridge: false, pond: false })
  const both = new RouteDistance({ ridge: true, pond: true })
  assert.ok(both.length > main.length * 1.8)
  for (const ridge of [true, false]) for (const pond of [true, false]) {
    const route = new RouteDistance({ ridge, pond })
    for (let i = 0; i <= 200; i++) assert.ok(Math.abs(route.progress(route.metres(i / 200)) - i / 200) < 1e-8)
  }
})

test('selecting a detour keeps every earlier scroll position stable', () => {
  const main = new RouteDistance({ ridge: false, pond: false })
  const ridge = new RouteDistance({ ridge: true, pond: false })
  const both = new RouteDistance({ ridge: true, pond: true })
  assert.equal(main.metres(progressAt(forkStop('ridge'))), ridge.metres(progressAt(forkStop('ridge'))))
  assert.equal(ridge.metres(progressAt(forkStop('pond'))), both.metres(progressAt(forkStop('pond'))))
})


test('returning to a fork survives browser scroll-pixel rounding on a long route', () => {
  const walk = new Journey(); walk.request(1); walk.arrive(walk.choose(true)!)
  const route = new RouteDistance(walk.choices), gate = progressAt(forkStop('ridge'))
  const rounded = Math.round(route.metres(gate) * 25) / 25
  const destination = route.progress(rounded, [gate])
  walk.request(destination); walk.arrive(destination)
  assert.equal(walk.pending, 'ridge')
})
