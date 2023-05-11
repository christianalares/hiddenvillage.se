'use client'

import { useGameStore } from '@/store'
import { Emoji } from './Emoji'
import { AnimatePresence, motion } from 'framer-motion'

export const GameText = () => {
  const show = useGameStore(state => !state.isGameComplete && !state.isGameOver)

  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          className="hidden overflow-hidden md:block"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ delay: 2, duration: 2 }}
        >
          <p className="mt-2 text-lg text-slate-300">
            <Emoji emoji="🕹️" label="Game controller" /> If you think all this is boring and just want to play the game
            in the foreground of this page you can do that too.
          </p>
          <div className="flex items-center gap-4">
            <div>
              <kbd>S</kbd>
              <span className="ml-3 text-slate-300">shoot</span>
            </div>
            <div className="game-direction-controls">
              <kbd>I</kbd>
              <kbd>J</kbd>
              <kbd>K</kbd>
              <kbd>L</kbd>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
