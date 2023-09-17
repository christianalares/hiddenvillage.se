import { v4 as uuidv4 } from 'uuid'

type FunctionToRun = {
  id: string
  fn: (deltaTime: number) => void
}

export class TimeManager {
  functionsToRun: FunctionToRun[]
  isRunning: boolean
  updateProxy: (time: number) => void
  animationFrame: number | null

  constructor() {
    this.functionsToRun = []
    this.isRunning = true
    this.animationFrame = null

    const deltaTime = 1 / 60
    let accumulatedTime = 0
    let lastTime = 0

    this.updateProxy = time => {
      accumulatedTime += (time - lastTime) / 1000

      while (accumulatedTime > deltaTime) {
        if (this.isRunning) {
          this.functionsToRun.forEach(functionToRun => functionToRun.fn(deltaTime))
        }
        accumulatedTime -= deltaTime
      }

      this.enqueue()
      lastTime = time
    }
  }

  enqueue() {
    this.animationFrame = window.requestAnimationFrame(this.updateProxy)
  }

  start() {
    this.isRunning = true
    this.enqueue()
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
      this.isRunning = false
    }
  }

  pause() {
    this.isRunning = false
  }

  unpause() {
    this.isRunning = true
  }

  addFunc(id: string, fn: (deltaTime: number) => void) {
    if (!id || typeof fn !== 'function') {
      console.error('addFunc needs an identifier and a function as arguments')
      return
    }

    this.functionsToRun.push({ id, fn })
  }

  addFuncByTime(time: number, fn: (deltaTime: number) => void): Promise<void> {
    return new Promise(resolve => {
      const id = uuidv4()

      this.functionsToRun.push({ id, fn })

      setTimeout(() => {
        this.removeFunc(id)
        resolve()
      }, time)
    })
  }

  removeFunc(id: string) {
    this.functionsToRun = this.functionsToRun.filter(fn => id !== fn.id)
  }

  hasFunc(id: string) {
    return !!this.functionsToRun.find(fn => id === fn.id)
  }
}
