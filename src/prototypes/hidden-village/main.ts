// Continuous camera path with a richer, single-scene environment.
import * as THREE from 'three'
import { buildWorld } from './world'
import { branches, BranchId, routePosition } from './trail'
import { Journey, branchIds, forkStop, progressAt, zAt } from './journey'
import { RouteDistance } from './route-distance'
import { addStories } from './stories'
import { createInspection } from './inspection'
import { createSound } from './sound'
import { addInspectables } from './inspectables'
import { addPlayableDrums } from './drums'
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

async function start() {
history.scrollRestoration = 'manual'
window.scrollTo(0, 0)
const mount = document.getElementById('mount')!
const caption = document.getElementById('caption')!
const place = document.getElementById('place')!
const description = document.getElementById('description')!
const contact = document.getElementById('contact')!
const instruction = document.getElementById('instruction')!
const progressBar = document.getElementById('progress')!

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 640 ? 1 : 1.25))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.3
renderer.setClearColor('#111b22')
mount.appendChild(renderer.domElement)

const scene = new THREE.Scene()
scene.background = new THREE.Color('#111b22')
scene.fog = new THREE.FogExp2('#2d4047', 0.0095)
const camera = new THREE.PerspectiveCamera(61, window.innerWidth / window.innerHeight, 0.15, 150)
// A soft, slowly moving cloud layer gives the sky depth with one small texture lookup.
const cloudCanvas=document.createElement('canvas');cloudCanvas.width=1024;cloudCanvas.height=256
const clouds=cloudCanvas.getContext('2d')!
let cloudSeed=912
const cloudRandom=()=>{cloudSeed=(cloudSeed*16807)%2147483647;return cloudSeed/2147483647}
for(let i=0;i<70;i++){
  const x=cloudRandom()*1024,y=cloudRandom()*210+20,w=cloudRandom()*100+55,h=cloudRandom()*18+8
  for(const shift of [-1024,0,1024]){clouds.save();clouds.translate(x+shift,y);clouds.scale(w,h);const wash=clouds.createRadialGradient(0,0,0,0,0,1);wash.addColorStop(0,'rgba(8,17,24,.17)');wash.addColorStop(1,'rgba(8,17,24,0)');clouds.fillStyle=wash;clouds.fillRect(-1,-1,2,2);clouds.restore()}
}
const cloudMap=new THREE.CanvasTexture(cloudCanvas);cloudMap.wrapS=THREE.RepeatWrapping
const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { horizon: { value: new THREE.Color('#40565c') }, zenith: { value: new THREE.Color('#0b151e') }, cloudMap:{value:cloudMap},time:{value:0} },
  vertexShader: 'varying vec3 direction; varying vec2 skyUv; void main(){ direction = normalize(position); skyUv=uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position.z = gl_Position.w; }',
  fragmentShader: 'uniform vec3 horizon; uniform vec3 zenith; uniform sampler2D cloudMap; uniform float time; varying vec3 direction; varying vec2 skyUv; void main(){ float h = smoothstep(-0.02, .55, direction.y); vec3 sky=mix(horizon, zenith, h); float cloud=texture2D(cloudMap,vec2(skyUv.x+time*.00035,skyUv.y*2.)).a*smoothstep(0.,.2,direction.y); gl_FragColor = vec4(mix(sky,vec3(.025,.045,.055),cloud*.55), 1.0);\n #include <tonemapping_fragment>\n #include <colorspace_fragment> }',
}))
sky.frustumCulled = false
sky.renderOrder = -1
scene.add(sky)

scene.add(new THREE.HemisphereLight('#9aafc1', '#19211b', 1.35))
const moonLight = new THREE.DirectionalLight('#a6bfd1', 1.65)
moonLight.position.set(-17, 28, -22)
scene.add(moonLight)

const moonHaloCanvas = document.createElement('canvas')
moonHaloCanvas.width = moonHaloCanvas.height = 128
const haloContext = moonHaloCanvas.getContext('2d')!
const haloGradient = haloContext.createRadialGradient(64, 64, 4, 64, 64, 64)
haloGradient.addColorStop(0, 'rgba(227,236,238,0.45)')
haloGradient.addColorStop(0.2, 'rgba(198,218,229,0.16)')
haloGradient.addColorStop(1, 'rgba(198,218,229,0)')
haloContext.fillStyle = haloGradient
haloContext.fillRect(0, 0, 128, 128)
const moonHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(moonHaloCanvas), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }))
moonHalo.position.set(20, 33, -105)
moonHalo.scale.set(15, 15, 1)
scene.add(moonHalo)
const moon = new THREE.Mesh(new THREE.SphereGeometry(1.4, 24, 16), new THREE.MeshBasicMaterial({ color: '#cbd3d0', fog: false }))
moon.position.copy(moonHalo.position)
scene.add(moon)

instruction.textContent = 'Preparing the woodland…'
const { houseLights, motes, forkSigns, discoveries, inspectables, drumParts, wildlifeNearby, update } = await buildWorld(scene).catch(error => {
  instruction.textContent = 'The woodland could not load. Please reload to try again.'
  mount.dataset.state = 'error'
  throw error
})
mount.dataset.state = 'ready'
window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
// Native document scrolling owns speed, momentum, keyboard travel and the scrollbar.
const scrollRange = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
const scrollProgress = () => route.progress(clamp(window.scrollY / scrollRange(), 0, 1) * route.length, branchIds.map(id => progressAt(forkStop(id))))
const journey = new Journey()
const choices = journey.choices
let route = new RouteDistance(choices)
function resizeRunway() { (document.querySelector('.scroll-runway') as HTMLElement).style.height = `calc(100vh + ${route.length * 25}px)` }
resizeRunway()
const fork = document.getElementById('fork-signs')!
const journeyStatus = document.getElementById('journey-status')!
const branchButton = document.getElementById('branch-route') as HTMLButtonElement
const mainButton = document.getElementById('main-route') as HTMLButtonElement
let activeFork: BranchId | null = null
let scrollLocked = false
let keyboardTravel = false
let launch: { from: number; to: number; elapsed: number } | null = null
let scrollAnchor = 0

// Constant light count. Emissive panes and baked ground pools remain visible at any distance.
const lightSources = houseLights.map(light => {
  light.removeFromParent()
  return { position: light.position.clone(), intensity: light.intensity, color: light.color }
})
const nearbyLights = [new THREE.PointLight('#edb16c', 0, 12, 1.7), new THREE.PointLight('#edb16c', 0, 12, 1.7)]
scene.add(...nearbyLights)

const chapters = [
  { until: 192, place: 'THE HIGH MOOR', title: 'You found the way in.', description: 'Hi, I’m Christian. Welcome to my little corner of the internet.' },
  { until: 110, place: 'THE BIRCH HOLLOW', title: 'Follow the light.', description: '' },
  { until: 88, place: 'THE WOODS', title: '', description: '' },
  { until: 68, place: 'THE RIDGE', title: '', description: '' },
  { until: 46, place: 'THE CROSSING', title: '', description: '' },
  { until: 13, place: 'THE WORKSHOP', title: 'An idea left open.', description: '' },
  { until: -8, place: 'THE SQUARE', title: '', description: '' },
  { until: -54, place: 'THE VILLAGE LANES', title: '', description: '' },
  { until: -Infinity, place: 'THE LAST LIGHT', title: 'Make yourself at home.', description: '' },
]
let visibleChapter = ''
let target = journey.request(scrollProgress())
let current = target
let lastTime = performance.now()
let frameRequest = 0
let idleTimer = 0
let frameCount = 0
let contextLost = false
let weatherTime = 0
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
let reducedMotion = motionPreference.matches
let motion = !reducedMotion
const nextPoint = new THREE.Vector3()
const lookPoint = new THREE.Vector3()
const tangent = new THREE.Vector3()
const pondGaze = new THREE.Vector3()
const projected = new THREE.Vector3()
let lookYaw = 0, lookPitch = 0, courtYaw = 0, courtPitch = 0, returnLook = false, dragging = false
let pointerStart = { x: 0, y: 0 }, pointerLast = { x: 0, y: 0 }
const lookRotation = new THREE.Quaternion(), lookEuler = new THREE.Euler(0, 0, 0, 'YXZ')
function readingChanged(reading: boolean) {
  document.documentElement.classList.toggle('reading', reading)
  if (reading) { target = current; syncScroll(current) }
  else { lastTime = performance.now(); returnLook = true; document.getElementById('inspection-controls')!.hidden = true }
  wake()
}
const inspection = createInspection(camera, readingChanged, wake)
const sound = createSound()
const stories = await addStories(scene, discoveries, inspection, sound, readingChanged, wake)
const updateInspectables = addInspectables(inspectables, inspection, sound)
const drums = addPlayableDrums(drumParts, camera, renderer.domElement, inspection, sound, wake)
for (const [button, side] of [[branchButton, true], [mainButton, false]] as const) {
  for (const name of ['pointerenter', 'focus']) button.addEventListener(name, () => { forkSigns.find(sign => sign.id === activeFork)?.highlight(side); wake() })
  for (const name of ['pointerleave', 'blur']) button.addEventListener(name, () => { forkSigns.forEach(sign => sign.highlight(null)); wake() })
}

function updateProgress() {
  progressBar.style.width = `${route.metres(current) / route.length * 100}%`
  const z = nextPoint.z
  const chapterIndex = chapters.findIndex(chapter => z > chapter.until)
  const side = (Object.keys(branches) as BranchId[]).find(id => choices[id] && z < branches[id].start && z > branches[id].end)
  const chapterKey = side ?? String(chapterIndex)
  if (chapterKey !== visibleChapter) {
    visibleChapter = chapterKey
    const chapter = side === 'ridge'
      ? { place: 'THE HEATHER RIDGE', title: '', description: '' }
      : side === 'pond'
        ? { place: 'THE REED POND', title: '', description: '' }
        : chapters[chapterIndex]
    place.textContent = chapter.place
    caption.textContent = chapter.title
    caption.hidden = !chapter.title
    description.hidden = !chapter.description
    description.textContent = chapter.description
    contact.hidden = chapterIndex !== chapters.length - 1
  }
  const nextFork = journey.pending && Math.abs(target - current) < 0.00001 ? journey.pending : null
  fork.hidden = !nextFork
  document.querySelector('.shell')!.classList.toggle('choosing-path', Boolean(journey.pending || journey.launching))
  document.querySelector('.caption')!.setAttribute('aria-hidden', String(Boolean(journey.pending || journey.launching)))
  if (nextFork !== activeFork) {
    activeFork = nextFork
    if (nextFork) {
      branchButton.setAttribute('aria-label', `Take ${branches[nextFork].title}`)
      mainButton.setAttribute('aria-label', `Take ${branches[nextFork].alternative}`)
      journeyStatus.textContent = `The walk pauses at a signpost. Choose ${branches[nextFork].title} or ${branches[nextFork].alternative}. Use Tab and Enter, or tap a sign. Scroll back to retreat. Escape also steps back.`
      if (keyboardTravel) branchButton.focus({ preventScroll: true })
    }
  }
  if (activeFork) {
    const sign = forkSigns.find(sign => sign.id === activeFork)!
    camera.updateMatrixWorld()
    for (const label of sign.labels) {
      const points = label.corners.map(point => projected.copy(point).project(camera).clone())
      const xs = points.map(point => (point.x + 1) * window.innerWidth / 2)
      const ys = points.map(point => (1 - point.y) * window.innerHeight / 2)
      const button = label.side ? branchButton : mainButton
      button.hidden = points.every(point => point.z > 1 || Math.abs(point.x) > 1.1)
      const top = Math.min(...ys), height = Math.max(44, Math.max(...ys) - top)
      Object.assign(button.style, { left: `${Math.min(...xs)}px`, top: `${top}px`, width: `${Math.max(...xs) - Math.min(...xs)}px`, height: `${height}px` })
    }
  }
  instruction.textContent = activeFork ? 'Choose a sign, or scroll back' : journey.launching ? 'Following the path…'
    : current >= 0.995 ? 'Scroll up to wander back' : 'Scroll to wander · Drag to look around'
}

function chooseRoute(side: boolean) {
  if (!activeFork) return
  returnLook = true
  forkSigns.forEach(sign => sign.highlight(null))
  const name = side ? branches[activeFork].title : branches[activeFork].alternative
  const destination = journey.choose(side)
  if (destination === null) return
  route = new RouteDistance(choices)
  resizeRunway()
  syncScroll(current)
  launch = { from: current, to: destination, elapsed: 0 }
  target = destination
  journeyStatus.textContent = `Taking ${name}.`
  if (document.activeElement === branchButton || document.activeElement === mainButton) (document.activeElement as HTMLElement).blur()
  updateProgress()
  wake()
}
branchButton.addEventListener('click', () => chooseRoute(true))
mainButton.addEventListener('click', () => chooseRoute(false))
motionPreference.addEventListener('change', event => {
  reducedMotion = event.matches; motion = !reducedMotion; wake()
})

function wake() {
  clearTimeout(idleTimer)
  idleTimer = 0
  if (!frameRequest && !document.hidden && !contextLost) frameRequest = requestAnimationFrame(animate)
}
function stopFrames() {
  cancelAnimationFrame(frameRequest)
  clearTimeout(idleTimer)
  frameRequest = idleTimer = 0
}
function animate(time: number) {
  frameRequest = 0
  if (document.hidden || contextLost || stories.reading) return
  const moving = Boolean(launch) || Math.abs(target - current) > 0.00001 || inspection.moving || stories.animating || drums.animating || dragging || returnLook
  const lively = motion && wildlifeNearby(camera)
  const interval = moving || lively ? 1000 / 30 : 1000 / 20
  if (time - lastTime < interval - 1) {
    idleTimer = window.setTimeout(wake, interval - (time - lastTime))
    return
  }
  const delta = clamp((time - lastTime) / 1000, 0, 0.15)
  lastTime = time
  if (launch) {
    launch.elapsed += delta
    const t = reducedMotion ? 1 : clamp(launch.elapsed / 2.4, 0, 1)
    current = THREE.MathUtils.lerp(launch.from, launch.to, t * t * (3 - 2 * t))
    if (t === 1) {
      launch = null
      journey.arrive(current)
      setScrollLock(false)
      syncScroll(current)
      journeyStatus.textContent = 'Continue scrolling or swiping to walk.'
    }
  } else {
    // Brief easing softens wheel ticks; speed is unrestricted between decisions.
    current += (target - current) * (1 - Math.exp(-delta * (reducedMotion ? 20 : 13)))
    if (Math.abs(target - current) < 0.00001) current = target
    journey.arrive(current)
  }
  if (journey.pending && !scrollLocked) { target = journey.target; setScrollLock(true) }
  const z = zAt(current)
  nextPoint.copy(routePosition(z, choices))
  camera.position.copy(nextPoint)
  sky.position.copy(nextPoint)
  const walking = Math.min(Math.abs(target - current) * 60, 1)
  camera.position.y += reducedMotion ? 0 : Math.sin(time * 0.008) * 0.015 * walking
  lookPoint.copy(routePosition(zAt(route.advance(current, 5)), choices))
  if (current > 0.995) lookPoint.copy(routePosition(z - 5, choices))
  tangent.subVectors(lookPoint, nextPoint).normalize()
  lookPoint.copy(camera.position).addScaledVector(tangent, 7)
  lookPoint.y = camera.position.y + tangent.y * 3 - 0.05
  lookPoint.x += (window.innerWidth < 640 ? 5 : 3.5) * Math.exp(-Math.pow((z - 162) / 11, 2))
    + 0.45 * Math.exp(-Math.pow((z - 80) / 9, 2))
    - (window.innerWidth < 640 ? 6.8 : 4.4) * Math.exp(-Math.pow((z - 31) / 7, 2))
    - (window.innerWidth < 640 ? 5 : 2) * Math.exp(-Math.pow((z - 4) / 6, 2))
    - (choices.pond ? (window.innerWidth < 640 ? 6 : 4) * Math.exp(-Math.pow((z + 23) / 11, 2)) : 0)
    + (window.innerWidth < 640 ? 0.55 : 0) * Math.exp(-Math.pow((z + 62) / 6, 2))
  if (choices.pond && z < -48) {
    pondGaze.set(-25, 0.85, -27).sub(camera.position).normalize()
    tangent.subVectors(lookPoint, camera.position).normalize().lerp(pondGaze, Math.min(1, (window.innerWidth < 640 ? 1.2 : 1) * Math.exp(-Math.pow((z + 22) / 11, 2)))).normalize()
    lookPoint.copy(camera.position).addScaledVector(tangent, 7)
  }
  // Turn towards the actual fingerpost on approach, then gently return to the chosen trail.
  const sign = forkSigns.find(sign => Math.abs(z - forkStop(sign.id)) < 16)
  if (sign) {
    const approach = clamp(1 - (z - forkStop(sign.id)) / 14, 0, 1)
    const depart = clamp(1 - (route.metres(current) - route.metres(progressAt(forkStop(sign.id)))) / 6, 0, 1)
    const blend = approach * approach * (3 - 2 * approach) * depart * depart * (3 - 2 * depart)
    tangent.subVectors(lookPoint, camera.position).normalize()
    pondGaze.subVectors(sign.focus, camera.position).normalize()
    tangent.lerp(pondGaze, blend).normalize()
    lookPoint.copy(camera.position).addScaledVector(tangent, 7)
  }
  if (!journey.pending && !journey.launching) stories.focus(camera, lookPoint, z, choices)
  if (choices.pond && z < -31 && z > -45) {
    const court = inspectables.find(anchor => anchor.id === 'court')
    if (court) {
      const weight = .94 * Math.exp(-Math.pow((z + 36) / 5, 2))
      tangent.subVectors(lookPoint, camera.position).normalize()
      pondGaze.subVectors(court.position, camera.position).normalize()
      lookPoint.copy(camera.position).addScaledVector(tangent.lerp(pondGaze, weight).normalize(), 7)
    }
  }
  if (!choices.pond && z < -6 && z > -21) {
    const glance = .88 * Math.exp(-Math.pow((z + 13) / 5.5, 2))
    tangent.subVectors(lookPoint, camera.position).normalize()
    pondGaze.set(-5.28, 4.91, -20.44).sub(camera.position).normalize()
    lookPoint.copy(camera.position).addScaledVector(tangent.lerp(pondGaze, glance).normalize(), 7)
  }
  camera.lookAt(lookPoint)
  if (returnLook) {
    const decay = reducedMotion ? 0 : Math.exp(-delta * 6)
    lookYaw *= decay; lookPitch *= decay
    if (Math.abs(lookYaw) + Math.abs(lookPitch) < .001) { lookYaw = lookPitch = 0; returnLook = false }
  }
  if (!inspection.active) camera.quaternion.multiply(lookRotation.setFromEuler(lookEuler.set(lookPitch, lookYaw, 0)))
  inspection.apply(delta, reducedMotion)
  if (inspection.key === 'court' && !inspection.moving) {
    lookEuler.setFromQuaternion(camera.quaternion, 'YXZ')
    lookEuler.x += courtPitch; lookEuler.y += courtYaw; lookEuler.z = 0
    camera.quaternion.setFromEuler(lookEuler)
  }
  if (!inspection.active) { courtYaw = 0; courtPitch = 0 }
  const scope = inspection.key === 'telescope'
  camera.near = scope ? 1.8 : .15; camera.far = scope ? 450 : 150; camera.updateProjectionMatrix()
  ;(scene.fog as THREE.FogExp2).density = scope ? .0017 : .0095
  sky.position.copy(camera.position)
  stories.update(camera, Boolean(journey.pending || journey.launching), delta, reducedMotion)
  updateInspectables(camera, Boolean(journey.pending || journey.launching || stories.reading))
  drums.update(delta, reducedMotion)
  sound.update(camera.position.x, z)
  const closest = lightSources.slice().sort((a, b) => a.position.distanceToSquared(camera.position) - b.position.distanceToSquared(camera.position))
  nearbyLights.forEach((light, i) => {
    const source = closest[i]
    if (!source) { light.intensity = 0; return }
    light.position.copy(source.position)
    light.color.copy(source.color)
    light.intensity = source.intensity * clamp((10 - source.position.distanceTo(camera.position)) / 6, 0, 1)
  })
  const restingNote = Boolean(inspection.key?.startsWith('note:') && !inspection.moving && !stories.animating)
  if (motion && !restingNote) weatherTime += delta
  sky.material.uniforms.time.value=weatherTime
  motes.rotation.y = Math.sin(weatherTime * 0.12) * 0.006
  update(camera, weatherTime, delta, motion && !restingNote)
  const renderStart = performance.now()
  renderer.render(scene, camera)
  Object.assign(renderer.domElement.dataset, {
    renderMs: (performance.now() - renderStart).toFixed(2), frames: String(++frameCount),
    drawCalls: String(renderer.info.render.calls), triangles: String(renderer.info.render.triangles),
    cameraZ: camera.position.z.toFixed(2), cameraX: camera.position.x.toFixed(2), cameraY: camera.position.y.toFixed(2),
    progress: current.toFixed(4), atmosphere: motion ? 'running' : 'paused',
    ridge: String(choices.ridge), workshop: String(choices.workshop), pond: String(choices.pond),
    lookYaw: lookYaw.toFixed(3), lookPitch: lookPitch.toFixed(3), inspection: inspection.key ?? '',
    journey: journey.pending ? `choice:${journey.pending}` : journey.launching ? `following:${journey.launching}` : 'walking',
  })
  updateProgress()
  if (launch || current !== target || inspection.moving || stories.animating || drums.animating || dragging || returnLook) frameRequest = requestAnimationFrame(animate)
  else if (motion && !restingNote) idleTimer = window.setTimeout(wake, lively ? 1000 / 30 : 1000 / 20)
}
THREE.DefaultLoadingManager.onLoad = wake
setScrollLock(Boolean(journey.pending))
wake()
function syncScroll(progress: number) {
  // Explicit instant cancels in-flight native smooth travel and momentum overshoot.
  window.scrollTo({ top: route.metres(progress) / route.length * scrollRange(), behavior: 'instant' as ScrollBehavior })
}
function setScrollLock(locked: boolean) {
  scrollLocked = locked
  if (locked) scrollAnchor = progressAt(forkStop(journey.pending ?? journey.launching!))
  document.documentElement.classList.toggle('at-fork', locked)
  if (locked) syncScroll(scrollAnchor)
}
window.addEventListener('scroll', () => {
  if (stories.reading || inspection.active) { syncScroll(current); return }
  const progress = scrollProgress()
  if (scrollLocked) {
    if (journey.pending && progress < scrollAnchor - .0001) {
      target = journey.request(progress); setScrollLock(false); activeFork = null; fork.hidden = true
    } else { if (Math.abs(progress - scrollAnchor) > .0001) syncScroll(scrollAnchor); return }
  } else target = journey.request(progress)
  returnLook = true
  if (journey.pending) setScrollLock(true)
  wake()
}, { passive: true })
// Only forward input is blocked at a choice. Backwards native scrolling remains available.
window.addEventListener('wheel', event => {
  if (stories.reading || (event.target as Element).closest('.wayfinding nav')) return
  if (inspection.active || journey.launching || (journey.pending && event.deltaY > 0)) event.preventDefault()
  if (!inspection.active) { returnLook = true; wake() }
}, { passive: false })
window.addEventListener('touchmove', event => {
  if (journey.launching || inspection.active) event.preventDefault()
}, { passive: false })
window.addEventListener('pointerdown', () => { keyboardTravel = false }, { passive: true })
window.addEventListener('keydown', event => {
  keyboardTravel = true
  if (stories.reading || inspection.active) return
  if (!scrollLocked) return
  if (event.key === 'Escape' && journey.pending) {
    event.preventDefault(); walkToZ(forkStop(journey.pending) + 6); return
  }
  if ((journey.launching ? ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'] : ['ArrowDown', 'PageDown', 'End']).includes(event.key)
    && !(event.target as Element).closest('.wayfinding nav')) event.preventDefault()
  if (event.key === ' ' && !event.shiftKey && !(event.target as Element).closest('button, summary')) event.preventDefault()
})
document.addEventListener('visibilitychange', () => { if (document.hidden) stopFrames(); else wake() })
renderer.domElement.addEventListener('webglcontextlost', event => {
  event.preventDefault()
  contextLost = true
  stopFrames()
  instruction.textContent = 'The forest is resting. Waiting for graphics to return…'
})
renderer.domElement.addEventListener('webglcontextrestored', () => { contextLost = false; wake() })

function walkToZ(z: number) {
  const progress = progressAt(z)
  if (scrollLocked) {
    if (!journey.backTo(progress)) return
    launch = null
    setScrollLock(false)
    activeFork = null
    fork.hidden = true
    journeyStatus.textContent = 'Walking back from the signpost.'
  }
  window.scrollTo({ top: route.metres(progress) / route.length * scrollRange(), behavior: reducedMotion ? 'auto' : 'smooth' })
}
document.querySelectorAll<HTMLButtonElement>('[data-stop]').forEach(button => {
  button.addEventListener('click', () => {
    const branch = button.dataset.branch as BranchId | undefined
    walkToZ(branch && !choices[branch] ? forkStop(branch) : Number(button.dataset.stop))
    button.blur()
    document.querySelector('details')?.removeAttribute('open')
  })
})

renderer.domElement.addEventListener('pointerdown', event => {
  if (event.button !== 0 || (inspection.active && (inspection.key !== 'court' || inspection.moving)) || journey.launching) return
  pointerStart = pointerLast = { x: event.clientX, y: event.clientY }
  dragging = true; returnLook = false
  renderer.domElement.setPointerCapture(event.pointerId)
  renderer.domElement.classList.add('dragging'); wake()
})
renderer.domElement.addEventListener('pointermove', event => {
  if (!dragging) return
  const distance = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y)
  if (distance > 4) {
    if (inspection.key === 'court') {
      courtYaw = clamp(courtYaw + (event.clientX - pointerLast.x) * .004, -2.6, 2.6)
      courtPitch = clamp(courtPitch + (event.clientY - pointerLast.y) * .003, -.85, .85)
    } else {
      lookYaw = clamp(lookYaw + (event.clientX - pointerLast.x) * .004, -2.6, 2.6)
      lookPitch = clamp(lookPitch + (event.clientY - pointerLast.y) * .003, -.85, .85)
    }
    pointerLast = { x: event.clientX, y: event.clientY }; wake()
  }
})
function releaseLook() { dragging = false; renderer.domElement.classList.remove('dragging') }
renderer.domElement.addEventListener('pointerup', releaseLook)
renderer.domElement.addEventListener('pointercancel', releaseLook)

let viewportWidth = innerWidth, viewportHeight = innerHeight
window.addEventListener('resize', () => {
  if (viewportWidth === innerWidth && viewportHeight === innerHeight) return
  viewportWidth = innerWidth; viewportHeight = innerHeight
  if (scrollLocked) syncScroll(scrollAnchor)
  else { target = journey.request(scrollProgress()); if (journey.pending) setScrollLock(true) }
  camera.aspect = window.innerWidth / window.innerHeight
  inspection.resize(camera.aspect)
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 640 ? 1 : 1.25))
  wake()
})

}
void start()
