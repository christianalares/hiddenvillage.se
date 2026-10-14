import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { AnimalAnchor } from './environment'

/** Idle-only deer stand in flat authored clearings; no root translation or sliding walk. */
export async function addWildlife(scene: THREE.Scene, anchors: AnimalAnchor[]) {
  const source = await new GLTFLoader().loadAsync('/prototype/hidden-village/assets/deer.glb')
  const shadowCanvas = document.createElement('canvas')
  shadowCanvas.width = shadowCanvas.height = 64
  const ctx = shadowCanvas.getContext('2d')!
  const shade = ctx.createRadialGradient(32, 32, 2, 32, 32, 31)
  shade.addColorStop(0, 'rgba(0,0,0,.44)'); shade.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = shade; ctx.fillRect(0, 0, 64, 64)
  const shadowMap = new THREE.CanvasTexture(shadowCanvas)
  const animals = anchors.map((anchor, index) => {
    const root = clone(source.scene)
    root.position.copy(anchor.position)
    root.rotation.y = anchor.rotation
    root.scale.multiplyScalar(anchor.scale)
    root.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return
      object.frustumCulled = false // A skinned mesh's bind-pose bounds are not its animated bounds.
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        if (material instanceof THREE.MeshStandardMaterial) { material.roughness = 1; material.metalness = 0 }
      }
    })
    const mixer = new THREE.AnimationMixer(root)
    const clip = source.animations.find(a => a.name === (index ? 'Eating' : 'Idle')) ?? source.animations[0]
    if (clip) mixer.clipAction(clip).play()
    mixer.update(index * 1.7)
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.4 * anchor.scale, 2.1 * anchor.scale), new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }))
    shadow.rotation.set(-Math.PI / 2, 0, anchor.rotation)
    shadow.position.copy(anchor.position).y += 0.015
    scene.add(root, shadow)
    return { root, shadow, mixer, position: anchor.position }
  })
  return (camera: THREE.Camera, delta: number, motion: boolean) => {
    for (const animal of animals) {
      const visible = camera.position.distanceToSquared(animal.position) < 85 ** 2
      animal.root.visible = animal.shadow.visible = visible
      if (visible && motion) animal.mixer.update(delta * 0.7)
    }
  }
}
