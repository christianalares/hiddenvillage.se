import { Particle } from './Particle'
import { asteroidVertices, randomNumBetween } from './helpers'

export default class Asteroid {
  position: { x: number; y: number }
  velocity: { x: number; y: number }
  rotation: number
  rotationSpeed: number
  radius: number
  score: number
  createParticle: (particle: Particle) => void
  // createAsteroid: (asteroid: Asteroid) => void
  addScore: (score: number) => void
  vertices: { x: number; y: number }[]
  delete: boolean
  ctx: CanvasRenderingContext2D

  constructor(args: {
    position: { x: number; y: number }
    size: number
    createParticle: (particle: Particle) => void
    // createAsteroid: (asteroid: Asteroid) => void
    addScore: (score: number) => void
    ctx: CanvasRenderingContext2D
  }) {
    this.position = args.position
    this.velocity = {
      x: randomNumBetween(-1.5, 1.5),
      y: randomNumBetween(-1.5, 1.5),
    }
    this.rotation = 0
    this.rotationSpeed = randomNumBetween(-1, 1)
    this.radius = args.size
    this.score = (80 / this.radius) * 5
    this.createParticle = args.createParticle
    // this.createAsteroid = args.createAsteroid
    this.addScore = args.addScore
    this.vertices = asteroidVertices(8, args.size)
    this.ctx = args.ctx

    this.delete = false
  }

  destroy() {
    this.delete = true
    this.addScore(this.score)

    // Explode
    for (let i = 0; i < this.radius; i++) {
      const particle = new Particle({
        lifeSpan: randomNumBetween(60, 100),
        size: randomNumBetween(1, 3),
        position: {
          x: this.position.x + randomNumBetween(-this.radius / 4, this.radius / 4),
          y: this.position.y + randomNumBetween(-this.radius / 4, this.radius / 4),
        },
        velocity: {
          x: randomNumBetween(-1.5, 1.5),
          y: randomNumBetween(-1.5, 1.5),
        },
        ctx: this.ctx,
      })
      this.createParticle(particle)
    }

    // Break into smaller asteroids
    if (this.radius > 10) {
      for (let i = 0; i < 2; i++) {
        let asteroid = new Asteroid({
          size: this.radius / 2,
          position: {
            x: randomNumBetween(-10, 20) + this.position.x,
            y: randomNumBetween(-10, 20) + this.position.y,
          },
          addScore: this.addScore.bind(this),
          // createAsteroid: this.createAsteroid.bind(this),
          createParticle: this.createParticle.bind(this),
          ctx: this.ctx,
        })

        // this.createAsteroid(asteroid)
      }
    }
  }

  render(state: { screen: { width: number; height: number } }) {
    // Move
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    // Rotation
    this.rotation += this.rotationSpeed
    if (this.rotation >= 360) {
      this.rotation -= 360
    }
    if (this.rotation < 0) {
      this.rotation += 360
    }

    // Screen edges
    if (this.position.x > state.screen.width + this.radius) this.position.x = -this.radius
    else if (this.position.x < -this.radius) this.position.x = state.screen.width + this.radius
    if (this.position.y > state.screen.height + this.radius) this.position.y = -this.radius
    else if (this.position.y < -this.radius) this.position.y = state.screen.height + this.radius

    // Draw
    this.ctx.save()
    this.ctx.translate(this.position.x, this.position.y)
    this.ctx.rotate((this.rotation * Math.PI) / 180)
    this.ctx.strokeStyle = '#FFF'
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    this.ctx.moveTo(0, -this.radius)
    for (let i = 1; i < this.vertices.length; i++) {
      this.ctx.lineTo(this.vertices[i].x, this.vertices[i].y)
    }
    this.ctx.closePath()
    this.ctx.stroke()
    this.ctx.restore()
  }
}
