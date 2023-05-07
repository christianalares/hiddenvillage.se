export class Particle {
  position: { x: number; y: number }
  velocity: { x: number; y: number }
  radius: number
  lifeSpan: number
  inertia: number
  delete: boolean
  ctx: CanvasRenderingContext2D

  constructor(args: {
    position: { x: number; y: number }
    velocity: { x: number; y: number }
    size: number
    lifeSpan: number
    ctx: CanvasRenderingContext2D
  }) {
    this.ctx = args.ctx
    this.position = args.position
    this.velocity = args.velocity
    this.radius = args.size
    this.lifeSpan = args.lifeSpan
    this.inertia = 0.98

    this.delete = false
  }

  destroy() {
    this.delete = true
  }

  render() {
    // Move
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
    this.velocity.x *= this.inertia
    this.velocity.y *= this.inertia

    // Shrink
    this.radius -= 0.1
    if (this.radius < 0.1) {
      this.radius = 0.1
    }
    if (this.lifeSpan-- < 0) {
      this.destroy()
    }

    // Draw
    this.ctx.save()
    this.ctx.translate(this.position.x, this.position.y)
    this.ctx.fillStyle = '#ffffff'
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    this.ctx.moveTo(0, -this.radius)
    this.ctx.arc(0, 0, this.radius, 0, 2 * Math.PI)
    this.ctx.closePath()
    this.ctx.fill()
    this.ctx.restore()
  }
}
