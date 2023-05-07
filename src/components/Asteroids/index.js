'use client'

import { useEffect, useState } from 'react'
// import { Reacteroids } from './Reacteroids'
import { Reacteroids } from '../AsteroidsGame/Reacteroids2'
import './style.css'
import { useSecretCode } from '@/hooks/useSecretCode'

export const Asteroids = () => {
  const [showGame, setShowGame] = useState(true)
  useSecretCode('space', () => setShowGame(true))

  useEffect(() => {
    const html = document.querySelector('html')

    if (showGame) {
      html.style.overflow = 'hidden'
    } else {
      html.style.overflow = 'auto'
    }
  }, [showGame])

  return showGame ? <Reacteroids /> : null
}
