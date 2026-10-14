const smooth = (value: number) => {
  const t = Math.max(0, Math.min(1, value))
  return t * t * (3 - 2 * t)
}

// The same route defines the ground, bridge and camera. Keep these in world metres
// so future junctions can connect to the route without moving the scenery.
export const trailX = (z: number) => Math.sin(z * 0.105) * 0.72
  - smooth((z - 43) / 44) * 8
  + Math.sin((z - 22) * 0.14) * 1.8 * smooth((z - 22) / 18)

export const trailHeight = (z: number) => {
  return smooth((z - 22) / 74) * 10.5
}

export const bridgeStart = 51
export const bridgeEnd = 58
export const onBridge = (z: number) => z > bridgeStart && z < bridgeEnd

export const groundHeight = (x: number, z: number) => {
  const offset = x - trailX(z)
  const edge = smooth((Math.abs(offset) - 2) / 8)
  const ridge = smooth((z - 33) / 30)
  // Raised forest bank on the left; an open, lower valley on the right.
  const bank = offset < 0 ? edge * (1.4 + ridge * 4.5) : -edge * ridge * 7
  const uneven = edge * (Math.sin(x * 0.38 + z * 0.12) * 0.7 + Math.cos(z * 0.29) * 0.35)
  const road = 1 - smooth((Math.abs(offset) - 1.65) / 0.65)
  const bridgeDip = smooth((z - 50.51) / 0.7) * smooth((58.29 - z) / 0.7)
  const ravine = Math.exp(-Math.pow((z - 54.5 + Math.sin(x * 0.12) * 0.8) / 2.15, 2)) * 4.8 * (1 - road + road * bridgeDip)
  const villageHill = Math.exp(-Math.pow((x - 32) / 17, 2) - Math.pow((z + 46) / 25, 2)) * 18 * smooth((Math.abs(offset) - 1.8) / 6)
  return trailHeight(z) + bank + uneven - ravine + villageHill
}
