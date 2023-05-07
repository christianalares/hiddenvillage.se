import { Ship } from './Ship'
import { rotatePoint } from './helpers'

export class Bullet {
  position: { x: number; y: number }
  rotation: number
  velocity: { x: number; y: number }
  radius: number
  delete: boolean
  ctx: CanvasRenderingContext2D

  constructor(args: { ctx: CanvasRenderingContext2D; ship: Ship }) {
    let posDelta = rotatePoint({ x: 0, y: -20 }, { x: 0, y: 0 }, (args.ship.rotation * Math.PI) / 180)
    this.ctx = args.ctx
    this.position = {
      x: args.ship.position.x + posDelta.x,
      y: args.ship.position.y + posDelta.y,
    }
    this.rotation = args.ship.rotation
    this.velocity = {
      x: posDelta.x / 2,
      y: posDelta.y / 2,
    }
    this.radius = 2

    this.delete = false
  }

  destroy() {
    this.delete = true
  }

  render(state: { screen: { width: number; height: number } }) {
    // Move
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    // Delete if it goes out of bounds
    if (
      this.position.x < 0 ||
      this.position.y < 0 ||
      this.position.x > state.screen.width ||
      this.position.y > state.screen.height
    ) {
      this.destroy()
    }

    // Draw
    this.ctx.save()
    this.ctx.translate(this.position.x, this.position.y)
    this.ctx.rotate((this.rotation * Math.PI) / 180)
    this.ctx.fillStyle = '#FFF'
    ;(this.ctx.lineWidth = 0), 5
    this.ctx.beginPath()
    this.ctx.arc(0, 0, 2, 0, 2 * Math.PI)
    this.ctx.closePath()
    this.ctx.fill()
    this.ctx.restore()
  }
}
