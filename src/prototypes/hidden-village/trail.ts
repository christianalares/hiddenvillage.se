/** Metres shared by the authored terrain, route branches and wildlife clearings. */
export const smooth = (value: number) => {
  const t = Math.max(0, Math.min(1, value))
  return t * t * (3 - 2 * t)
}
export const startZ = 210
export const endZ = -62
export const branches = {
  ridge: { start: 156, end: 90, offset: -85, title: 'Heather ridge', alternative: 'Through the hollow' },
  workshop: { start: 39, end: 14, offset: -2.9, mainOffset: 4.5, title: 'Workshop', alternative: 'Village' },
  pond: { start: -4, end: -58, offset: -78, title: 'Reed pond', alternative: 'Village lane' },
}
export type BranchId = keyof typeof branches
export const branchOffset = (z: number, id: BranchId, side = true) => {
  const b = branches[id]
  if (z >= b.start || z <= b.end) return 0
  return (side ? b.offset : ('mainOffset' in b ? b.mainOffset : 0)) * Math.sin(Math.PI * (b.start - z) / (b.start - b.end)) ** 2
}
export const trailX = (z: number) => Math.sin(z * 0.105) * 0.72
  - smooth((z - 43) / 44) * 8
  + Math.sin((z - 22) * 0.14) * 1.8 * smooth((z - 22) / 18)
  + Math.sin((z - 110) * 0.055) * 3 * smooth((z - 110) / 18)
  - smooth((z - 165) / 35) * 7
  + Math.sin(Math.min(1, Math.max(0, (-z - 12) / 50)) * Math.PI) * 6
export const trailHeight = (z: number) => smooth((z - 22) / 74) * 10.5
  + 12 * smooth((z - 100) / 50) + 16 * smooth((z - 155) / 55)
  - 2.8 * smooth((-z - 18) / 44) + 1.4 * Math.exp(-Math.pow((z + 28) / 10, 2))
export const bridgeStart = 51
export const bridgeEnd = 58
export const onBridge = (z: number) => z > bridgeStart && z < bridgeEnd
export const wildlifeSites = [{ x: 12.5, z: 141, rotation: -0.85, scale: 1 }, { x: 16, z: 137, rotation: -0.4, scale: 0.88 }, { x: -110, z: 118, rotation: 1.1, scale: 1 }, { x: -100, z: -16, rotation: 0.6, scale: 0.84 }]
const rawGround = (x: number, z: number) => {
  const offset = x - trailX(z)
  const edge = smooth((Math.abs(offset) - 2) / 8)
  const ridge = smooth((z - 33) / 30)
  const bank = offset < 0 ? edge * (1.4 + ridge * 4.5) : -edge * ridge * 7
  const uneven = edge * (Math.sin(x * 0.38 + z * 0.12) * 0.7 + Math.cos(z * 0.29) * 0.35)
  const road = 1 - smooth((Math.abs(offset) - 1.65) / 0.65)
  const bridgeDip = smooth((z - 50.51) / 0.7) * smooth((58.29 - z) / 0.7)
  const ravine = Math.exp(-Math.pow((z - 54.5 + Math.sin(x * 0.12) * 0.8) / 2.15, 2)) * 4.8 * (1 - road + road * bridgeDip)
  const hill = Math.exp(-Math.pow((x - 32) / 17, 2) - ((z + 46) / 25) ** 2) * 18 * smooth((Math.abs(offset) - 1.8) / 6)
  const pond = 3.2 * Math.exp(-Math.pow((x + 25) / 7, 4) - ((z + 26) / 11) ** 4)
  const outer = smooth((Math.abs(offset) - 27) / 18) * (15 * Math.exp(-Math.pow((x + 93) / 30, 2) - ((z - 123) / 33) ** 2) - 5 * Math.exp(-Math.pow((x + 76) / 27, 2) - ((z + 30) / 24) ** 2))
  return trailHeight(z) + bank + uneven - ravine + hill - pond + outer
}
export const groundHeight = (x: number, z: number) => {
  let y = rawGround(x, z)
  for (const site of wildlifeSites) {
    const d = Math.hypot(x - site.x, z - site.z)
    const blend = 1 - smooth((d - 2) / 2)
    y += (rawGround(site.x, site.z) - y) * blend
  }
  return y
}
export const routePosition = (z: number, choices: Record<BranchId, boolean>) => {
  const x = trailX(z) + (choices.ridge ? branchOffset(z, 'ridge') : 0) + branchOffset(z, 'workshop', choices.workshop) + (choices.pond ? branchOffset(z, 'pond') : 0)
  return { x, y: (z > 50.6 && z < 58.3 ? trailHeight(z) : groundHeight(x, z)) + 1.76, z }
}
