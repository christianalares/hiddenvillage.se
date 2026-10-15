import { branches, BranchId, startZ, endZ } from './trail'
import { RouteDistance } from './route-distance'

export const branchIds = Object.keys(branches) as BranchId[]
export const forkStop = (id: BranchId) => branches[id].start + 1
export const progressAt = (z: number) => Math.max(0, Math.min(1, (startZ - z) / (startZ - endZ)))
export const zAt = (progress: number) => startZ + (endZ - startZ) * progress

/** Only fork decisions constrain travel. Never retain overshoot or queued wheel momentum. */
export class Journey {
  choices: Record<BranchId, boolean> = { ridge: false, workshop: false, pond: false }
  private resolved = new Set<BranchId>()
  pending: BranchId | null = null
  launching: BranchId | null = null
  target = 0

  request(progress: number) {
    if (this.launching) return this.target
    if (this.pending) {
      if (progress >= this.target) return this.target
      this.pending = null
    }
    const desired = Math.max(0, Math.min(1, progress))
    const next = branchIds.find(id => !this.resolved.has(id) && desired >= progressAt(forkStop(id)))
    if (next) {
      this.pending = next
      this.target = progressAt(forkStop(next))
    } else this.target = desired
    return this.target
  }

  choose(side: boolean) {
    if (!this.pending) return null
    const id = this.pending
    this.choices[id] = side
    this.resolved.add(id)
    this.pending = null
    this.launching = id
    // Six metres along the chosen route; both curves coincide at the decision point.
    this.target = new RouteDistance(this.choices).advance(progressAt(forkStop(id)), 6)
    return this.target
  }

  arrive(progress: number) {
    if (this.launching && Math.abs(progress - this.target) < 0.00001) this.launching = null
    // Rearm only after the CAMERA has returned, never as soon as a backwards scroll starts.
    for (const id of branchIds) {
      const gate = progressAt(forkStop(id))
      if (!this.pending && !this.launching && this.resolved.has(id) && progress <= gate + 0.00001) {
        this.resolved.delete(id)
        // The fork's own waypoint should reopen its signs, including when arriving backwards.
        if (Math.abs(progress - this.target) < 0.00001 && Math.abs(this.target - gate) < 0.00001) {
          this.pending = id
          this.target = gate
        }
      }
    }
  }

  backTo(progress: number) {
    const gate = this.pending ?? this.launching
    if (gate && progress < progressAt(forkStop(gate) - 0.01)) {
      this.pending = this.launching = null
      this.target = progress
      return true
    }
    return false
  }
}
