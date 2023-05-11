import { v4 as uuidv4 } from 'uuid'
import { AsteroidsGame } from './AsteroidsGame'
import { randomInt } from './helpers'
import type { Vec } from './type'

export class Particle {
  id: string
  game: AsteroidsGame
  pos: Vec
  vel: Vec
  radius: number
  inertia: number
  lifeSpan: number
  colors: string[]

  constructor(args: {
    game: AsteroidsGame
    pos: Vec
    vel: Vec
    colors?: string[]
    lifeSpan?: number
    radius?: number
  }) {
    this.id = uuidv4()
    this.colors = args.colors || ['#ff0100', '#ff5b00', '#ff9a01', '#fece04', '#ffe809']
    this.game = args.game
    this.pos = args.pos
    this.vel = args.vel
    this.radius = args.radius || 5
    this.inertia = 0.98
    this.lifeSpan = args.lifeSpan || 100

    this.init()
  }

  init() {
    this.game.timeManager.addFunc(`particle-update:${this.id}}`, this.update.bind(this))
  }

  update() {
    // Move
    this.pos.x += this.vel.x
    this.pos.y += this.vel.y
    this.vel.x *= this.inertia
    this.vel.y *= this.inertia

    // Shrink
    this.radius -= 0.1
    if (this.radius < 0.1) {
      this.radius = 0.1
    }
    if (this.lifeSpan-- < 0) {
      this.destroy()
    }

    this.draw()
  }

  draw() {
    this.game.ctx.save()
    this.game.ctx.translate(this.pos.x, this.pos.y)
    this.game.ctx.fillStyle = this.colors[randomInt(0, this.colors.length - 1)]
    this.game.ctx.lineWidth = 2
    this.game.ctx.beginPath()
    this.game.ctx.moveTo(0, -this.radius)
    this.game.ctx.arc(0, 0, this.radius, 0, 2 * Math.PI)
    this.game.ctx.closePath()
    this.game.ctx.fill()
    this.game.ctx.restore()
  }

  destroy() {
    this.game.particles = this.game.particles.filter(p => p.id !== this.id)
    this.game.timeManager.removeFunc(`particle-update:${this.id}}`)
  }
}
