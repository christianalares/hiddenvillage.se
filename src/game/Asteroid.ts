import { v4 as uuidv4 } from 'uuid'
import type { AsteroidsGame } from './AsteroidsGame'
import { asteroidVertices, randomFloat, randomInt } from './helpers'
import { Vec } from './type'
import { Particle } from './Particle'

export class Asteroid {
  id: string
  game: AsteroidsGame
  pos: Vec
  vel: Vec
  rotation: number
  rotationSpeed: number
  radius: number
  points: number
  vertices: Vec[]

  constructor(args: { game: AsteroidsGame; pos: Vec; radius: number }) {
    this.id = uuidv4()
    this.game = args.game
    this.pos = args.pos
    this.vel = {
      x: randomFloat(-1.5, 1.5),
      y: randomFloat(-1.5, 1.5),
    }
    this.rotation = 0
    this.rotationSpeed = randomFloat(-1, 1)
    this.radius = args.radius
    this.points = Math.round((80 / this.radius) * 5)
    this.vertices = asteroidVertices(8, args.radius)

    this.init()
  }

  init() {
    this.game.timeManager.addFunc(`asteroid-update:${this.id}}`, this.update.bind(this))
  }

  update() {
    // Move
    this.pos.x += this.vel.x
    this.pos.y += this.vel.y

    // Rotation
    this.rotation += this.rotationSpeed
    if (this.rotation >= 360) {
      this.rotation -= 360
    }
    if (this.rotation < 0) {
      this.rotation += 360
    }

    // Screen edges
    if (this.pos.x > this.game.canvas.width + this.radius) {
      this.pos.x = -this.radius
    } else if (this.pos.x < -this.radius) {
      this.pos.x = this.game.canvas.width + this.radius
    }
    if (this.pos.y > this.game.canvas.height + this.radius) {
      this.pos.y = -this.radius
    } else if (this.pos.y < -this.radius) {
      this.pos.y = this.game.canvas.height + this.radius
    }

    this.draw()
  }

  destroy({ withScore = true, spawnNew = true }: { withScore?: boolean; spawnNew?: boolean } = {}) {
    if (withScore) {
      this.game.addScore(this.points)
    }

    // Explode
    for (let i = 0; i < this.radius * 2; i++) {
      this.game.particles.push(
        new Particle({
          game: this.game,
          lifeSpan: randomInt(60, 100),
          radius: randomFloat(2, 6),
          pos: {
            x: this.pos.x + randomInt(-this.radius / 4, this.radius / 4),
            y: this.pos.y + randomInt(-this.radius / 4, this.radius / 4),
          },
          vel: {
            x: randomInt(-3, 3),
            y: randomInt(-3, 3),
          },
        })
      )
    }

    // Break into smaller asteroids
    if (spawnNew && this.radius > 10) {
      for (let i = 0; i < 2; i++) {
        this.game.asteroids.push(
          new Asteroid({
            game: this.game,
            radius: this.radius / 2,
            pos: {
              x: randomInt(-10, 20) + this.pos.x,
              y: randomInt(-10, 20) + this.pos.y,
            },
          })
        )
      }
    }

    this.game.asteroids = this.game.asteroids.filter(a => a.id !== this.id)
    this.game.timeManager.removeFunc(`asteroid-update:${this.id}}`)
  }

  draw() {
    this.game.ctx.save()
    this.game.ctx.translate(this.pos.x, this.pos.y)
    this.game.ctx.rotate((this.rotation * Math.PI) / 180)
    this.game.ctx.strokeStyle = `rgba(255, 255, 255, ${this.game.isGodMode ? 0.2 : 1})`
    this.game.ctx.lineWidth = 2
    this.game.ctx.beginPath()
    this.game.ctx.moveTo(0, -this.radius)

    for (let i = 1; i < this.vertices.length; i++) {
      this.game.ctx.lineTo(this.vertices[i].x, this.vertices[i].y)
    }

    this.game.ctx.closePath()
    this.game.ctx.stroke()
    this.game.ctx.restore()
  }
}
