'use client'

import { useEffect, useRef, useState } from 'react'
import { AsteroidsGame } from '@/game/AsteroidsGame'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '@/store'

const GameHUD = () => {
  const score = useGameStore(state => state.score)
  const isGameOver = useGameStore(state => state.isGameOver)
  const isGameComplete = useGameStore(state => state.isGameComplete)

  return (
    <>
      <motion.p
        className="absolute left-0 top-0 z-10 origin-top-left p-4 font-mono text-white"
        animate={{
          scale: isGameOver ? 3 : 1,
        }}
        transition={{
          delay: 1,
        }}
      >
        Score: {score}
      </motion.p>

      <AnimatePresence>
        {isGameComplete && (
          <div className="fixed inset-0 z-20 flex items-center justify-center">
            <motion.p
              className="bg-black p-4 text-center font-mono text-4xl leading-relaxed text-white"
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              You completed the game, lol
              <br />
              You got {score} points!
            </motion.p>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

const GameInner = () => {
  const [shouldRender, setShouldRender] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const setScore = useGameStore(state => state.setScore)
  const setIsGameOver = useGameStore(state => state.setIsGameOver)
  const setIsGameComplete = useGameStore(state => state.setIsGameComplete)

  useEffect(() => {
    if (canvasRef.current) {
      new AsteroidsGame({
        canvas: canvasRef.current,
        config: {
          onGameOver: () => {
            setShouldRender(false)
            setIsGameOver(true)
          },
          onPointsUpdate: points => {
            setScore(points)
          },
          onGameComplete: () => {
            setIsGameComplete(true)
            setShouldRender(false)
          },
        },
      })
    }
  }, [setIsGameComplete, setIsGameOver, setScore])

  return (
    <AnimatePresence initial={false}>
      {shouldRender && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, delay: 3 }}
        >
          <GameHUD />
          <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 block" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const Game = () => {
  return (
    <div className="hidden md:block">
      <GameInner />
    </div>
  )
}
