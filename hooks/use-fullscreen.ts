'use client'

import { useCallback, useEffect, useState } from 'react'

/** Toggles fullscreen for a target element (defaults to document root). */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggle = useCallback(async (el?: HTMLElement | null) => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await (el ?? document.documentElement).requestFullscreen()
    }
  }, [])

  return { isFullscreen, toggle }
}
