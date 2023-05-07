import { Bullet } from './Bullet'
import { Particle } from './Particle'
import { randomNumBetween, rotatePoint } from './helpers'

export class Ship {
  position: { x: number; y: number }
  velocity: { x: number; y: number }
  rotation: number
  rotationSpeed: number
  speed: number
  inertia: number
  radius: number
  lastShot: number
  createBullet: (bullet: Bullet) => void
  createParticle: (particle: Particle) => void
  onDie: any
  delete: boolean
  ctx: CanvasRenderingContext2D

  constructor(args: {
    position: { x: number; y: number }
    createBullet: (bullet: Bullet) => void
    createParticle: (particle: Particle) => void
    onDie: any
    ctx: CanvasRenderingContext2D
  }) {
    this.position = args.position
    this.velocity = {
      x: 0,
      y: 0,
    }
    this.rotation = 0
    this.rotationSpeed = 6
    this.speed = 0.15
    this.inertia = 0.99
    this.radius = 20
    this.lastShot = 0
    this.createBullet = args.createBullet
    this.createParticle = args.createParticle
    this.onDie = args.onDie

    this.delete = false
    this.ctx = args.ctx
  }

  destroy() {
    this.delete = true
    this.onDie()

    // Explode
    for (let i = 0; i < 60; i++) {
      const particle = new Particle({
        ctx: this.ctx,
        lifeSpan: randomNumBetween(60, 100),
        size: randomNumBetween(1, 4),
        position: {
          x: this.position.x + randomNumBetween(-this.radius / 4, this.radius / 4),
          y: this.position.y + randomNumBetween(-this.radius / 4, this.radius / 4),
        },
        velocity: {
          x: randomNumBetween(-1.5, 1.5),
          y: randomNumBetween(-1.5, 1.5),
        },
      })
      this.createParticle(particle)
    }
  }

  rotate(dir: 'LEFT' | 'RIGHT') {
    if (dir == 'LEFT') {
      this.rotation -= this.rotationSpeed
    }
    if (dir == 'RIGHT') {
      this.rotation += this.rotationSpeed
    }
  }

  accelerate() {
    this.velocity.x -= Math.sin((-this.rotation * Math.PI) / 180) * this.speed
    this.velocity.y -= Math.cos((-this.rotation * Math.PI) / 180) * this.speed

    // Thruster particles
    let posDelta = rotatePoint({ x: 0, y: -10 }, { x: 0, y: 0 }, ((this.rotation - 180) * Math.PI) / 180)
    const particle = new Particle({
      ctx: this.ctx,
      lifeSpan: randomNumBetween(20, 40),
      size: randomNumBetween(1, 3),
      position: {
        x: this.position.x + posDelta.x + randomNumBetween(-2, 2),
        y: this.position.y + posDelta.y + randomNumBetween(-2, 2),
      },
      velocity: {
        x: posDelta.x / randomNumBetween(3, 5),
        y: posDelta.y / randomNumBetween(3, 5),
      },
    })

    this.createParticle(particle)
  }

  render(state: {
    keys: { up: boolean; left: boolean; right: boolean; space: boolean }
    screen: { width: number; height: number }
  }) {
    // Controls
    if (state.keys.up) {
      this.accelerate()
    }
    if (state.keys.left) {
      this.rotate('LEFT')
    }
    if (state.keys.right) {
      this.rotate('RIGHT')
    }
    if (state.keys.space && Date.now() - this.lastShot > 300) {
      const bullet = new Bullet({ ctx: this.ctx, ship: this })
      this.createBullet(bullet)
      this.lastShot = Date.now()
    }

    // Move
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
    this.velocity.x *= this.inertia
    this.velocity.y *= this.inertia

    // Rotation
    if (this.rotation >= 360) {
      this.rotation -= 360
    }
    if (this.rotation < 0) {
      this.rotation += 360
    }

    // Screen edges
    if (this.position.x > state.screen.width) this.position.x = 0
    else if (this.position.x < 0) this.position.x = state.screen.width
    if (this.position.y > state.screen.height) this.position.y = 0
    else if (this.position.y < 0) this.position.y = state.screen.height

    // Draw
    this.ctx.save()
    this.ctx.translate(this.position.x, this.position.y)
    this.ctx.rotate((this.rotation * Math.PI) / 180)
    this.ctx.strokeStyle = '#ffffff'
    this.ctx.fillStyle = '#000000'
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    this.ctx.moveTo(0, -15)
    this.ctx.lineTo(10, 10)
    this.ctx.lineTo(5, 7)
    this.ctx.lineTo(-5, 7)
    this.ctx.lineTo(-10, 10)
    this.ctx.closePath()
    this.ctx.fill()
    this.ctx.stroke()
    this.ctx.restore()
  }
}
