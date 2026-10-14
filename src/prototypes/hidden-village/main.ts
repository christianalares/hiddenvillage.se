// Continuous camera path with a richer, single-scene environment.
import * as THREE from 'three'
import { buildWorld } from './world'
import { trailHeight, trailX } from './trail'
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const mount = document.getElementById('mount')!
const caption = document.getElementById('caption')!
const place = document.getElementById('place')!
const description = document.getElementById('description')!
const contact = document.getElementById('contact')!
const instruction = document.getElementById('instruction')!
const progressBar = document.getElementById('progress')!

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.4
renderer.setClearColor('#111b22')
mount.appendChild(renderer.domElement)

const scene = new THREE.Scene()
scene.background = new THREE.Color('#111b22')
scene.fog = new THREE.FogExp2('#27343a', 0.012)
const camera = new THREE.PerspectiveCamera(61, window.innerWidth / window.innerHeight, 0.1, 170)
scene.add(new THREE.HemisphereLight('#a8b6c2', '#151b19', 1.85))
const moonLight = new THREE.DirectionalLight('#b8c7d6', 2.25)
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
moonHalo.scale.set(34, 34, 1)
scene.add(moonHalo)
const moon = new THREE.Mesh(new THREE.SphereGeometry(2.8, 32, 24), new THREE.MeshBasicMaterial({ color: '#cbd3d0', fog: false }))
moon.position.copy(moonHalo.position)
scene.add(moon)

const { houseLights, lanterns, motes, signTargets } = buildWorld(scene)
const path = new THREE.CatmullRomCurve3(
  [83, 76, 68, 59, 50, 41, 32, 23, 15, 7, -1, -10, -19].map(z => new THREE.Vector3(trailX(z), trailHeight(z) + 1.76, z)),
  false,
  'centripetal'
)

const chapters = [
  { until: 68, place: 'THE RIDGE', title: 'Hidden Village', description: 'A light in the woods. A path worth following.' },
  { until: 42, place: 'THE FOREST', title: 'One person, many ideas', description: 'I am Christian, a senior developer with a habit of making things.' },
  { until: 13, place: 'THE WORKSHOP', title: 'Things made here', description: 'A closer look at what I have built, alone and with others.' },
  { until: -8, place: 'THE SQUARE', title: 'Still growing', description: 'Experiments, unfinished ideas, and whatever I am curious about next.' },
  { until: -Infinity, place: 'THE LAST LIGHT', title: 'Say hello', description: 'The village is small. There is always room for a conversation.' },
]
let visibleChapter = -1

let target = 0
let current = 0
let lastTime = performance.now()
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
  instruction.textContent = nextPoint.z < 31 && nextPoint.z > 23
    ? 'Click the sign or keep walking'
    : value >= 0.98
      ? 'Scroll up to walk back'
      : 'Scroll, swipe, or use arrow keys to walk'
}

function animate(time: number) {
  const delta = clamp((time - lastTime) / 1000, 0, 0.05)
  lastTime = time
  const easedStep = (target - current) * (1 - Math.exp(-delta * (reducedMotion ? 10 : 4.1)))
  const pacedStep = clamp(easedStep, -delta * 0.2, delta * 0.2)
  current = clamp(current + pacedStep, 0, 1)
  if (Math.abs(target - current) < 0.00005) current = target
  path.getPointAt(current, nextPoint)
  const walking = Math.min(Math.abs(target - current) * 16, 1)
  camera.position.copy(nextPoint)
  camera.position.y += reducedMotion ? 0 : Math.sin(time * 0.009) * 0.028 * walking
  path.getTangentAt(current, tangent)
  lookPoint.copy(camera.position).addScaledVector(tangent, 5)
  lookPoint.y = camera.position.y + tangent.y * 5 - (current < 0.22 ? 0.78 : 0.09)
  camera.lookAt(lookPoint)

  houseLights.forEach((light, index) => {
    light.intensity = 3.7 + Math.sin(time * 0.0022 + index * 2) * 0.18
  })
  lanterns.forEach((lantern, index) => {
    const light = lantern.children.find(child => child instanceof THREE.PointLight) as THREE.PointLight
    light.intensity = 6.8 + Math.sin(time * 0.002 + index * 1.7) * 0.25
  })
  motes.rotation.y = Math.sin(time * 0.00012) * 0.018
  renderer.render(scene, camera)
  if (Math.abs(current - lastReported) > 0.003) {
    lastReported = current
    updateProgress(current)
  }
  requestAnimationFrame(animate)
}
requestAnimationFrame(animate)

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
  if (hit?.object.userData.destination) target = hit.object.userData.destination
})

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))
})
