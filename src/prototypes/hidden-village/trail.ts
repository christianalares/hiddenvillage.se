export const trailX = (z: number) => Math.sin(z * 0.105) * 0.72 - Math.max(0, Math.min(1, (z - 43) / 40)) * 8

export const trailHeight = (z: number) => {
  const t = Math.max(0, Math.min(1, (z - 22) / 65))
  return (t * t * (3 - 2 * t)) * 8.2
}
