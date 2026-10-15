import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { branches, BranchId, groundHeight, trailX } from './trail'
import { branchIds, forkStop } from './journey'

export type ForkSign = {
  id: BranchId
  focus: THREE.Vector3
  labels: { side: boolean; mesh: THREE.Mesh; corners: THREE.Vector3[] }[]
}

function lettering(text: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024; canvas.height = 224
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#eed5a5'
  ctx.font = 'bold 68px Georgia, serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(text, 512, 112, 970)
  const map = new THREE.CanvasTexture(canvas)
  map.flipY = false // Blender/glTF UVs already use image coordinates with the origin at the top.
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = 4
  return new THREE.MeshBasicMaterial({ map, alphaTest: 0.25, toneMapped: false })
}

/** Small shared Blender asset. The world owns the signs; HTML only supplies hit/focus areas. */
export async function addForkSigns(scene: THREE.Scene): Promise<ForkSign[]> {
  const { scene: source } = await new GLTFLoader().loadAsync('/prototype/hidden-village/assets/signpost.glb')
  return branchIds.map(id => {
    const root = source.clone(true)
    const z = branches[id].start - 6
    const x = trailX(z) + 2.8
    root.position.set(x, groundHeight(x, z), z)
    root.rotation.y = Math.atan2(trailX(forkStop(id)) - x, forkStop(id) - z)
    scene.add(root)
    root.updateMatrixWorld(true)
    const labels: ForkSign['labels'] = []
    root.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return
      if (!object.userData.forkLabel) {
        const material = object.material as THREE.MeshStandardMaterial
        if (/rain-dark oak/.test(material.name)) { material.emissive.set('#7c5030'); material.emissiveIntensity = .16 }
        return
      }
      const side = object.userData.forkLabel === 'branch'
      object.material = lettering(side ? branches[id].title : branches[id].alternative)
      object.geometry.computeBoundingBox()
      const box = object.geometry.boundingBox!.clone()
      // Cover the wooden arrow as well as its lettering, with generous tap targets.
      box.min.x -= 0.44; box.max.x += 0.44
      box.min.y -= 0.06; box.max.y += 0.06
      const corners = [
        new THREE.Vector3(box.min.x, box.min.y, box.max.z),
        new THREE.Vector3(box.max.x, box.min.y, box.max.z),
        new THREE.Vector3(box.max.x, box.max.y, box.max.z),
        new THREE.Vector3(box.min.x, box.max.y, box.max.z),
      ].map(point => object.localToWorld(point))
      labels.push({ side, mesh: object, corners })
    })
    return { id, labels, focus: root.localToWorld(new THREE.Vector3(0, 2.35, 0)) }
  })
}
