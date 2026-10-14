import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { bridgeEnd, bridgeStart, groundHeight, trailHeight, trailX } from './trail'

const timber = new THREE.MeshLambertMaterial({ color: '#3d342d' })
const endGrain = new THREE.MeshLambertMaterial({ color: '#82705a' })
const stone = new THREE.MeshLambertMaterial({ color: '#485351' })
const moss = new THREE.MeshLambertMaterial({ color: '#34483b' })
const iron = new THREE.MeshLambertMaterial({ color: '#252f30' })
let seed = 8271
const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) | 0) >>> 0) / 4294967296
const between = (a: number, b: number) => a + random() * (b - a)

function box(parent: THREE.Object3D, material: THREE.Material, size: number[], position: number[]) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size as [number, number, number]), material)
  mesh.position.set(...position as [number, number, number])
  parent.add(mesh)
  return mesh
}

function beam(parent: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3, radius: number, material = timber) {
  const delta = b.clone().sub(a)
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.8, radius, delta.length(), 6), material)
  mesh.position.copy(a).add(b).multiplyScalar(0.5)
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize())
  parent.add(mesh)
}

function bridge(scene: THREE.Scene) {
  const boards = new THREE.MeshLambertMaterial({ color: '#716254' })
  for (let z = bridgeStart - 0.2; z <= bridgeEnd + 0.2; z += 0.31) {
    const plank = box(scene, boards, [3.6, 0.14, 0.28], [trailX(z), trailHeight(z) - 0.04, z])
    plank.rotation.y = Math.atan((trailX(z + 0.1) - trailX(z - 0.1)) / 0.2)
    plank.rotation.z = between(-0.006, 0.006)
  }
  for (const side of [-1, 1]) {
    const posts: THREE.Vector3[] = []
    for (let z = bridgeStart; z <= bridgeEnd + 0.1; z += (bridgeEnd - bridgeStart) / 4) {
      const point = new THREE.Vector3(trailX(z) + side * 1.72, trailHeight(z), z)
      box(scene, timber, [0.16, 1.2, 0.16], [point.x, point.y + 0.55, point.z])
      posts.push(point)
    }
    for (let i = 1; i < posts.length; i++) {
      for (const height of [0.45, 1.05, -0.3]) {
        beam(scene, posts[i - 1].clone().add(new THREE.Vector3(0, height, 0)), posts[i].clone().add(new THREE.Vector3(0, height, 0)), height < 0 ? 0.15 : 0.065)
      }
    }
    for (const z of [bridgeStart, bridgeEnd]) {
      const x = trailX(z) + side * 1.7
      box(scene, stone, [0.7, 1, 0.8], [x, trailHeight(z) - 0.6, z])
    }
  }
}

function woodlandDetails(scene: THREE.Scene) {
  const dummy = new THREE.Object3D()
  const boulders = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), stone, 100)
  const mossCaps = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), moss, 100)
  for (let i = 0; i < 100; i++) {
    const z = between(28, 106)
    const x = trailX(z) + (i % 3 ? -1 : 1) * between(3.4, 19)
    const size = between(0.6, 2.5)
    const y = groundHeight(x, z)
    dummy.position.set(x, y + size * 0.05, z)
    dummy.rotation.set(between(-0.2, 0.2), between(0, 6), between(-0.2, 0.2))
    dummy.scale.set(size * 1.2, size * 0.72, size)
    dummy.updateMatrix()
    boulders.setMatrixAt(i, dummy.matrix)
    dummy.position.y += size * 0.32
    dummy.scale.set(size, size * 0.34, size * 0.86)
    dummy.updateMatrix()
    mossCaps.setMatrixAt(i, dummy.matrix)
  }
  scene.add(boulders, mossCaps)

  const logs = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.23, 1, 7), timber, 24)
  const cuts = new THREE.InstancedMesh(new THREE.CircleGeometry(0.16, 7), endGrain, 24)
  for (let i = 0; i < 24; i++) {
    const z = between(33, 100)
    const x = trailX(z) - between(3.6, 13)
    const length = between(1.5, 4)
    dummy.position.set(x, groundHeight(x, z) + 0.2, z)
    dummy.rotation.set(0, between(-0.7, 0.7), Math.PI / 2)
    dummy.scale.set(1, length, 1)
    dummy.updateMatrix()
    logs.setMatrixAt(i, dummy.matrix)
    const end = new THREE.Vector3(0, length / 2 + 0.01, 0).applyEuler(dummy.rotation)
    dummy.position.add(end)
    dummy.rotation.z = 0
    dummy.rotation.y += -Math.PI / 2
    dummy.scale.setScalar(1)
    dummy.updateMatrix()
    cuts.setMatrixAt(i, dummy.matrix)
  }
  scene.add(logs, cuts)

  // Three crossed blades in one geometry, repeated in one draw call.
  const blades: THREE.BufferGeometry[] = []
  for (let i = 0; i < 3; i++) {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([-0.12, 0, 0, 0.16, 0.8 + i * 0.1, 0, 0.12, 0, 0], 3))
    geometry.rotateY(i * Math.PI / 3)
    geometry.computeVertexNormals()
    blades.push(geometry)
  }
  const grass = new THREE.InstancedMesh(mergeGeometries(blades)!, new THREE.MeshLambertMaterial({ color: '#64705a', side: THREE.DoubleSide }), 450)
  for (let i = 0; i < 450; i++) {
    const z = between(-25, 104)
    const x = trailX(z) + (i % 2 ? 1 : -1) * between(2, 5.2)
    dummy.position.set(x, groundHeight(x, z), z)
    dummy.rotation.set(0, random() * 6, 0)
    dummy.scale.setScalar(between(0.3, 0.85))
    dummy.updateMatrix()
    grass.setMatrixAt(i, dummy.matrix)
  }
  scene.add(grass)
  blades.forEach(geometry => geometry.dispose())

  // Pale birches break up the spruce silhouettes without another alpha texture.
  const birch = new THREE.MeshLambertMaterial({ color: '#788582' })
  for (const [x, z, h] of [[-13, 94, 12], [-1, 89, 11], [-14, 66, 9], [8, 42, 10], [-11, 31, 8]]) {
    const y = groundHeight(x, z)
    beam(scene, new THREE.Vector3(x, y, z), new THREE.Vector3(x + 0.4, y + h, z), 0.14, birch)
    for (let i = 0; i < 5; i++) {
      beam(scene, new THREE.Vector3(x + 0.2, y + 4 + i, z), new THREE.Vector3(x + (i % 2 ? 1 : -1) * 1.7, y + 5.5 + i, z - 0.4), 0.04, birch)
    }
  }
}

function distantVillage(scene: THREE.Scene, glow: THREE.Texture, window: THREE.Texture) {
  const wall = new THREE.MeshLambertMaterial({ color: '#6b7470' })
  const roof = new THREE.MeshLambertMaterial({ color: '#303c40' })
  const lit = new THREE.MeshBasicMaterial({ map: window, color: '#b48f61' })
  for (const [x, z, size] of [[21, -9, 0.85], [32, -24, 1], [39, -37, 0.9], [25, -48, 0.85], [44, -57, 0.7]]) {
    const y = groundHeight(x, z)
    box(scene, wall, [4 * size, 3 * size, 3.6 * size], [x, y + 1.5 * size, z])
    for (const side of [-1, 1]) {
      const slope = box(scene, roof, [2.6 * size, 0.18, 4.3 * size], [x + side * size, y + 3.55 * size, z])
      slope.rotation.z = side * -0.6
      const pane = new THREE.Mesh(new THREE.PlaneGeometry(0.65 * size, 0.9 * size), lit)
      pane.position.set(x + side * size, y + 1.9 * size, z + 1.81 * size)
      scene.add(pane)
    }
  }
  const x = 31, z = -49, y = groundHeight(x, z)
  box(scene, wall, [3.1, 9.5, 3.1], [x, y + 4.75, z])
  const spire = new THREE.Mesh(new THREE.ConeGeometry(2.65, 6, 4), roof)
  spire.position.set(x, y + 12.5, z)
  spire.rotation.y = Math.PI / 4
  scene.add(spire)
  for (const side of [-1, 1]) {
    box(scene, lit, [0.42, 1.2, 0.04], [x + side * 0.7, y + 7.8, z + 1.57])
  }
  // Opaque, layered mountain silhouettes: no large transparent fog sheets.
  for (let layer = 0; layer < 3; layer++) {
    const positions: number[] = [], indices: number[] = []
    for (let i = 0; i <= 26; i++) {
      const x = -125 + i * 10
      const height = 15 + layer * 10 + Math.sin(i * 1.7 + layer) * 8 + random() * 9
      positions.push(x, -12, -94 - layer * 17, x, height, -94 - layer * 17)
      if (i < 26) {
        const a = i * 2
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
      }
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setIndex(indices)
    const mountain = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: ['#28393d', '#304147', '#394b52'][layer], side: THREE.DoubleSide, fog: false }))
    scene.add(mountain)
  }
  const farTrees = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 5), new THREE.MeshLambertMaterial({ color: '#293e3c' }), 100)
  const dummy = new THREE.Object3D()
  for (let i = 0; i < 100; i++) {
    const x = between(14, 70), z = between(-74, 18), h = between(4, 10)
    dummy.position.set(x, groundHeight(x, z) + h * 0.5, z)
    dummy.scale.set(h * 0.17, h, h * 0.17)
    dummy.updateMatrix()
    farTrees.setMatrixAt(i, dummy.matrix)
  }
  scene.add(farTrees)
}

function villageDetails(scene: THREE.Scene) {
  const workshop = new THREE.Group()
  workshop.position.set(-6.8, 0, 25.6)
  scene.add(workshop)
  const canopy = box(workshop, timber, [4.7, 0.14, 2.6], [0, 2.75, 0])
  canopy.rotation.x = 0.12
  for (const x of [-2.1, 2.1]) box(workshop, timber, [0.14, 2.65, 0.14], [x, 1.32, 0.95])
  box(workshop, endGrain, [2.4, 0.16, 0.8], [0, 1, 0.2])
  for (const x of [-1, 1]) box(workshop, timber, [0.15, 1, 0.65], [x, 0.5, 0.2])
  box(workshop, iron, [0.32, 0.22, 0.26], [0.7, 1.18, 0.2])
  box(workshop, timber, [0.65, 0.06, 0.35], [-0.4, 1.14, 0.2]).rotation.y = 0.25
  for (let i = 0; i < 7; i++) {
    beam(workshop, new THREE.Vector3(-1.7 + (i % 3) * 0.3, 0.2 + Math.floor(i / 3) * 0.26, -0.4), new THREE.Vector3(-1.7 + (i % 3) * 0.3, 0.2 + Math.floor(i / 3) * 0.26, -1.5), 0.16)
  }
  for (const [x, z, size] of [[1.8, 0.2, 0.6], [2, -0.5, 0.5], [-2.7, 0.6, 0.7]]) {
    box(workshop, endGrain, [size, size, size], [x, size * 0.5, z])
    for (const offset of [-0.2, 0.2]) box(workshop, timber, [0.07, size, size + 0.02], [x + offset, size * 0.5, z])
  }

  const well = new THREE.Group()
  well.position.set(-3.9, 0, -2)
  scene.add(well)
  const opening = new THREE.Mesh(new THREE.CircleGeometry(0.82, 12), iron)
  opening.rotation.x = -Math.PI / 2
  opening.position.y = 0.5
  well.add(opening)
  for (let row = 0; row < 3; row++) for (let i = 0; i < 12; i++) {
    const a = (i + row * 0.5) * Math.PI / 6
    const block = box(well, stone, [0.49, 0.24, 0.36], [Math.sin(a), row * 0.25 + 0.12, Math.cos(a)])
    block.rotation.y = a
  }
  for (const x of [-1.15, 1.15]) box(well, timber, [0.15, 2.7, 0.15], [x, 1.35, 0])
  beam(well, new THREE.Vector3(-1.2, 1.7, 0), new THREE.Vector3(1.2, 1.7, 0), 0.11)
  beam(well, new THREE.Vector3(0, 1.7, 0), new THREE.Vector3(0, 0.7, 0), 0.018)
  for (const side of [-1, 1]) {
    box(well, timber, [1.55, 0.12, 2.1], [side * 0.65, 2.7, 0]).rotation.z = side * -0.36
  }
  const bench = new THREE.Group()
  bench.position.set(4.2, 0, -5)
  bench.rotation.y = -0.3
  scene.add(bench)
  box(bench, endGrain, [2.7, 0.12, 0.62], [0, 0.65, 0])
  box(bench, endGrain, [2.7, 0.52, 0.08], [0, 1.1, -0.28])
  for (const x of [-1.05, 1.05]) box(bench, timber, [0.13, 1.25, 0.13], [x, 0.62, -0.22])
}

function makeFox(scene: THREE.Scene) {
  const group = new THREE.Group()
  group.userData.dynamic = true
  group.visible = false
  scene.add(group)
  const fur = new THREE.MeshLambertMaterial({ color: '#ad7041' })
  const cream = new THREE.MeshLambertMaterial({ color: '#bfb79c' })
  const dark = new THREE.MeshLambertMaterial({ color: '#242c2b' })
  const shape = (material: THREE.Material, scale: number[], position: number[]) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), material)
    mesh.scale.set(...scale as [number, number, number])
    mesh.position.set(...position as [number, number, number])
    group.add(mesh)
    return mesh
  }
  shape(fur, [0.6, 0.25, 0.23], [0, 0.61, 0])
  shape(cream, [0.24, 0.18, 0.19], [-0.4, 0.58, 0])
  shape(fur, [0.25, 0.2, 0.18], [-0.55, 0.8, 0])
  shape(cream, [0.23, 0.09, 0.13], [-0.73, 0.72, 0])
  shape(dark, [0.04, 0.04, 0.07], [-0.92, 0.74, 0])
  for (const z of [-0.12, 0.12]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.23, 4), fur)
    ear.position.set(-0.51, 1.02, z)
    group.add(ear)
  }
  const tail = shape(fur, [0.52, 0.14, 0.14], [0.9, 0.48, 0])
  tail.rotation.z = -0.3
  shape(cream, [0.19, 0.11, 0.11], [1.3, 0.35, 0])
  const legs: THREE.Group[] = []
  for (const x of [-0.38, 0.37]) for (const z of [-0.14, 0.14]) {
    const leg = new THREE.Group()
    leg.position.set(x, 0.52, z)
    box(leg, dark, [0.08, 0.42, 0.08], [0, -0.21, 0])
    group.add(leg)
    legs.push(leg)
  }
  let elapsed = -1
  let lastZ = 100
  return {
    update(delta: number, cameraZ: number, reducedMotion: boolean) {
      // One quiet encounter per approach. Moving back beyond the ridge rearms it.
      if (cameraZ > 88) { elapsed = -1; group.visible = false }
      if (elapsed < 0 && cameraZ < 80 && lastZ >= 80) elapsed = 0
      lastZ = cameraZ
      if (elapsed < 0 || elapsed > 16 || cameraZ < 59 || cameraZ > 83) {
        group.visible = false
        return false
      }
      group.visible = true
      if (!reducedMotion) elapsed += delta
      const t = reducedMotion ? 0.42 : Math.min(elapsed / 16, 1)
      const z = 65 + Math.sin(t * Math.PI) * 1.6
      const x = trailX(z) + 8 - t * 17
      group.position.set(x, groundHeight(x, z) + 0.08, z)
      group.rotation.y = Math.sin(t * Math.PI * 2) * 0.12
      legs.forEach((leg, i) => { leg.rotation.z = reducedMotion ? 0 : Math.sin(elapsed * 7 + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.35 })
      return !reducedMotion
    },
  }
}

export function addEnvironment(scene: THREE.Scene, glow: THREE.Texture, window: THREE.Texture) {
  bridge(scene)
  woodlandDetails(scene)
  distantVillage(scene, glow, window)
  villageDetails(scene)
  return makeFox(scene)
}

// Merge opaque scenery by material and 24m region, preserving local culling.
// Signs, instancing, sprites and the animal retain their own transforms.
export function batchScenery(scene: THREE.Scene) {
  scene.updateMatrixWorld(true)
  const batches = new Map<string, { material: THREE.Material, meshes: THREE.Mesh[], geometries: THREE.BufferGeometry[] }>()
  scene.traverse(object => {
    if (!(object instanceof THREE.Mesh) || object instanceof THREE.InstancedMesh || Array.isArray(object.material) || object.material.transparent || !object.geometry.getAttribute('normal')) return
    let parent: THREE.Object3D | null = object
    while (parent) {
      if (parent.userData.dynamic) return
      parent = parent.parent
    }
    const material = object.material
    const definition = material.toJSON()
    delete definition.uuid
    const region = Math.floor(object.getWorldPosition(new THREE.Vector3()).z / 24)
    const key = `${region}:${JSON.stringify(definition)}`
    let batch = batches.get(key)
    if (!batch) { batch = { material, meshes: [], geometries: [] }; batches.set(key, batch) }
    const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld)
    // All batched solids use position, normal and UV; strip unused attributes.
    for (const attribute of Object.keys(geometry.attributes)) if (!['position', 'normal', 'uv'].includes(attribute)) geometry.deleteAttribute(attribute)
    if (!geometry.getAttribute('uv')) geometry.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(geometry.getAttribute('position').count * 2), 2))
    batch.meshes.push(object)
    batch.geometries.push(geometry.index ? geometry.toNonIndexed() : geometry)
    if (geometry.index) geometry.dispose()
  })
  for (const batch of Array.from(batches.values())) {
    const geometry = mergeGeometries(batch.geometries)
    if (geometry) {
      geometry.computeBoundingSphere()
      scene.add(new THREE.Mesh(geometry, batch.material))
      batch.meshes.forEach(mesh => mesh.removeFromParent())
    }
    batch.geometries.forEach(geometry => geometry.dispose())
  }
}
