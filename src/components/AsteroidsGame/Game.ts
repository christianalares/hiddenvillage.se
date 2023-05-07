type Pos = {
  x: number
  y: number
}

type Keys = {
  up: boolean
  right: boolean
  left: boolean
  space: boolean
}

class Ship {
  ctx: CanvasRenderingContext2D
  pos: Pos
  keys: Keys

  constructor(args: { ctx: CanvasRenderingContext2D; pos: Pos }) {
    this.ctx = args.ctx
    this.pos = args.pos
    this.keys = {
      up: false,
      right: false,
      left: false,
      space: false,
    }

    this.bindKeyboardEvents()
  }

  bindKeyboardEvents() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
    document.addEventListener('keyup', this.handleKeyUp.bind(this))
  }

  handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowUp') {
      this.keys.up = true
    }
    if (e.key === 'ArrowRight') {
      this.keys.right = true
    }
    if (e.key === 'ArrowLeft') {
      this.keys.left = true
    }
    if (e.key === ' ') {
      this.keys.space = true
    }
  }

  handleKeyUp(e: KeyboardEvent) {
    if (e.key === 'ArrowUp') {
      this.keys.up = false
    }
    if (e.key === 'ArrowRight') {
      this.keys.right = false
    }
    if (e.key === 'ArrowLeft') {
      this.keys.left = false
    }
    if (e.key === ' ') {
      this.keys.space = false
    }
  }
}

export class Game {
  ctx: CanvasRenderingContext2D
  ship: Ship

  constructor(args: { ctx: CanvasRenderingContext2D; ship: Ship }) {
    this.ctx = args.ctx
    this.ship = args.ship
  }
}
