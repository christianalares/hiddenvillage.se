import { useCallback, useEffect, useRef, useState } from 'react'
import { randomNumBetweenExcluding, rotatePoint, randomNumBetween } from '../Asteroids/helpers'
import { Ship } from './Ship'
import { Particle } from './Particle'
import { Bullet } from './Bullet'
import Asteroid from './Asteroid'

export const Reacteroids = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const ship = useRef<Ship | null>(null)
  const bullets = useRef<Bullet[]>([])
  const particles = useRef<Particle[]>([])
  const asteroids = useRef<Asteroid[]>([])

  const keys = useRef<{
    left: boolean
    right: boolean
    up: boolean
    down: boolean
    space: boolean
  }>({
    left: false,
    right: false,
    up: false,
    down: false,
    space: false,
  })

  const [screen, setScreen] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    ratio: window.devicePixelRatio || 1,
  })

  const [asteroidCount, setAsteroidCount] = useState(3)
  const [currentScore, setCurrentScore] = useState(0)
  const [topScore, setTopScore] = useState(localStorage['topscore'] || 0)
  const [inGame, setInGame] = useState(false)

  const checkCollision = (obj1, obj2) => {
    var vx = obj1.position.x - obj2.position.x
    var vy = obj1.position.y - obj2.position.y
    var length = Math.sqrt(vx * vx + vy * vy)
    if (length < obj1.radius + obj2.radius) {
      console.log('asteroid', obj2.position)
      return true
    }
    return false
  }

  const checkCollisionsWith = (items1, items2) => {
    var a = items1.length - 1
    var b
    for (a; a > -1; --a) {
      b = items2.length - 1
      for (b; b > -1; --b) {
        var item1 = items1[a]
        var item2 = items2[b]
        if (checkCollision(item1, item2)) {
          item1.destroy()
          item2.destroy()
        }
      }
    }
  }

  const update = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.save()
      ctx.scale(screen.ratio, screen.ratio)

      ctx.fillStyle = '#0e172a'
      ctx.globalAlpha = 0.4
      ctx.fillRect(0, 0, screen.width, screen.height)
      ctx.globalAlpha = 1

      ctx.restore()

      ship.current?.render({
        keys: keys.current,
        screen,
      })

      bullets.current.forEach(bullet => {
        bullet.render({
          screen,
        })
      })

      particles.current.forEach(particle => {
        particle.render()
      })

      asteroids.current.forEach(asteroid => {
        asteroid.render({
          screen,
        })
      })

      checkCollisionsWith(bullets.current, asteroids.current)

      // Next frame
      requestAnimationFrame(() => {
        update(ctx)
      })
    },
    [keys, screen]
  )

  const startGame = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      setInGame(true)
      setCurrentScore(0)

      ship.current = new Ship({
        ctx,
        position: {
          x: screen.width / 2,
          y: screen.height / 2,
        },
        createBullet: () => {
          if (ship.current) {
            bullets.current = [...bullets.current, new Bullet({ ctx, ship: ship.current })]
          }
        },
        createParticle: () => {
          if (particles.current && ship.current) {
            particles.current = [
              ...particles.current,
              new Particle({
                ctx,
                position: {
                  x: ship.current.position.x + randomNumBetween(-10, 5),
                  y: ship.current.position.y + randomNumBetween(-10, 5),
                },
                lifeSpan: 80,
                size: randomNumBetween(1, 3),
                velocity: {
                  x: randomNumBetween(-1.5, 1.5),
                  y: randomNumBetween(-1.5, 1.5),
                },
              }),
            ]
          }
        },
        onDie: () => {},
      })

      for (let i = 0; i < 2; i++) {
        asteroids.current.push(
          new Asteroid({
            ctx,
            position: {
              x: randomNumBetweenExcluding(
                0,
                screen.width,
                (ship.current?.position.x || 0) - 60,
                (ship.current?.position.x || 0) + 60
              ),
              y: randomNumBetweenExcluding(
                0,
                screen.height,
                (ship.current?.position.y || 0) - 60,
                (ship.current?.position.y || 0) + 60
              ),
            },
            addScore: () => {},
            size: 80,
            createParticle: () => {
              particles.current.push(
                new Particle({
                  ctx,
                  lifeSpan: 80,
                  position: {
                    x: ship.current?.position.x || 0,
                    y: ship.current?.position.y || 0,
                  },
                  size: randomNumBetween(1, 3),
                  velocity: {
                    x: randomNumBetween(-1.5, 1.5),
                    y: randomNumBetween(-1.5, 1.5),
                  },
                })
              )
            },
          })
        )
      }

      // generateAsteroids(asteroidCount)
    },
    [screen.height, screen.width]
  )

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')

    if (!ctx) {
      return
    }

    startGame(ctx)

    requestAnimationFrame(() => {
      update(ctx)
    })
  }, [startGame, update])

  useEffect(() => {
    const handleResize = () => {
      setScreen({
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      })
    }

    const handleKeys = (isDown: boolean) => (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        keys.current = {
          ...keys.current,
          left: isDown,
        }
      }

      if (e.key === 'ArrowRight') {
        keys.current = {
          ...keys.current,
          right: isDown,
        }
      }

      if (e.key === 'ArrowUp') {
        keys.current = {
          ...keys.current,
          up: isDown,
        }
      }

      if (e.key === ' ') {
        keys.current = {
          ...keys.current,
          space: isDown,
        }
      }
    }

    const handleKeyDown = handleKeys(true)
    const handleKeyUp = handleKeys(false)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleResize)
    }
  }, [])

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={screen.width * screen.ratio}
        height={screen.height * screen.ratio}
        className="absolute inset-0 block bg-black"
      />
    </div>
  )
}
