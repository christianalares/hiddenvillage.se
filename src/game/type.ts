export type Vec = {
  x: number
  y: number
}

export type KeyPressedState = {
  up: boolean
  right: boolean
  left: boolean
  shoot: boolean
}

export type GameConfig = {
  keys: {
    up: string
    right: string
    left: string
    shoot: string
  }
  onGameOver: () => void
  onGameComplete: () => void
  onPointsUpdate: (points: number) => void
}

export type GameConfigInput = {
  keys?: GameConfig['keys']
  onGameOver?: GameConfig['onGameOver']
  onGameComplete?: GameConfig['onGameComplete']
  onPointsUpdate?: GameConfig['onPointsUpdate']
}

export type CollisionObject = {
  pos: Vec
  radius: number
}
