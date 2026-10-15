import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { branches, BranchId, branchOffset, groundHeight, trailX } from './trail'
import { branchIds } from './journey'

export type ForkSign = {
  id: BranchId
  focus: THREE.Vector3
  labels: { side: boolean; mesh: THREE.Mesh; corners: THREE.Vector3[] }[]
  highlight: (side: boolean | null) => void
}
function lettering(text: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024; canvas.height = 224
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#eed5a5'; ctx.font = 'bold 84px Georgia, serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 512, 112, 970)
  const map = new THREE.CanvasTexture(canvas)
  map.flipY = false; map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4
  return new THREE.MeshBasicMaterial({ map, alphaTest: .25, toneMapped: false })
}
/** Arms follow the actual outgoing trails. Both faces are painted, so no label is mirrored. */
export async function addForkSigns(scene: THREE.Scene): Promise<ForkSign[]> {
  const { scene: source } = await new GLTFLoader().loadAsync('/prototype/hidden-village/assets/signpost.glb')
  return branchIds.map(id => {
    const root = source.clone(true), b = branches[id]
    const z = b.start - 7, x = trailX(z) + (branchOffset(z, id) + branchOffset(z, id, false)) * .5
    root.position.set(x, groundHeight(x, z), z)
    scene.add(root)
    const woods: { side: boolean; material: THREE.MeshStandardMaterial }[] = []
    const labels: ForkSign['labels'] = []
    root.traverse(object => {
      if (object.userData.forkArm) {
        const side = object.userData.forkArm === 'branch', ahead = b.start - (id === 'workshop' ? 11 : 14)
        const dx = trailX(ahead) + branchOffset(ahead, id, side) - x, dz = ahead - z
        object.rotation.y = side ? Math.atan2(dz, -dx) : Math.atan2(-dz, dx)
      }
      if (!(object instanceof THREE.Mesh)) return
      if (!object.userData.forkLabel) {
        const material = object.material as THREE.MeshStandardMaterial
        if (/rain-dark oak/.test(material.name)) {
          object.material = material.clone()
          const wood = object.material as THREE.MeshStandardMaterial
          wood.emissive.set('#b78742'); wood.emissiveIntensity = .18
          if (object.parent?.userData.forkArm) woods.push({ side: object.parent.userData.forkArm === 'branch', material: wood })
        }
        return
      }
      const side = object.userData.forkLabel === 'branch'
      object.material = lettering(side ? b.title : b.alternative)
      object.geometry.computeBoundingBox()
      const box = object.geometry.boundingBox!.clone()
      // Opposite face has its own UV orientation and readable lettering.
      const back = object.clone()
      back.geometry = object.geometry.clone()
      const positions = back.geometry.getAttribute('position')
      for (let i = 0; i < positions.count; i++) positions.setXYZ(i, -positions.getX(i), positions.getY(i), .065)
      back.geometry.computeVertexNormals()
      back.userData = {}; object.parent!.add(back)
      box.min.x -= .44; box.max.x += .44; box.min.y -= .06; box.max.y += .06
      labels.push({ side, mesh: object, corners: [
        new THREE.Vector3(box.min.x, box.min.y, box.max.z), new THREE.Vector3(box.max.x, box.min.y, box.max.z),
        new THREE.Vector3(box.max.x, box.max.y, box.max.z), new THREE.Vector3(box.min.x, box.max.y, box.max.z),
      ] })
    })
    root.updateMatrixWorld(true)
    for (const label of labels) label.corners.forEach(point => label.mesh.localToWorld(point))
    return { id, labels, focus: root.localToWorld(new THREE.Vector3(0, 2.35, 0)), highlight: (side: boolean | null) => {
      for (const wood of woods) wood.material.emissiveIntensity = wood.side === side ? .8 : .18
    } }
  })
}
