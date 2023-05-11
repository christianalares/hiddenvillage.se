import { v4 as uuidv4 } from 'uuid'
import { Bullet } from './Bullet'
import { AsteroidsGame } from './AsteroidsGame'
import { Particle } from './Particle'
import { randomFloat, randomInt, rotatePoint } from './helpers'
import type { KeyPressedState, Vec } from './type'

export class Ship {
  id: string
  game: AsteroidsGame
  pos: Vec
  vel: Vec
  radius: number
  keys: KeyPressedState
  rotation: number
  speed: number
  inertia: number
  rotationSpeed: number
  lastShot: number
  isAlive: boolean

  constructor(args: { game: AsteroidsGame }) {
    this.isAlive = true
    this.id = uuidv4()
    this.game = args.game
    this.pos = {
      x: args.game.canvas.width / 2,
      y: args.game.canvas.height / 2,
    }
    this.vel = { x: 0, y: 0 }
    this.radius = 20
    this.keys = {
      up: false,
      right: false,
      left: false,
      shoot: false,
    }
    this.rotation = -45
    this.speed = 0.15
    this.inertia = 0.99
    this.rotationSpeed = 6
    this.lastShot = 0

    this.init()
  }

  init() {
    this.bindKeyboardEvents()
    this.game.timeManager.addFunc('ship-update', this.update.bind(this))

    // Give the ship a little push at start
    setTimeout(() => {
      this.game.timeManager.addFuncByTime(500, () => {
        this.accelerate()
      })
    }, 500)
  }

  update() {
    if (this.keys.up) {
      this.accelerate()
    }

    if (this.keys.left) {
      this.rotate('left')
    }

    if (this.keys.right) {
      this.rotate('right')
    }

    if (this.keys.shoot && Date.now() - this.lastShot > 300) {
      this.game.bullets.push(new Bullet({ game: this.game }))
      this.game.addScore(-1)
      this.lastShot = Date.now()
    }

    // Move
    this.pos.x += this.vel.x
    this.pos.y += this.vel.y
    this.vel.x *= this.inertia
    this.vel.y *= this.inertia

    // Screen edges
    if (this.pos.x > this.game.canvas.width) {
      this.pos.x = 0
    } else if (this.pos.x < 0) {
      this.pos.x = this.game.canvas.width
    }
    if (this.pos.y > this.game.canvas.height) {
      this.pos.y = 0
    } else if (this.pos.y < 0) {
      this.pos.y = this.game.canvas.height
    }

    this.draw()
  }

  draw() {
    this.game.ctx.save()
    this.game.ctx.translate(this.pos.x, this.pos.y)
    this.game.ctx.rotate((this.rotation * Math.PI) / 180)
    this.game.ctx.strokeStyle = '#ffffff'
    this.game.ctx.fillStyle = 'transparent'
    this.game.ctx.lineWidth = 2
    this.game.ctx.beginPath()
    this.game.ctx.moveTo(0, -15)
    this.game.ctx.lineTo(10, 10)
    this.game.ctx.lineTo(5, 7)
    this.game.ctx.lineTo(-5, 7)
    this.game.ctx.lineTo(-10, 10)
    this.game.ctx.closePath()
    this.game.ctx.fill()
    this.game.ctx.stroke()
    this.game.ctx.restore()
  }

  accelerate() {
    this.vel.x -= Math.sin((-this.rotation * Math.PI) / 180) * this.speed
    this.vel.y -= Math.cos((-this.rotation * Math.PI) / 180) * this.speed

    // Thruster particles
    const posDelta = rotatePoint({ x: 0, y: -10 }, { x: 0, y: 0 }, ((this.rotation - 180) * Math.PI) / 180)

    this.game.particles.push(
      new Particle({
        game: this.game,
        pos: {
          x: this.pos.x + posDelta.x + randomFloat(-2, 2),
          y: this.pos.y + posDelta.y + randomFloat(-2, 2),
        },
        vel: {
          x: posDelta.x / randomFloat(3, 5),
          y: posDelta.y / randomFloat(3, 5),
        },
        radius: randomFloat(1, 3),
      })
    )
  }

  rotate(dir: 'left' | 'right') {
    if (dir == 'left') {
      this.rotation -= this.rotationSpeed
    }
    if (dir == 'right') {
      this.rotation += this.rotationSpeed
    }
  }

  destroy() {
    for (let i = 0; i < this.radius * 20; i++) {
      this.game.particles.push(
        new Particle({
          game: this.game,
          lifeSpan: randomInt(60, 100),
          radius: randomFloat(5, 10),
          pos: {
            x: this.pos.x + randomInt(-this.radius, this.radius),
            y: this.pos.y + randomInt(-this.radius, this.radius),
          },
          vel: {
            x: randomInt(-5, 5),
            y: randomInt(-5, 5),
          },
        })
      )
    }

    this.game.timeManager.removeFunc('ship-update')
    this.isAlive = false
  }

  bindKeyboardEvents() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
    document.addEventListener('keyup', this.handleKeyUp.bind(this))
  }

  handleKeyDown(e: KeyboardEvent) {
    if (e.key === this.game.config.keys.up) {
      this.keys.up = true
    }
    if (e.key === this.game.config.keys.right) {
      this.keys.right = true
    }
    if (e.key === this.game.config.keys.left) {
      this.keys.left = true
    }
    if (e.key === this.game.config.keys.shoot) {
      this.keys.shoot = true
    }
  }

  handleKeyUp(e: KeyboardEvent) {
    if (e.key === this.game.config.keys.up) {
      this.keys.up = false
    }
    if (e.key === this.game.config.keys.right) {
      this.keys.right = false
    }
    if (e.key === this.game.config.keys.left) {
      this.keys.left = false
    }
    if (e.key === this.game.config.keys.shoot) {
      this.keys.shoot = false
    }
  }
}
