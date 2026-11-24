import { useCallback, useEffect, useRef, useState } from 'react'
import type { BackgroundImageValue } from '../types'

const revokeBrowserObjectURL = (url: string) => URL.revokeObjectURL(url)

export function useSessionBackgroundImage(
  revokeObjectURL: (url: string) => void = revokeBrowserObjectURL,
) {
  const [backgroundImage, setBackgroundImageState] = useState<BackgroundImageValue | null>(null)
  const backgroundImageRef = useRef<BackgroundImageValue | null>(null)

  const setBackgroundImage = useCallback(
    (next: BackgroundImageValue | null) => {
      const current = backgroundImageRef.current
      if (current?.url.startsWith('blob:') && current.url !== next?.url) revokeObjectURL(current.url)
      backgroundImageRef.current = next
      setBackgroundImageState(next)
    },
    [revokeObjectURL],
  )

  useEffect(
    () => () => {
      if (backgroundImageRef.current?.url.startsWith('blob:')) revokeObjectURL(backgroundImageRef.current.url)
    },
    [revokeObjectURL],
  )

  return { backgroundImage, setBackgroundImage }
}
