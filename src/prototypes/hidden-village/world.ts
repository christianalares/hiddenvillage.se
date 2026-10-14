import * as THREE from 'three'
import { trailHeight, trailX } from './trail'

type World = {
  houseLights: THREE.PointLight[]
  lanterns: THREE.Group[]
  motes: THREE.Points
  signTargets: THREE.Object3D[]
}

let seed = 17347
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) | 0
  return (seed >>> 0) / 4294967296
}
const between = (a: number, b: number) => a + random() * (b - a)

function texture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  draw(ctx)
  const map = new THREE.CanvasTexture(canvas)
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = 4
  return map
}

const imageLoader = new THREE.TextureLoader()
const imageCache = new Map<string, THREE.Texture>()
function imageTexture(file: string, repeatX: number, repeatY: number) {
  const key = `${file}:${repeatX}:${repeatY}`
  const cached = imageCache.get(key)
  if (cached) return cached
  const map = imageLoader.load(`/prototype/hidden-village/assets/${file}`)
  map.colorSpace = THREE.SRGBColorSpace
  map.wrapS = map.wrapT = THREE.RepeatWrapping
  map.repeat.set(repeatX, repeatY)
  map.anisotropy = 4
  imageCache.set(key, map)
  return map
}

function fernTexture() {
  return texture(256, 256, ctx => {
    ctx.clearRect(0, 0, 256, 256)
    for (let frond = -2; frond <= 2; frond++) {
      const tipX = 128 + frond * 49
      const tipY = 28 + Math.abs(frond) * 26
      ctx.strokeStyle = '#526b55'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(128, 256)
      ctx.quadraticCurveTo(120 + frond * 16, 99, tipX, tipY)
      ctx.stroke()
      for (let i = 0; i < 24; i++) {
        const t = i / 24
        const x = 128 + (tipX - 128) * t
        const y = 256 + (tipY - 256) * t - Math.sin(t * Math.PI) * 14
        for (const side of [-1, 1]) {
          ctx.fillStyle = random() > 0.5 ? '#344d40' : '#4d6653'
          ctx.beginPath()
          ctx.ellipse(x + side * 9, y - 6, 3.3, 13 * (1 - t * 0.7), side * 0.6, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  })
}

function glowTexture() {
  return texture(128, 128, ctx => {
    const glow = ctx.createRadialGradient(64, 64, 0, 64, 64, 63)
    glow.addColorStop(0, 'rgba(255,221,154,0.95)')
    glow.addColorStop(0.16, 'rgba(244,169,83,0.43)')
    glow.addColorStop(1, 'rgba(235,143,70,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, 128, 128)
  })
}

function windowTexture() {
  return texture(256, 256, ctx => {
    ctx.fillStyle = '#3b271c'
    ctx.fillRect(0, 0, 256, 256)
    const light = ctx.createRadialGradient(115, 103, 2, 126, 128, 155)
    light.addColorStop(0, '#fff2bf')
    light.addColorStop(0.45, '#d5a25e')
    light.addColorStop(1, '#8a4a28')
    ctx.fillStyle = light
    ctx.fillRect(15, 15, 226, 226)
    ctx.strokeStyle = '#2a1f1b'
    ctx.lineWidth = 19
    ctx.strokeRect(6, 6, 244, 244)
    ctx.fillRect(117, 0, 21, 256)
    ctx.fillRect(0, 117, 256, 21)
  })
}

function signTexture(label: string) {
  return texture(1024, 240, ctx => {
    const wood = ctx.createLinearGradient(0, 0, 0, 240)
    wood.addColorStop(0, '#6b4d35')
    wood.addColorStop(0.55, '#3c2d24')
    wood.addColorStop(1, '#241f1b')
    ctx.fillStyle = wood
    ctx.fillRect(0, 0, 1024, 240)
    for (let i = 0; i < 95; i++) {
      ctx.strokeStyle = `rgba(140,101,71,${between(0.02, 0.15)})`
      ctx.lineWidth = between(1, 4)
      ctx.beginPath()
      const y = random() * 240
      ctx.moveTo(0, y)
      ctx.bezierCurveTo(270, y + between(-15, 15), 630, y + between(-12, 12), 1024, y + between(-5, 5))
      ctx.stroke()
    }
    ctx.fillStyle = '#e3cba1'
    ctx.font = 'bold 70px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, 512, 124)
  })
}

function cylinderBetween(a: THREE.Vector3, b: THREE.Vector3, radius: number, material: THREE.Material) {
  const delta = new THREE.Vector3().subVectors(b, a)
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.55, radius, delta.length(), 7), material)
  mesh.position.copy(a).addScaledVector(delta, 0.5)
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize())
  return mesh
}

function addTerrain(scene: THREE.Scene) {
  const earthMap = imageTexture('forest-leaves.jpg', 82, 82)
  const groundGeometry = new THREE.PlaneGeometry(240, 240, 90, 90)
  const groundPositions = groundGeometry.getAttribute('position')
  for (let i = 0; i < groundPositions.count; i++) {
    const x = groundPositions.getX(i)
    const y = groundPositions.getY(i)
    const z = -y
    const distance = Math.abs(x - trailX(z))
    groundPositions.setZ(i, trailHeight(z) + (distance < 3 ? 0 : -Math.min(1.1, (distance - 3) * 0.035) - Math.sin(x * 0.48) * Math.cos(y * 0.37) * 0.11))
  }
  groundGeometry.computeVertexNormals()
  const ground = new THREE.Mesh(groundGeometry, new THREE.MeshStandardMaterial({ map: earthMap, roughness: 1, color: '#7f8b7e' }))
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.035
  scene.add(ground)

  const points: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const segments = 240
  for (let i = 0; i <= segments; i++) {
    const z = 90 - i * 0.49
    const center = trailX(z)
    const width = 1.58 + Math.sin(i * 0.16) * 0.16
    const edge = Math.sin(i * 1.7) * 0.13
    points.push(center - width - edge, trailHeight(z) + 0.005, z, center + width + edge, trailHeight(z) + 0.005, z)
    uvs.push(0, i * 0.16, 1, i * 0.16)
    if (i < segments) {
      const a = i * 2
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  const dirtMap = imageTexture('wood-chip-path.jpg', 1, 1)
  scene.add(new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ map: dirtMap, color: '#a6a19a', roughness: 0.96, side: THREE.DoubleSide })))

  const stone = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: '#303a39', roughness: 1 }), 500)
  const dummy = new THREE.Object3D()
  for (let i = 0; i < 500; i++) {
    const z = between(-27, 90)
    const side = random() > 0.5 ? 1 : -1
    const x = trailX(z) + side * between(2.45, 21)
    const size = between(0.05, 0.28) * (random() > 0.98 ? 2 : 1)
    dummy.position.set(x, trailHeight(z) + size * 0.14, z)
    dummy.rotation.set(random() * 0.3, random() * 6, random() * 0.3)
    dummy.scale.set(size * between(0.8, 1.8), size * between(0.3, 0.8), size)
    dummy.updateMatrix()
    stone.setMatrixAt(i, dummy.matrix)
  }
  stone.instanceMatrix.needsUpdate = true
  scene.add(stone)
}

function addForest(scene: THREE.Scene) {
  const bark = new THREE.MeshStandardMaterial({ map: imageTexture('pine-bark.jpg', 1, 3), roughness: 1, color: '#6f7472' })
  const foliage = new THREE.MeshStandardMaterial({ map: imageLoader.load('/prototype/hidden-village/assets/spruce-cutout.png'), transparent: true, alphaTest: 0.15, side: THREE.DoubleSide, depthWrite: true, color: '#9ca99f', roughness: 1 })
  const fern = new THREE.MeshStandardMaterial({ map: fernTexture(), transparent: true, alphaTest: 0.12, side: THREE.DoubleSide, depthWrite: true, color: '#a2b5a1', roughness: 1 })
  const trunkGeometry = new THREE.CylinderGeometry(0.19, 0.32, 1, 8)
  const trunkCount = 230
  const trunks = new THREE.InstancedMesh(trunkGeometry, bark, trunkCount)
  const cards = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), foliage, trunkCount)
  const dummy = new THREE.Object3D()
  const trees: Array<{ x: number, z: number, height: number }> = []
  for (let i = 0; i < trunkCount; i++) {
    const z = i < 4 ? [81, 76, 69, 61][i] : between(-35, 92)
    const side = i % 2 ? 1 : -1
    const distance = i < 2 ? 5.2 : between(z > 42 ? (side === 1 ? 16 : 7.5) : 6.5, 27) + (side === 1 && z > 17 && z < 28 ? 4.5 : 0)
    const x = trailX(z) + side * distance
    const height = between(9, 17) * (i < 2 ? 1.3 : 1)
    trees.push({ x, z, height })
    dummy.position.set(x, trailHeight(z) + 1.6, z)
    dummy.rotation.set(0, 0, between(-0.025, 0.025))
    dummy.scale.set(between(0.8, 1.3), 3.2, between(0.8, 1.3))
    dummy.updateMatrix()
    trunks.setMatrixAt(i, dummy.matrix)
    dummy.position.set(x, trailHeight(z) + height * 0.5, z)
    dummy.rotation.set(0, between(-0.16, 0.16), 0)
    dummy.scale.set(height * 0.44, height, 1)
    dummy.updateMatrix()
    cards.setMatrixAt(i, dummy.matrix)
  }
  trunks.instanceMatrix.needsUpdate = true
  cards.instanceMatrix.needsUpdate = true
  scene.add(trunks, cards)

  for (const tree of trees.slice(0, 22)) {
    const branches = 4 + Math.floor(random() * 4)
    for (let i = 0; i < branches; i++) {
      const y = trailHeight(tree.z) + between(1.8, 3.1)
      const angle = random() * Math.PI * 2
      const reach = between(1.4, 3.2)
      scene.add(cylinderBetween(new THREE.Vector3(tree.x, y, tree.z), new THREE.Vector3(tree.x + Math.cos(angle) * reach, y - between(0.4, 1.5), tree.z + Math.sin(angle) * reach), between(0.04, 0.09), bark))
    }
  }

  const undergrowth = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), fern, 850)
  for (let i = 0; i < 850; i++) {
    const z = between(-27, 92)
    const side = random() > 0.5 ? 1 : -1
    const x = trailX(z) + side * between(2.55, 25)
    const size = between(0.35, 1.1)
    dummy.position.set(x, trailHeight(z) + size * 0.52, z)
    dummy.rotation.set(0, random() * Math.PI, 0)
    dummy.scale.set(size, size, 1)
    dummy.updateMatrix()
    undergrowth.setMatrixAt(i, dummy.matrix)
  }
  undergrowth.instanceMatrix.needsUpdate = true
  scene.add(undergrowth)
}

function addRidgeFence(scene: THREE.Scene) {
  const wood = new THREE.MeshStandardMaterial({ color: '#302b28', roughness: 1 })
  const posts: THREE.Vector3[] = []
  for (let z = 82; z >= 48; z -= 5.7) {
    const position = new THREE.Vector3(trailX(z) + 2.6, trailHeight(z), z)
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.12, 1.3, 7), wood)
    post.position.copy(position).add(new THREE.Vector3(0, 0.65, 0))
    scene.add(post)
    posts.push(position)
  }
  for (let i = 0; i < posts.length - 1; i++) {
    for (const y of [0.52, 0.98]) {
      scene.add(cylinderBetween(posts[i].clone().add(new THREE.Vector3(0, y, 0)), posts[i + 1].clone().add(new THREE.Vector3(0, y, 0)), 0.055, wood))
    }
  }
}

function addHouse(scene: THREE.Scene, x: number, z: number, scale: number, wallColor: string, glow: THREE.Texture, window: THREE.Texture) {
  const house = new THREE.Group()
  house.position.set(x, 0, z)
  house.scale.setScalar(scale)
  const plaster = new THREE.MeshStandardMaterial({ map: imageTexture('weathered-plaster.jpg', 1, 1), color: wallColor, roughness: 1 })
  const timber = new THREE.MeshStandardMaterial({ color: '#2e2723', roughness: 1 })
  const roofMaterial = new THREE.MeshStandardMaterial({ map: imageTexture('roof-planks.jpg', 1, 1), color: '#7e8987', roughness: 0.95, side: THREE.DoubleSide })
  const walls = new THREE.Mesh(new THREE.BoxGeometry(4.3, 3.1, 4.2), plaster)
  walls.position.y = 1.55
  house.add(walls)
  const gableShape = new THREE.Shape()
  gableShape.moveTo(-2.15, 3.09)
  gableShape.lineTo(2.15, 3.09)
  gableShape.lineTo(0, 4.48)
  gableShape.closePath()
  const gable = new THREE.Mesh(new THREE.ShapeGeometry(gableShape), plaster)
  gable.position.z = 2.115
  house.add(gable)
  for (const side of [-1, 1]) {
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.19, 4.95), roofMaterial)
    roof.position.set(side * 1.17, 3.77, 0)
    roof.rotation.z = side * -0.56
    house.add(roof)
    const gableTrim = cylinderBetween(new THREE.Vector3(0, 4.51, 2.18), new THREE.Vector3(side * 2.18, 3.15, 2.18), 0.09, timber)
    house.add(gableTrim)
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.13, 3.2, 0.14), timber)
    beam.position.set(side * 1.85, 1.6, 2.13)
    house.add(beam)
    const litWindow = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 1.1), new THREE.MeshBasicMaterial({ map: window, color: '#c7a778', side: THREE.DoubleSide }))
    litWindow.position.set(side * 1.13, 2.05, 2.113)
    house.add(litWindow)
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, color: '#b77b46' }))
    halo.position.set(side * 1.13, 2.05, 2.2)
    halo.scale.set(2.6, 2.6, 1)
    house.add(halo)
  }
  for (const y of [0.15, 2.9]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.13, 0.14), timber)
    beam.position.set(0, y, 2.13)
    house.add(beam)
  }
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.05, 2, 0.12), timber)
  door.position.set(0, 1, 2.16)
  house.add(door)
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.33, 0.13, 0.16), timber)
  doorFrame.position.set(0, 2.04, 2.21)
  house.add(doorFrame)
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshStandardMaterial({ color: '#96784f', metalness: 0.55, roughness: 0.4 }))
  knob.position.set(0.37, 0.98, 2.28)
  house.add(knob)
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.9, 0.65), plaster)
  chimney.position.set(1.35, 4.4, -0.85)
  house.add(chimney)
  const step = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.13, 0.85), new THREE.MeshStandardMaterial({ color: '#535953', roughness: 1 }))
  step.position.set(0, 0.07, 2.52)
  house.add(step)
  const light = new THREE.PointLight('#edb16c', 3.6, 10, 1.7)
  light.position.set(0, 2.05, 3.1)
  house.add(light)
  scene.add(house)
  return light
}

function addLantern(scene: THREE.Scene, x: number, z: number, glow: THREE.Texture) {
  const group = new THREE.Group()
  group.position.set(x, trailHeight(z), z)
  const postMaterial = new THREE.MeshStandardMaterial({ color: '#302a25', roughness: 1 })
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.11, 3.25, 8), postMaterial)
  post.position.y = 1.62
  group.add(post)
  group.add(cylinderBetween(new THREE.Vector3(0, 3.15, 0), new THREE.Vector3(x > 0 ? -0.72 : 0.72, 3.15, 0), 0.075, postMaterial))
  const lampX = x > 0 ? -0.72 : 0.72
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.45, 0.32), new THREE.MeshBasicMaterial({ color: '#c58e56' }))
  lamp.position.set(lampX, 2.79, 0)
  group.add(lamp)
  for (const height of [2.51, 3.08]) {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.45), postMaterial)
    cap.position.set(lampX, height, 0)
    group.add(cap)
  }
  for (const offsetX of [-0.19, 0.19]) for (const offsetZ of [-0.19, 0.19]) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.57, 0.04), postMaterial)
    frame.position.set(lampX + offsetX, 2.79, offsetZ)
    group.add(frame)
  }
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }))
  halo.position.set(lampX, 2.79, 0)
  halo.scale.set(5.1, 5.1, 1)
  group.add(halo)
  const light = new THREE.PointLight('#f2ae64', 7, 10, 1.7)
  light.position.set(lampX, 2.7, 0)
  group.add(light)
  scene.add(group)
  return group
}

function addSign(scene: THREE.Scene, glow: THREE.Texture) {
  const group = new THREE.Group()
  group.position.set(3.45, 0, 22)
  group.scale.setScalar(0.75)
  const wood = new THREE.MeshStandardMaterial({ color: '#4b3529', roughness: 1 })
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 4, 9), wood)
  post.position.y = 2
  group.add(post)
  const targets: THREE.Object3D[] = []
  const labels = ['WORKSHOP  ←', 'VILLAGE  →']
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i]
    const board = new THREE.Mesh(new THREE.BoxGeometry(3.55, 0.83, 0.14), [wood, wood, wood, wood, new THREE.MeshBasicMaterial({ map: signTexture(label) }), wood])
    board.position.set(i ? 0.33 : -0.32, 3.25 - i * 0.94, 0.22)
    board.rotation.z = i ? -0.035 : 0.035
    board.userData.destination = i ? 0.82 : 0.64
    group.add(board)
    targets.push(board)
  }
  const light = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: '#e9b97e', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }))
  light.position.set(0, 2.7, 0.5)
  light.scale.set(5.5, 5.5, 1)
  group.add(light)
  scene.add(group)
  return targets
}

function addPostbox(scene: THREE.Scene) {
  const group = new THREE.Group()
  group.position.set(3.4, 0, -20)
  const timber = new THREE.MeshStandardMaterial({ color: '#382c24', roughness: 1 })
  const iron = new THREE.MeshStandardMaterial({ color: '#45504b', metalness: 0.28, roughness: 0.7 })
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.7, 0.15), timber)
  post.position.y = 0.85
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.55, 0.5), iron)
  box.position.y = 1.68
  const roof = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.09, 0.65), timber)
  roof.position.y = 2.01
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.035, 0.02), timber)
  slot.position.set(0, 1.78, 0.263)
  group.add(post, box, roof, slot)
  scene.add(group)
}

function addAtmosphere(scene: THREE.Scene) {
  const positions: number[] = []
  for (let i = 0; i < 105; i++) {
    const z = between(-25, 89)
    positions.push(between(-17, 17), trailHeight(z) + between(0.8, 7), z)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  const motes = new THREE.Points(geometry, new THREE.PointsMaterial({ color: '#b6a887', size: 0.07, transparent: true, opacity: 0.55, sizeAttenuation: true, depthWrite: false }))
  scene.add(motes)
  return motes
}

export function buildWorld(scene: THREE.Scene): World {
  addTerrain(scene)
  addForest(scene)
  addRidgeFence(scene)
  const glow = glowTexture()
  const window = windowTexture()
  const houseLights = [
    addHouse(scene, -6.8, 22, 1.1, '#b4b3a5', glow, window),
    addHouse(scene, 6.9, 0, 1.18, '#aaa69a', glow, window),
    addHouse(scene, -7.8, -17.2, 0.94, '#adb5b3', glow, window),
    addHouse(scene, 8.5, -20.5, 0.78, '#a7aaa3', glow, window),
    addHouse(scene, 0, -32, 1.2, '#a8aba1', glow, window),
  ]
  const lanterns = [addLantern(scene, 2.6, 74, glow), addLantern(scene, -3.2, 38, glow), addLantern(scene, 3.7, 16, glow), addLantern(scene, -3.4, 1, glow), addLantern(scene, 4.2, -18, glow)]
  const signTargets = addSign(scene, glow)
  addPostbox(scene)
  const motes = addAtmosphere(scene)
  return { houseLights, lanterns, motes, signTargets }
}
