import { v4 as uuidv4 } from 'uuid'
import { AsteroidsGame } from './AsteroidsGame'
import { rotatePoint } from './helpers'
import type { Vec } from './type'

export class Bullet {
  id: string
  game: AsteroidsGame
  pos: Vec
  rotation: number
  vel: Vec
  radius: number

  constructor(args: { game: AsteroidsGame }) {
    this.id = uuidv4()

    const posDelta = rotatePoint({ x: 0, y: -20 }, { x: 0, y: 0 }, (args.game.ship.rotation * Math.PI) / 180)

    this.game = args.game
    this.pos = {
      x: args.game.ship.pos.x + posDelta.x,
      y: args.game.ship.pos.y + posDelta.y,
    }
    this.rotation = args.game.ship.rotation
    this.vel = {
      x: posDelta.x / 2,
      y: posDelta.y / 2,
    }
    this.radius = 2

    this.init()
  }

  init() {
    this.game.timeManager.addFunc(`bullet-update:${this.id}`, this.update.bind(this))
  }

  update() {
    // Move
    this.pos.x += this.vel.x
    this.pos.y += this.vel.y

    // Delete if it goes out of bounds
    if (
      this.pos.x < 0 ||
      this.pos.y < 0 ||
      this.pos.x > this.game.canvas.width ||
      this.pos.y > this.game.canvas.height
    ) {
      this.destroy()
    }

    this.draw()
  }

  destroy() {
    this.game.bullets = this.game.bullets.filter(bullet => bullet.id !== this.id)
    this.game.timeManager.removeFunc(`bullet-update:${this.id}`)
  }

  draw() {
    this.game.ctx.save()
    this.game.ctx.translate(this.pos.x, this.pos.y)
    this.game.ctx.rotate((this.rotation * Math.PI) / 180)
    this.game.ctx.fillStyle = '#FFF'
    this.game.ctx.lineWidth = 0.5
    this.game.ctx.beginPath()
    this.game.ctx.arc(0, 0, 2, 0, 2 * Math.PI)
    this.game.ctx.closePath()
    this.game.ctx.fill()
    this.game.ctx.restore()
  }
}
