import { create } from 'zustand'

interface GameStore {
  isGameOver: boolean
  isGameComplete: boolean
  score: number
  setScore: (score: number) => void
  setIsGameOver: (value: boolean) => void
  setIsGameComplete: (value: boolean) => void
}

export const useGameStore = create<GameStore>()(set => ({
  isGameOver: false,
  isGameComplete: false,
  score: 0,
  setScore: score => set(() => ({ score })),
  setIsGameOver: value => set(() => ({ isGameOver: value })),
  setIsGameComplete: value => set(() => ({ isGameComplete: value })),
}))
