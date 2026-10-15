import * as THREE from 'three'
import { branchOffset, groundHeight, trailHeight, trailX } from './trail'
import { addEnvironment } from './environment'
import { addWildlife } from './wildlife'
import { addForkSigns, ForkSign } from './signposts'
import { Inspectable } from './inspectables'
import { DiscoveryAnchor } from './stories'
import { addMist } from './weather'

type World = {
  houseLights: THREE.PointLight[]
  motes: THREE.Points
  forkSigns: ForkSign[]
  discoveries: DiscoveryAnchor[]
  inspectables: Inspectable[]
  wildlifeNearby: (camera: THREE.Camera) => boolean
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
  const forkSigns = await addForkSigns(scene)
  const motes = addAtmosphere(scene)
  const mist = addMist(scene)
  return { houseLights: authored.lights, motes, forkSigns, discoveries: authored.discoveries, inspectables: authored.inspectables, wildlifeNearby: wildlife.nearby, update: (camera, time, delta, motion) => {
    authored.update(camera, time)
    mist(time)
    wildlife.update(camera, delta, motion)
    leaves.material.uniforms.time.value = time
    leaves.visible = motion
  } }
}

function addDriftingLeaves(scene: THREE.Scene) {
  const positions: number[] = [], phases: number[] = []
  for (let i = 0; i < 150; i++) {
    const z = between(-55, 180)
    const x = trailX(z) + (i % 2 ? branchOffset(z, z > 0 ? 'ridge' : 'pond') : 0) + between(-9, 9)
    positions.push(x, groundHeight(x, z) + between(2, 7), z)
    phases.push(random())
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('phase', new THREE.Float32BufferAttribute(phases, 1))
  const material = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } }, transparent: true, depthWrite: false,
    vertexShader: `attribute float phase; uniform float time; varying float turn;
      void main(){ vec3 p=position; p.y-=fract(time*.075+phase)*2.0; p.x+=sin(time*.65+phase*30.)*2.5;
      turn=time*.6+phase*20.; vec4 view=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*view;
      gl_PointSize=clamp(90./-view.z,1.,8.); }`,
    fragmentShader: `varying float turn; void main(){ vec2 p=gl_PointCoord-.5;
      p=mat2(cos(turn),-sin(turn),sin(turn),cos(turn))*p;
      if(length(p*vec2(1.8,1.))>.44)discard; gl_FragColor=vec4(.29,.25,.12,.62); }`,
  })
  const leaves = new THREE.Points(geometry, material); scene.add(leaves); return leaves
}
