import { BranchId, routePosition, startZ, endZ } from './trail'

/** Canonical progress identifies gates; metres keep scroll speed equal on winding trails. */
export class RouteDistance {
  private distances: number[] = [0]
  private segments = Math.ceil((startZ - endZ) * 4)
  length = 0
  constructor(choices: Record<BranchId, boolean>) {
    let previous = routePosition(startZ, choices)
    for (let i = 1; i <= this.segments; i++) {
      const p = routePosition(startZ + (endZ - startZ) * i / this.segments, choices)
      this.length += Math.hypot(p.x - previous.x, p.y - previous.y, p.z - previous.z)
      this.distances.push(this.length)
      previous = p
    }
  }
  metres(progress: number) {
    const index = Math.max(0, Math.min(1, progress)) * this.segments
    const lo = Math.floor(index), hi = Math.min(this.segments, lo + 1)
    return this.distances[lo] + (this.distances[hi] - this.distances[lo]) * (index - lo)
  }
  progress(metres: number, stops: number[] = []) {
    // Browser scroll positions round to pixels; preserve exact decision waypoints.
    const stop = stops.find(progress => Math.abs(this.metres(progress) - metres) < .06)
    if (stop !== undefined) return stop
    const distance = Math.max(0, Math.min(this.length, metres))
    let lo = 0, hi = this.segments
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2)
      if (this.distances[mid] < distance) lo = mid
      else hi = mid
    }
    return (lo + (distance - this.distances[lo]) / (this.distances[hi] - this.distances[lo])) / this.segments
  }
  advance(progress: number, metres: number) { return this.progress(this.metres(progress) + metres) }
}
