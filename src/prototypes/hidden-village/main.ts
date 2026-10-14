// Throwaway prototype question: can one scroll-driven camera path feel like a continuous walk?
import * as THREE from 'three'
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

function makeWindowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')!
  context.fillStyle = '#1b1b1e'
  context.fillRect(0, 0, 128, 128)
  context.fillStyle = '#d58c45'
  context.fillRect(12, 12, 104, 104)
  const glow = context.createRadialGradient(64, 60, 8, 64, 64, 70)
  glow.addColorStop(0, 'rgba(255,226,146,0.85)')
  glow.addColorStop(1, 'rgba(194,91,38,0)')
  context.fillStyle = glow
  context.fillRect(12, 12, 104, 104)
  context.fillStyle = '#312829'
  context.fillRect(59, 9, 10, 110)
  context.fillRect(9, 59, 110, 10)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function makeSignTexture(label: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 120
  const context = canvas.getContext('2d')!
  context.fillStyle = '#3e3029'
  context.fillRect(0, 0, 512, 120)
  context.fillStyle = '#9a7960'
  context.fillRect(10, 7, 492, 3)
  context.fillRect(12, 108, 487, 2)
  context.font = 'bold 39px Georgia, serif'
  context.fillStyle = '#e4d4ad'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(label, 256, 61)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function addHouse(scene: THREE.Scene, x: number, z: number, scale: number, windowTexture: THREE.Texture) {
  const house = new THREE.Group()
  house.position.set(x, 0, z)
  house.scale.setScalar(scale)

  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(4.6, 3.2, 4.5),
    new THREE.MeshStandardMaterial({ color: '#3e3a37', roughness: 1, flatShading: true }),
  )
  wall.position.y = 1.6
  house.add(wall)

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(4.2, 2.1, 4),
    new THREE.MeshStandardMaterial({ color: '#22232b', roughness: 1, flatShading: true }),
  )
  roof.rotation.y = Math.PI / 4
  roof.position.y = 4.1
  house.add(roof)

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 1.9, 0.07),
    new THREE.MeshStandardMaterial({ color: '#211c1c', roughness: 1 }),
  )
  door.position.set(0, 0.96, 2.3)
  house.add(door)

  for (const side of [-1, 1]) {
    const window = new THREE.Mesh(
      new THREE.PlaneGeometry(0.95, 0.95),
      new THREE.MeshBasicMaterial({ map: windowTexture, side: THREE.DoubleSide }),
    )
    window.position.set(side * 1.35, 2.05, 2.31)
    house.add(window)
  }

  const halo = new THREE.PointLight('#e5a666', 5, 9, 1.8)
  halo.position.set(0, 2, 3.2)
  house.add(halo)
  scene.add(house)
  return halo
}

function addGround(scene: THREE.Scene) {
  const earth = new THREE.Mesh(
    new THREE.PlaneGeometry(230, 230),
    new THREE.MeshStandardMaterial({ color: '#10161a', roughness: 1 }),
  )
  earth.rotation.x = -Math.PI / 2
  earth.position.y = -0.07
  scene.add(earth)

  const pathPoints: THREE.Vector3[] = []
  const segments = 84
  for (let i = 0; i <= segments; i++) {
    const z = 54 - i * 0.82
    const x = Math.sin(z * 0.105) * 1.15
    const width = 2.4 + Math.sin(i * 0.35) * 0.22
    pathPoints.push(new THREE.Vector3(x - width, 0.012, z))
    pathPoints.push(new THREE.Vector3(x + width, 0.012, z))
  }
  const positions: number[] = []
  const indices: number[] = []
  pathPoints.forEach((point) => positions.push(point.x, point.y, point.z))
  for (let i = 0; i < segments; i++) {
    const a = i * 2
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  const path = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: '#2c2b29', roughness: 1, side: THREE.DoubleSide }))
  scene.add(path)
}

function addForest(scene: THREE.Scene) {
  const count = 105
  const trunks = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.16, 0.34, 1, 5),
    new THREE.MeshStandardMaterial({ color: '#101417', roughness: 1, flatShading: true }),
    count,
  )
  const needles = new THREE.InstancedMesh(
    new THREE.ConeGeometry(1, 1, 5),
    new THREE.MeshStandardMaterial({ color: '#18242a', roughness: 1, flatShading: true }),
    count * 2,
  )
  const dummy = new THREE.Object3D()
  let canopyIndex = 0
  for (let i = 0; i < count; i++) {
    const z = 57 - (i * 17.71) % 76
    const side = i % 2 === 0 ? -1 : 1
    const distance = 5.8 + ((i * 7.13) % 16)
    const x = side * distance + Math.sin(z * 0.1) * 1.1
    const height = 4 + ((i * 4.73) % 5)
    const crown = 1.25 + ((i * 3.17) % 1.4)
    dummy.position.set(x, height * 0.38, z)
    dummy.scale.set(1, height * 0.76, 1)
    dummy.updateMatrix()
    trunks.setMatrixAt(i, dummy.matrix)
    for (let layer = 0; layer < 2; layer++) {
      const coneHeight = height * (layer === 0 ? 0.47 : 0.42)
      dummy.position.set(x, height * (layer === 0 ? 0.68 : 0.91), z)
      dummy.scale.set(crown * (layer === 0 ? 1 : 0.72), coneHeight, crown * (layer === 0 ? 1 : 0.72))
      dummy.rotation.y = (i * 0.97) % Math.PI
      dummy.updateMatrix()
      needles.setMatrixAt(canopyIndex++, dummy.matrix)
    }
  }
  trunks.instanceMatrix.needsUpdate = true
  needles.instanceMatrix.needsUpdate = true
  scene.add(trunks, needles)

  const stoneCount = 90
  const stones = new THREE.InstancedMesh(
    new THREE.DodecahedronGeometry(1, 0),
    new THREE.MeshStandardMaterial({ color: '#343a3a', roughness: 1, flatShading: true }),
    stoneCount,
  )
  for (let i = 0; i < stoneCount; i++) {
    const z = 55 - (i * 13.51) % 71
    const side = i % 2 === 0 ? -1 : 1
    const x = side * (3.1 + ((i * 5.59) % 13))
    const size = 0.18 + ((i * 2.33) % 0.56)
    dummy.position.set(x, size * 0.25, z)
    dummy.rotation.set(i * 0.7, i * 0.37, 0)
    dummy.scale.set(size, size * 0.55, size * 0.8)
    dummy.updateMatrix()
    stones.setMatrixAt(i, dummy.matrix)
  }
  stones.instanceMatrix.needsUpdate = true
  scene.add(stones)
}

function addSign(scene: THREE.Scene) {
  const sign = new THREE.Group()
  sign.position.set(4.8, 0, 20)
  sign.scale.setScalar(0.72)
  const wood = new THREE.MeshStandardMaterial({ color: '#34261f', roughness: 1, flatShading: true })
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 3.9, 6), wood)
  post.position.y = 1.95
  sign.add(post)

  const hitTargets: THREE.Object3D[] = []
  const labels = ['WHAT I CREATE  →', 'ENTER THE VILLAGE  →']
  labels.forEach((label, index) => {
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(3.25, 0.76, 0.12),
      [wood, wood, wood, wood, new THREE.MeshBasicMaterial({ map: makeSignTexture(label) }), wood],
    )
    board.position.set(index === 0 ? -0.55 : 0.3, 3.1 - index * 0.86, 0.35)
    board.rotation.z = index === 0 ? 0.05 : -0.04
    board.userData.destination = index === 0 ? 0.87 : 0.99
    sign.add(board)
    hitTargets.push(board)
  })
  scene.add(sign)
  return hitTargets
}

const mount = document.getElementById('mount')!
const caption = document.getElementById('caption')!
const instruction = document.getElementById('instruction')!
const progressBar = document.getElementById('progress')!

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.4
renderer.setClearColor('#19222b')
mount.appendChild(renderer.domElement)

const scene = new THREE.Scene()
scene.background = new THREE.Color('#19222b')
scene.fog = new THREE.FogExp2('#242d37', 0.035)
const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 170)
scene.add(new THREE.HemisphereLight('#b5c4d0', '#141617', 1.5))
const moonLight = new THREE.DirectionalLight('#b5c6df', 2.1)
moonLight.position.set(-17, 26, -22)
scene.add(moonLight)

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(5, 24, 16),
  new THREE.MeshBasicMaterial({ color: '#b1b7bb', fog: false }),
)
moon.position.set(-35, 38, -100)
scene.add(moon)

addGround(scene)
addForest(scene)
const windowTexture = makeWindowTexture()
const houseLights = [
  addHouse(scene, -6.5, -1.5, 1.07, windowTexture),
  addHouse(scene, 5.5, -7.8, 1.18, windowTexture),
  addHouse(scene, -1.8, -15.5, 0.93, windowTexture),
]
const signTargets = addSign(scene)
const signLight = new THREE.PointLight('#dda772', 7, 12, 1.6)
signLight.position.set(4.8, 2.4, 20.8)
scene.add(signLight)

const path = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 1.76, 51),
  new THREE.Vector3(0.4, 1.76, 43),
  new THREE.Vector3(-0.7, 1.76, 34),
  new THREE.Vector3(0.6, 1.76, 25),
  new THREE.Vector3(-0.15, 1.76, 17),
  new THREE.Vector3(-0.65, 1.76, 10),
  new THREE.Vector3(0.15, 1.76, 6),
  new THREE.Vector3(0.1, 1.76, 3),
], false, 'centripetal')

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
  caption.textContent = value < 0.33
    ? 'There is a place beyond the trees.'
    : value < 0.78
      ? 'Follow the lights.'
      : 'Welcome to the hidden village.'
  instruction.textContent = value > 0.32 && value < 0.64
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
  lookPoint.y = 1.72 + Math.sin(current * Math.PI) * 0.12
  camera.lookAt(lookPoint)

  houseLights.forEach((light, index) => {
    light.intensity = 4.9 + Math.sin(time * 0.0022 + index * 2) * 0.18
  })
  signLight.intensity = 6.8 + Math.sin(time * 0.003) * 0.25
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
