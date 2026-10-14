import * as THREE from 'three'
import { groundHeight, trailHeight, trailX } from './trail'
import { addEnvironment } from './environment'
import { addWildlife } from './wildlife'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

type World = {
  houseLights: THREE.PointLight[]
  motes: THREE.Points
  signTargets: THREE.Object3D[]
  update: (camera: THREE.Camera, time: number, delta: number, motion: boolean) => void
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

function addSign(scene: THREE.Scene, glow: THREE.Texture) {
  const group = new THREE.Group()
  group.position.set(2.4, groundHeight(2.4, 16) - 0.1, 16)
  group.scale.setScalar(0.75)
  const wood = new THREE.MeshStandardMaterial({ color: '#4b3529', roughness: 1 })
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 4, 9), wood)
  post.position.y = 2
  group.add(post)
  const targets: THREE.Object3D[] = []
  const labels = ['WORKSHOP  ←', 'VILLAGE  →']
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i]
    const board = new THREE.Mesh(new RoundedBoxGeometry(3.55, 0.83, 0.14, 2, 0.035), [wood, wood, wood, wood, new THREE.MeshBasicMaterial({ map: signTexture(label) }), wood])
    board.position.set(i ? 0.33 : -0.32, 3.25 - i * 0.94, 0.22)
    board.rotation.z = i ? -0.035 : 0.035
    board.userData.destinationZ = i ? 3 : 31
    group.add(board)
    targets.push(board)
  }
  const light = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: '#e9b97e', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }))
  light.position.set(0, 2.7, 0.5)
  light.scale.set(1.8, 1.8, 1)
  light.material.opacity = 0.16
  group.add(light)
  scene.add(group)
  return targets
}

function addAtmosphere(scene: THREE.Scene) {
  const positions: number[] = []
  for (let i = 0; i < 80; i++) {
    const z = between(-70, 211)
    positions.push(trailX(z) + between(-17, 17), trailHeight(z) + between(0.8, 7), z)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  const motes = new THREE.Points(geometry, new THREE.PointsMaterial({ color: '#b6a887', size: 0.035, transparent: true, opacity: 0.55, sizeAttenuation: true, depthWrite: false }))
  scene.add(motes)
  return motes
}

export async function buildWorld(scene: THREE.Scene): Promise<World> {
  const authored = await addEnvironment(scene)
  const glow = glowTexture()
  const positions = authored.lights.flatMap(source => source.position.toArray())
  const points = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  scene.add(new THREE.Points(points, new THREE.PointsMaterial({ map: glow, color: '#ffc16c', size: 1.55, transparent: true, depthWrite: false, opacity: 0.65, blending: THREE.AdditiveBlending, toneMapped: false })))
  const wildlife = await addWildlife(scene, authored.animals)
  const leaves = addDriftingLeaves(scene)
  const signTargets = addSign(scene, glow)
  const motes = addAtmosphere(scene)
  return { houseLights: authored.lights, motes, signTargets, update: (camera, time, delta, motion) => {
    authored.update(camera, time)
    wildlife(camera, delta, motion)
    leaves.material.uniforms.time.value = time
    leaves.visible = motion
  } }
}

function addDriftingLeaves(scene: THREE.Scene) {
  const positions: number[] = [], phases: number[] = []
  for (let i = 0; i < 72; i++) {
    const z = between(-55, 180)
    positions.push(trailX(z) + between(-7, 7), trailHeight(z) + between(2, 7), z)
    phases.push(random())
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('phase', new THREE.Float32BufferAttribute(phases, 1))
  const material = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } }, transparent: true, depthWrite: false,
    vertexShader: `attribute float phase; uniform float time; varying float turn;
      void main(){ vec3 p=position; p.y-=fract(time*.035+phase)*2.0; p.x+=sin(time*.4+phase*30.)*.65;
      turn=time*.6+phase*20.; vec4 view=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*view;
      gl_PointSize=clamp(90./-view.z,1.,6.); }`,
    fragmentShader: `varying float turn; void main(){ vec2 p=gl_PointCoord-.5;
      p=mat2(cos(turn),-sin(turn),sin(turn),cos(turn))*p;
      if(length(p*vec2(1.8,1.))>.44)discard; gl_FragColor=vec4(.29,.25,.12,.62); }`,
  })
  const leaves = new THREE.Points(geometry, material); scene.add(leaves); return leaves
}
