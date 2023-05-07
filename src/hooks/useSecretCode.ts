import { useEffect } from 'react'

type Character =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z'
  | 'å'
  | 'ä'
  | 'ö'
const allowedCharactersRegEx = /[a-zåäö]/

export const useSecretCode = (secret: string, cb: () => void) => {
  useEffect(() => {
    const pressed: Character[] = []

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!allowedCharactersRegEx.test(e.key)) {
        return
      }

      pressed.push(e.key as Character)
      pressed.splice(-secret.length - 1, pressed.length - secret.length)

      if (pressed.join('') === secret) {
        cb()
        // window.localStorage.setItem(`secret-${secret}`, 'true')
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [cb, secret])
}
