'use client'

import { useEffect, useRef } from 'react'
import { useBrand } from '@/hooks/use-brand'

const DESKTOP_STAR_COUNT = 100
const MOBILE_STAR_COUNT = 50

interface Star {
  x: number
  y: number
  size: number
  color: string
  dx: number
  dy: number
  twinkleSpeed: number
  twinklePhase: number
}

export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const icons = useBrand((s) => s.getIcons())
  const colors = icons.colors.ambientStars

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let stars: Star[] = []

    const isMobile = () => window.innerWidth < 768

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = document.documentElement.clientHeight
    }

    const initStars = () => {
      const count = isMobile() ? MOBILE_STAR_COUNT : DESKTOP_STAR_COUNT
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 0.8 + Math.random() * 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        dx: (Math.random() - 0.5) * 0.15,
        dy: (Math.random() - 0.5) * 0.15,
        twinkleSpeed: 0.3 + Math.random() * 0.7,
        twinklePhase: Math.random() * Math.PI * 2,
      }))
    }

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const t = time / 1000

      for (const star of stars) {
        star.x += star.dx
        star.y += star.dy

        if (star.x < -5) star.x = canvas.width + 5
        if (star.x > canvas.width + 5) star.x = -5
        if (star.y < -5) star.y = canvas.height + 5
        if (star.y > canvas.height + 5) star.y = -5

        const alpha = 0.5 + 0.5 * Math.sin(t * star.twinkleSpeed + star.twinklePhase)

        ctx.globalAlpha = alpha
        ctx.fillStyle = star.color
        ctx.fillRect(
          Math.round(star.x) - star.size / 2,
          Math.round(star.y) - star.size / 2,
          star.size,
          star.size,
        )
      }

      ctx.globalAlpha = 1
      animId = requestAnimationFrame(draw)
    }

    resize()
    initStars()
    animId = requestAnimationFrame(draw)

    window.addEventListener('resize', () => {
      resize()
      initStars()
    })

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [colors])

  return (
    <div className="aurora-bg" aria-hidden="true">
      <div className="aurora-glow" />
      <div className="aurora-spotlight" />
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, zIndex: 1 }}
      />
    </div>
  )
}
