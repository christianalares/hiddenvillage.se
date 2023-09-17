import debounce from 'lodash.debounce'
import { Asteroid } from './Asteroid'
import { Bullet } from './Bullet'
import { Particle } from './Particle'
import { Ship } from './Ship'
import { TimeManager } from './TimeManager'
import { checkCollisionsWith, randomInt, sleep } from './helpers'
import type { GameConfig, GameConfigInput } from './type'

export class AsteroidsGame {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  timeManager: TimeManager
  config: GameConfig
  screenRatio: number
  ship: Ship
  asteroids: Asteroid[]
  bullets: Bullet[]
  particles: Particle[]
  score: number
  isGodMode: boolean

  defaultConfig: GameConfig = {
    keys: {
      up: 'i',
      right: 'l',
      left: 'j',
      shoot: 's',
    },
    onGameOver: () => {},
    onPointsUpdate: () => {},
    onGameComplete: () => {},
  }

  constructor(args: { canvas: HTMLCanvasElement; config?: GameConfigInput }) {
    this.isGodMode = true
    this.screenRatio = window.devicePixelRatio || 1
    this.canvas = args.canvas
    this.ctx = this.canvas.getContext('2d')!
    this.timeManager = new TimeManager()
    this.score = 0

    this.setDims()

    this.asteroids = []
    this.bullets = []
    this.particles = []

    this.bindEvents()

    this.config = {
      ...this.defaultConfig,
      ...args.config,
    }

    this.start()

    // Ship needs to be spawned after the game update
    // otherwise it will dissapear after the first frame
    this.ship = new Ship({ game: this })
  }

  start() {
    this.timeManager.start()
    this.timeManager.addFunc('game-update', this.update.bind(this))

    // Spawn asteroids
    for (let i = 0; i < 3; i++) {
      const radius = randomInt(50, 100)

      this.asteroids.push(
        new Asteroid({
          game: this,
          pos: {
            x: randomInt(0, this.canvas.width - radius * 2),
            y: randomInt(0, this.canvas.height - radius * 2),
          },
          radius,
        })
      )
    }

    // If ship spawns inside an asteroid, you have time to move away
    setTimeout(() => {
      this.isGodMode = false
    }, 3000)
  }

  update() {
    this.ctx.save()
    this.ctx.scale(this.screenRatio, this.screenRatio)
    this.ctx.clearRect(0, 0, screen.width, screen.height)
    this.ctx.restore()

    this.checkCollisions()
  }

  setDims() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  addScore(score: number) {
    this.score += score
    this.config.onPointsUpdate?.(this.score)
  }

  checkCollisions() {
    // Don't check any collisions if god mode is on
    if (this.isGodMode) {
      return
    }

    // Check collisions between ship and asteroids
    checkCollisionsWith([this.ship], this.asteroids, (ship, asteroid) => {
      if (this.ship.isAlive) {
        ship.destroy()
        asteroid.destroy({ withScore: false })
      }

      this.gameOver()
    })

    // Check collisions between bullets and asteroids
    checkCollisionsWith(this.bullets, this.asteroids, (bullet, asteroid) => {
      bullet.destroy()
      asteroid.destroy()

      // All asteroids are shot down
      if (this.asteroids.length === 0) {
        this.gameComplete()
      }
    })
  }

  pause() {
    this.timeManager.pause()
  }

  unpause() {
    this.timeManager.unpause()
  }

  bindEvents() {
    const setDimsDebounced = debounce(this.setDims.bind(this), 100)

    window.addEventListener('resize', setDimsDebounced)
    window.addEventListener('blur', this.pause.bind(this))
    window.addEventListener('focus', this.unpause.bind(this))
  }

  async gameComplete() {
    for (const asteroid of this.asteroids) {
      await sleep(randomInt(20, 300))
      asteroid.destroy({ withScore: false, spawnNew: false })
    }

    this.config.onGameComplete?.()
  }

  async gameOver() {
    for (const asteroid of this.asteroids) {
      await sleep(randomInt(20, 300))
      asteroid.destroy({ withScore: false, spawnNew: false })
    }

    this.config.onGameOver?.()
  }
}
