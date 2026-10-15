import * as THREE from 'three'

export function letterEye(point: THREE.Vector3, aspect: number) {
  const vertical = .825 / (.72 * 2 * Math.tan(THREE.MathUtils.degToRad(61 / 2)))
  const horizontal = .66 / (.84 * 2 * Math.tan(THREE.MathUtils.degToRad(61 / 2)) * aspect)
  const distance = Math.max(vertical, horizontal)
  return point.clone().add(new THREE.Vector3(0, distance * .985, distance * .17))
}

/** One camera, one world. Inspection moves the visitor, never the object being read. */
export function createInspection(camera: THREE.PerspectiveCamera, changed: (active: boolean) => void, wake: () => void) {
  let opener: HTMLElement | null = null
  let key: string | null = null, closing = false, elapsed = 0, settled = false
  let fromFov = 61, toFov = 61
  let approach: THREE.CatmullRomCurve3 | null = null, via: THREE.Vector3[] = []
  const from = new THREE.Vector3(), to = new THREE.Vector3(), home = new THREE.Vector3()
  const fromQ = new THREE.Quaternion(), toQ = new THREE.Quaternion(), homeQ = new THREE.Quaternion()
  const notePoint = new THREE.Vector3()
  const pose = new THREE.PerspectiveCamera()
  return {
    get active() { return key !== null },
    get key() { return key },
    get moving() { return key !== null && !settled },
    open(id: string, point: THREE.Vector3, eye: THREE.Vector3, fov = 61, waypoints: THREE.Vector3[] = []) {
      if (key) return
      opener = document.activeElement as HTMLElement
      key = id; closing = settled = false; elapsed = 0
      home.copy(camera.position); homeQ.copy(camera.quaternion)
      from.copy(camera.position); fromQ.copy(camera.quaternion); fromFov = camera.fov
      notePoint.copy(point)
      to.copy(eye); pose.position.copy(eye); pose.lookAt(point); toQ.copy(pose.quaternion); toFov = fov
      via=waypoints.map(p=>p.clone())
      approach=via.length?new THREE.CatmullRomCurve3([from.clone(),...via,to.clone()],false,'centripetal'):null
      document.body.dataset.inspection = id
      changed(true); wake()
    },
    resize(aspect: number) {
      if (!key?.startsWith('note:') || closing) return
      to.copy(letterEye(notePoint, aspect)); pose.position.copy(to); pose.lookAt(notePoint); toQ.copy(pose.quaternion)
      if (settled) { from.copy(to); fromQ.copy(toQ) }
    },
    close() {
      if (!key || closing) return
      from.copy(camera.position); fromQ.copy(camera.quaternion); fromFov = camera.fov
      to.copy(home); toQ.copy(homeQ); toFov = 61
      approach=via.length?new THREE.CatmullRomCurve3([from.clone(),...via.slice().reverse(),home.clone()],false,'centripetal'):null
      closing = true; settled = false; elapsed = 0; wake()
    },
    apply(delta: number, reducedMotion: boolean) {
      if (!key) return
      elapsed += delta
      const t = settled || reducedMotion ? 1 : Math.min(1, elapsed / (approach ? 3.4 : closing ? .9 : 1.5))
      const ease = t * t * (3 - 2 * t)
      if(approach)approach.getPointAt(ease,camera.position)
      else camera.position.lerpVectors(from, to, ease)
      camera.quaternion.slerpQuaternions(fromQ, toQ, ease)
      camera.fov = THREE.MathUtils.lerp(fromFov, toFov, ease); camera.updateProjectionMatrix()
      document.body.style.setProperty('--inspection-blend', String(closing ? 1-ease : ease))
      settled = t === 1
      if (closing && settled) {
        key = null; closing = false; delete document.body.dataset.inspection; changed(false); opener?.focus({preventScroll:true})
      }
    },
  }
}
export type Inspection = ReturnType<typeof createInspection>
