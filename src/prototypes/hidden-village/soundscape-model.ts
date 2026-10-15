import { onBridge, smooth } from './trail'

export type Surface = 'grass' | 'leaves' | 'wood' | 'stone'
export type SoundPose = {
  x: number; y: number; z: number
  forwardX: number; forwardZ: number
  /** Distance along the route; camera inspection and looking never count as steps. */
  metres: number
  walking: boolean
}
const near = (distance: number, radius: number) => 1 - smooth(distance / radius)

export function soundscapeAt(x: number, z: number) {
  const ridge = smooth((-x - 40) / 30) * smooth((z - 90) / 15)
  const exposed = Math.max(smooth((z - 155) / 40), ridge)
  const thicket = near(Math.abs(z - 81), 15)
  const village = smooth((45 - z) / 25) * (1 - smooth((-x - 15) / 25))
  const home = near(Math.hypot(x, z + 62), 18)
  const bridge = near(Math.hypot(x + 3, z - 54.5), 23)
  const pond = near(Math.hypot(x + 25, z + 26), 30)
  const surface: Surface = onBridge(z) ? 'wood' : village > .65 ? 'stone'
    : exposed > .55 ? 'grass' : 'leaves'
  return {
    woodland: .50 - exposed * .23 - village * .12 + thicket * .08,
    wind: .08 + exposed * .46 + bridge * .12,
    water: Math.max(bridge * .55, pond * .30),
    score: .15 + thicket * .08 - home * .07,
    waterX: bridge >= pond ? -3 : -25,
    waterZ: bridge >= pond ? 54.5 : -26,
    surface,
  }
}

/** Project a world source onto the listener's horizontal right vector. */
export function sourcePan(pose: SoundPose, x: number, z: number) {
  const dx = x - pose.x, dz = z - pose.z
  const length = Math.hypot(dx, dz) * Math.hypot(pose.forwardX, pose.forwardZ)
  return length < .001 ? 0 : Math.max(-.85, Math.min(.85, (-pose.forwardZ * dx + pose.forwardX * dz) / length))
}

/** Travel-driven cadence with no delayed queue after a fast scroll or tab return. */
export class FootstepCadence {
  private previous: number | null = null
  private distance = 0
  private lastStep = -Infinity
  reset() { this.previous = null; this.distance = 0; this.lastStep = -Infinity }
  update(metres: number, now: number, walking: boolean) {
    const travelled = this.previous === null ? 0 : Math.abs(metres - this.previous)
    this.previous = metres
    if (!walking || travelled > 6) { this.distance = 0; return false }
    this.distance += travelled
    if (this.distance < .83 || now - this.lastStep < .29) return false
    this.distance %= .83
    this.lastStep = now
    return true
  }
}
