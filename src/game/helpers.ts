import type { CollisionObject, Vec } from './type'

export function rotatePoint(p: Vec, center: Vec, angle: number) {
  return {
    x: (p.x - center.x) * Math.cos(angle) - (p.y - center.y) * Math.sin(angle) + center.x,
    y: (p.x - center.x) * Math.sin(angle) + (p.y - center.y) * Math.cos(angle) + center.y,
  }
}

export function randomInt(...args: [number] | [number, number] | []) {
  switch (args.length) {
    // If one argument generate between 0 and args[0]
    case 1:
      return Math.floor(Math.random() * (args[0] + 1))

    // If two arguments generate between args[0] and args[1]
    case 2:
      return Math.floor(Math.random() * (args[1] - args[0] + 1)) + args[0]

    // Otherwise generate between 0 and 1
    default:
      return Math.random()
  }
}

export function randomFloat(...args: [number] | [number, number] | []) {
  switch (args.length) {
    // If one argument generate between 0 and args[0]
    case 1:
      return Math.random() * (args[0] + 1)

    // If two arguments generate between args[0] and args[1]
    case 2:
      return Math.random() * (args[1] - args[0] + 1) + args[0]

    // Otherwise generate between 0 and 1
    default:
      return Math.random()
  }
}

export function asteroidVertices(count: number, rad: number) {
  return new Array(count).fill('').map((_, i) => ({
    x: (-Math.sin(((360 / count) * i * Math.PI) / 180) + (Math.round(Math.random() * 2 - 1) * Math.random()) / 3) * rad,
    y: (-Math.cos(((360 / count) * i * Math.PI) / 180) + (Math.round(Math.random() * 2 - 1) * Math.random()) / 3) * rad,
  }))
}

function checkCollision<T1 extends CollisionObject, T2 extends CollisionObject>(item1: T1, item2: T2) {
  const vx = item1.pos.x - item2.pos.x
  const vy = item1.pos.y - item2.pos.y
  const length = Math.sqrt(vx * vx + vy * vy)

  if (length < item1.radius + item2.radius) {
    return true
  }
  return false
}

export function checkCollisionsWith<T1 extends CollisionObject, T2 extends CollisionObject>(
  items1: T1[],
  items2: T2[],
  onCollission: (item1: T1, item2: T2) => void
) {
  let a = items1.length - 1
  let b

  for (a; a > -1; --a) {
    b = items2.length - 1
    for (b; b > -1; --b) {
      const item1 = items1[a]
      const item2 = items2[b]

      if (checkCollision(item1, item2)) {
        onCollission(item1, item2)
      }
    }
  }
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, randomInt(0, ms)))
}
