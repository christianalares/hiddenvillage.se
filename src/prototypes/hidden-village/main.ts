// Continuous camera path with a richer, single-scene environment.
import * as THREE from 'three'
import { buildWorld } from './world'
import { trailHeight, trailX } from './trail'
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

async function start() {
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
scene.fog = new THREE.FogExp2('#35464f', 0.0085)
const camera = new THREE.PerspectiveCamera(61, window.innerWidth / window.innerHeight, 0.15, 220)
// A static sky gradient gives the silhouettes a luminous horizon without postprocessing.
const sky = new THREE.Mesh(new THREE.SphereGeometry(210, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { horizon: { value: new THREE.Color('#40525b') }, zenith: { value: new THREE.Color('#0b151e') } },
  vertexShader: 'varying vec3 direction; void main(){ direction = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position.z = gl_Position.w; }',
  fragmentShader: 'uniform vec3 horizon; uniform vec3 zenith; varying vec3 direction; void main(){ float h = smoothstep(-0.02, .55, direction.y); gl_FragColor = vec4(mix(horizon, zenith, h), 1.0);\n #include <tonemapping_fragment>\n #include <colorspace_fragment> }',
}))
sky.frustumCulled = false
sky.renderOrder = -1
scene.add(sky)

scene.add(new THREE.HemisphereLight('#9aafc1', '#19211b', 1.6))
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
const { houseLights, lanterns, motes, signTargets, update } = await buildWorld(scene).catch(error => {
  instruction.textContent = 'The woodland could not load. Please reload to try again.'
  mount.dataset.state = 'error'
  throw error
})
mount.dataset.state = 'ready'
const path = new THREE.CatmullRomCurve3(
  [100, 96, 90, 83, 76, 68, 62, 58, 54.5, 51, 46, 41, 32, 23, 15, 7, -1, -10, -19].map(z => new THREE.Vector3(trailX(z), trailHeight(z) + 1.76, z)),
  false,
  'centripetal'
)

// Only two nearby lamps affect geometry. Distant windows and lantern halos are
// emissive; the light count stays constant so walking never recompiles shaders.
scene.updateMatrixWorld(true)
const lightSources = [...houseLights, ...lanterns.flatMap(lantern => lantern.children.filter(child => child instanceof THREE.PointLight) as THREE.PointLight[])].map(light => {
  const position = light.getWorldPosition(new THREE.Vector3())
  light.removeFromParent()
  return { position, intensity: light.intensity, color: light.color }
})
const nearbyLights = [new THREE.PointLight('#edb16c', 0, 12, 1.7), new THREE.PointLight('#edb16c', 0, 12, 1.7)]
scene.add(...nearbyLights)

const chapters = [
  { until: 88, place: 'THE WOODS', title: 'Hidden Village', description: 'Follow the lanterns. There is something beyond the trees.' },
  { until: 68, place: 'THE RIDGE', title: 'A little farther', description: 'Warm windows across the valley. The path winds down from here.' },
  { until: 46, place: 'THE CROSSING', title: 'One person, many ideas', description: 'I am Christian, a developer with a habit of making things.' },
  { until: 13, place: 'THE WORKSHOP', title: 'Things made here', description: 'Creations and collaborations, gathered around the workbench.' },
  { until: -8, place: 'THE SQUARE', title: 'Still growing', description: 'A place for experiments, unfinished ideas, and whatever comes next.' },
  { until: -Infinity, place: 'THE LAST LIGHT', title: 'Say hello', description: 'The village is small. There is always room for a conversation.' },
]
let visibleChapter = -1

let target = 0
let current = 0
let lastTime = performance.now()
let frameRequest = 0
let frameCount = 0
let contextLost = false
const frameInterval = 1000 / 30
let lastReported = -1
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const nextPoint = new THREE.Vector3()
const lookPoint = new THREE.Vector3()
const tangent = new THREE.Vector3()
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

function steer(change: number) {
  const desired = clamp(target + change, 0, 1)
  target = clamp(desired, Math.max(0, current - 0.17), Math.min(1, current + 0.17))
  wake()
}

function updateProgress(value: number) {
  progressBar.style.width = `${value * 100}%`
  const chapterIndex = chapters.findIndex(chapter => nextPoint.z > chapter.until)
  if (chapterIndex !== visibleChapter) {
    visibleChapter = chapterIndex
    const chapter = chapters[chapterIndex]
    place.textContent = chapter.place
    caption.textContent = chapter.title
    description.textContent = chapter.description
    contact.hidden = chapterIndex !== chapters.length - 1
  }
  instruction.textContent = window.innerWidth >= 640 && nextPoint.z < 36 && nextPoint.z > 24
    ? 'Click the sign or keep walking'
    : value >= 0.98
      ? 'Scroll up to walk back'
      : 'Scroll, swipe, or use arrow keys to walk'
}

function wake() {
  if (!frameRequest && !document.hidden && !contextLost) {
    lastTime = performance.now() - frameInterval
    frameRequest = requestAnimationFrame(animate)
  }
}

function animate(time: number) {
  frameRequest = 0
  if (document.hidden || contextLost) return
  if (time - lastTime < frameInterval - 1) {
    frameRequest = requestAnimationFrame(animate)
    return
  }
  const delta = clamp((time - lastTime) / 1000, 0, 0.1)
  lastTime = time
  const easedStep = (target - current) * (1 - Math.exp(-delta * (reducedMotion ? 10 : 4.1)))
  const pacedStep = clamp(easedStep, -delta * 0.065, delta * 0.065)
  current = clamp(current + pacedStep, 0, 1)
  if (Math.abs(target - current) < 0.00005) current = target
  path.getPointAt(current, nextPoint)
  const walking = Math.min(Math.abs(target - current) * 16, 1)
  camera.position.copy(nextPoint)
  sky.position.copy(nextPoint)
  camera.position.y += reducedMotion ? 0 : Math.sin(time * 0.008) * 0.018 * walking
  path.getTangentAt(current, tangent)
  lookPoint.copy(camera.position).addScaledVector(tangent, 7)
  lookPoint.y = camera.position.y + tangent.y * 3 - 0.04
    - 0.21 * Math.exp(-Math.pow((nextPoint.z - 80) / 10, 2))
  // Gentle glances make landmarks legible without interrupting the forward walk.
  lookPoint.x += 0.45 * Math.exp(-Math.pow((nextPoint.z - 80) / 9, 2))
    - (window.innerWidth < 640 ? 6.8 : 4.4) * Math.exp(-Math.pow((nextPoint.z - 31) / 7, 2))
    - (window.innerWidth < 640 ? 5 : 2) * Math.exp(-Math.pow((nextPoint.z - 4) / 6, 2))
    + (window.innerWidth < 640 ? 0.55 : 0) * Math.exp(-Math.pow((nextPoint.z + 19) / 6, 2))
  camera.lookAt(lookPoint)

  const closest = lightSources.slice().sort((a, b) => a.position.distanceToSquared(camera.position) - b.position.distanceToSquared(camera.position))
  nearbyLights.forEach((light, i) => {
    const source = closest[i]
    light.position.copy(source.position)
    light.color.copy(source.color)
    light.intensity = source.intensity
  })
  motes.rotation.y = Math.sin(time * 0.00012) * 0.018
  update(camera)
  const renderStart = performance.now()
  renderer.render(scene, camera)
  renderer.domElement.dataset.renderMs = (performance.now() - renderStart).toFixed(2)
  // Readable diagnostic attributes for browser QA without a perpetual stats UI.
  renderer.domElement.dataset.frames = String(++frameCount)
  renderer.domElement.dataset.drawCalls = String(renderer.info.render.calls)
  renderer.domElement.dataset.triangles = String(renderer.info.render.triangles)
  renderer.domElement.dataset.cameraZ = nextPoint.z.toFixed(2)
  renderer.domElement.dataset.progress = current.toFixed(4)
  if (Math.abs(current - lastReported) > 0.001 || current === target) {
    lastReported = current
    updateProgress(current)
  }
  if (current !== target) frameRequest = requestAnimationFrame(animate)
}

// Texture arrivals and resizing need a frame even while the camera is resting.
THREE.DefaultLoadingManager.onLoad = wake
wake()
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(frameRequest); frameRequest = 0 }
  else wake()
})
renderer.domElement.addEventListener('webglcontextlost', event => {
  event.preventDefault()
  contextLost = true
  cancelAnimationFrame(frameRequest)
  frameRequest = 0
  instruction.textContent = 'The forest is resting. Waiting for graphics to return…'
})
renderer.domElement.addEventListener('webglcontextrestored', () => { contextLost = false; wake() })

function walkToZ(z: number) {
  // Derive waypoints from distance along the curve rather than fragile percentages.
  let low = 0, high = 1
  for (let i = 0; i < 18; i++) {
    const middle = (low + high) / 2
    path.getPointAt(middle, lookPoint)
    if (lookPoint.z > z) low = middle
    else high = middle
  }
  target = (low + high) / 2
  wake()
}

document.querySelectorAll<HTMLButtonElement>('[data-stop]').forEach(button => {
  button.addEventListener('click', () => {
    walkToZ(Number(button.dataset.stop))
    button.blur()
    document.querySelector('details')?.removeAttribute('open')
  })
})

window.addEventListener('wheel', event => {
  event.preventDefault()
  if (Number.isFinite(event.deltaY)) steer(clamp(event.deltaY * 0.0004, -0.08, 0.08))
}, { passive: false })

let touchY = 0
window.addEventListener('touchstart', event => { touchY = event.touches[0]?.clientY ?? 0 }, { passive: true })
window.addEventListener('touchmove', event => {
  event.preventDefault()
  const nextY = event.touches[0]?.clientY ?? touchY
  steer(clamp((touchY - nextY) * 0.0014, -0.04, 0.04))
  touchY = nextY
}, { passive: false })

window.addEventListener('keydown', event => {
  if (event.target instanceof HTMLElement && event.target.closest('button, a, summary')) return
  if (['ArrowDown', 'PageDown', ' ', 'ArrowUp', 'PageUp'].includes(event.key)) {
    event.preventDefault()
    steer(['ArrowUp', 'PageUp'].includes(event.key) ? -0.075 : 0.075)
  }
})

function updatePointer(event: PointerEvent | MouseEvent) {
  const rect = renderer.domElement.getBoundingClientRect()
  pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
  raycaster.setFromCamera(pointer, camera)
  return raycaster.intersectObjects(signTargets)[0]
}

renderer.domElement.addEventListener('pointermove', event => {
  renderer.domElement.style.cursor = updatePointer(event) ? 'pointer' : 'default'
})
renderer.domElement.addEventListener('click', event => {
  const hit = updatePointer(event)
  if (hit?.object.userData.destinationZ !== undefined) walkToZ(hit.object.userData.destinationZ)
})

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 640 ? 1 : 1.25))
  wake()
})

}
void start()
