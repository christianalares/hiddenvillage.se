import { FootstepCadence, soundscapeAt, sourcePan, SoundPose } from './soundscape-model'

type LoopName = 'woodland' | 'ridge-wind' | 'stream' | 'hushed-score'
type Loop = { gain: GainNode; pan: StereoPannerNode; target: number }
type Emitter = { source: AudioBufferSourceNode; gain: GainNode; pan: StereoPannerNode; x: number; z: number }

/** Field recordings share the narration-ducked master, but have their own spatial mix. */
export function createSoundscape(context: AudioContext, output: AudioNode, buffer: (name: string) => Promise<AudioBuffer>) {
  let active = false, generation = 0, timer = 0, stepIndex = 0, lastUpdate = -Infinity
  let pose: SoundPose = { x: 0, y: 40, z: 210, forwardX: 0, forwardZ: -1, metres: 0, walking: false }
  const cadence = new FootstepCadence()
  const loops = new Map<LoopName, Loop>()
  const pending = new Set<LoopName>()
  const footsteps = new Set<AudioBufferSourceNode>()
  const emitters = new Set<Emitter>()
  const bed = context.createGain()
  bed.gain.value = 0
  bed.connect(output)
  // A little filtered reflected sound places distant calls in the trees.
  const echo = context.createDelay(1), echoFilter = context.createBiquadFilter(), echoGain = context.createGain()
  echo.delayTime.value = .32; echoFilter.type = 'lowpass'; echoFilter.frequency.value = 1350; echoGain.gain.value = .14
  echo.connect(echoFilter).connect(echoGain).connect(bed)

  function mix() {
    const levels = soundscapeAt(pose.x, pose.z)
    const targets = { woodland: levels.woodland, 'ridge-wind': levels.wind, stream: levels.water, 'hushed-score': levels.score }
    loops.forEach((loop, name) => {
      const target = targets[name]
      if (Math.abs(loop.target - target) > .003) {
        loop.target = target
        loop.gain.gain.setTargetAtTime(target, context.currentTime, name === 'hushed-score' ? 4 : 1.4)
      }
      const pan = name === 'stream' ? sourcePan(pose, levels.waterX, levels.waterZ)
        : name === 'ridge-wind' ? Math.sin(context.currentTime * .11) * .22 : 0
      loop.pan.pan.setTargetAtTime(pan, context.currentTime, .4)
    })
    emitters.forEach(emitter => emitter.pan.pan.setTargetAtTime(sourcePan(pose, emitter.x, emitter.z), context.currentTime, .12))
  }

  async function startLoop(name: LoopName) {
    if (loops.has(name) || pending.has(name)) return
    pending.add(name)
    try {
      const clip = await buffer(name)
      const source = context.createBufferSource(), gain = context.createGain(), pan = context.createStereoPanner()
      source.buffer = clip; source.loop = true; gain.gain.value = 0
      source.connect(gain).connect(pan).connect(bed)
      loops.set(name, { gain, pan, target: -1 })
      // Different loop lengths and offsets avoid a repeated synchronised sound collage.
      source.start(0, Math.random() * clip.duration)
      mix()
    } catch {
      // An unavailable decorative layer must not interrupt reading or the walk.
      // It is retried on the next sound gesture.
    } finally { pending.delete(name) }
  }

  async function event(name: string, x: number, z: number, volume: number) {
    const request = generation
    try {
      const clip = await buffer(name)
      if (!active || request !== generation || document.hidden) return
      const source = context.createBufferSource(), gain = context.createGain(), pan = context.createStereoPanner()
      source.buffer = clip
      source.playbackRate.value = .96 + Math.random() * .08
      gain.gain.value = volume; pan.pan.value = sourcePan(pose, x, z)
      source.connect(gain).connect(pan).connect(bed); pan.connect(echo)
      const emitter = { source, gain, pan, x, z }; emitters.add(emitter)
      source.onended = () => { source.disconnect(); gain.disconnect(); pan.disconnect(); emitters.delete(emitter) }
      source.start()
    } catch { /* Continue the other layers when an optional sound is unavailable. */ }
  }

  function distantEvent() {
    if (!active || document.hidden) return
    const timbers = [{ x: -3, z: 54.5 }, { x: -5, z: 30 }, { x: -78, z: -26 }, { x: 2, z: -57 }]
    const timber = timbers.sort((a, b) => Math.hypot(pose.x - a.x, pose.z - a.z) - Math.hypot(pose.x - b.x, pose.z - b.z))[0]
    if (Math.hypot(pose.x - timber.x, pose.z - timber.z) < 20 && Math.random() < .45) {
      void event('wood-creak', timber.x, timber.z, .14)
    } else {
      const trees = [{ x: 15, z: 174 }, { x: 22, z: 132 }, { x: -112, z: 118 }, { x: 14, z: 77 }, { x: -98, z: -18 }, { x: 20, z: -41 }]
      const nearby = trees.filter(tree => Math.hypot(pose.x - tree.x, pose.z - tree.z) < 85)
      const tree = nearby[Math.floor(Math.random() * nearby.length)]
      if (tree) {
        const distance = Math.hypot(pose.x - tree.x, pose.z - tree.z)
        void event('owl', tree.x, tree.z, .13 * (1 - distance / 120))
      }
    }
    timer = window.setTimeout(distantEvent, 21000 + Math.random() * 23000)
  }

  async function step() {
    const request = generation, requestedAt = context.currentTime
    const surface = soundscapeAt(pose.x, pose.z).surface
    const index = stepIndex++
    const variant = (index + Math.floor(index / 4)) % 4 + 1
    try {
      const clip = await buffer(`step-${surface}-${variant}`)
      // Never play a late downloaded step after the visitor has stopped or opened a letter.
      if (!active || request !== generation || document.hidden || !pose.walking || context.currentTime - requestedAt > .12 || context.currentTime - lastUpdate > .2) return
      const source = context.createBufferSource(), gain = context.createGain(), pan = context.createStereoPanner()
      source.buffer = clip; source.playbackRate.value = .94 + Math.random() * .12
      gain.gain.value = (surface === 'wood' ? .36 : .29) * (.88 + Math.random() * .24)
      pan.pan.value = index % 2 ? .10 : -.10
      source.connect(gain).connect(pan).connect(bed); footsteps.add(source)
      source.onended = () => { source.disconnect(); gain.disconnect(); pan.disconnect(); footsteps.delete(source) }
      source.start()
    } catch { /* Footsteps are optional if a request fails. */ }
  }

  return {
    start() {
      if (active) return
      active = true; generation++; cadence.reset()
      bed.gain.setTargetAtTime(1, context.currentTime, 1.2)
      for (const name of ['woodland', 'ridge-wind', 'stream', 'hushed-score'] as const) void startLoop(name)
      for (const surface of ['grass', 'leaves', 'wood', 'stone']) for (let n = 1; n <= 4; n++) void buffer(`step-${surface}-${n}`).catch(() => {})
      void buffer('owl').catch(() => {}); void buffer('wood-creak').catch(() => {})
      timer = window.setTimeout(distantEvent, 9000 + Math.random() * 5000)
      mix()
    },
    pause() {
      active = false; generation++; clearTimeout(timer); cadence.reset()
      bed.gain.cancelScheduledValues(context.currentTime); bed.gain.setValueAtTime(0, context.currentTime)
      footsteps.forEach(source => source.stop())
      emitters.forEach(emitter => emitter.source.stop())
    },
    update(next: SoundPose) {
      pose = next; lastUpdate = context.currentTime
      if (!active) return
      mix()
      if (cadence.update(pose.metres, context.currentTime, pose.walking)) void step()
    },
  }
}
