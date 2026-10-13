import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { siteConfig } from '../data/siteConfig'

const TOTAL_FRAMES = 240
const FRAME_PATH = (index) => {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  const padded = String(index).padStart(3, '0')
  return `${base}/hero-frames/frame_${padded}.webp`
}

export default function HeroCanvas({ reducedMotion = false }) {
  const canvasRef = useRef(null)
  const [firstFrameLoaded, setFirstFrameLoaded] = useState(false)
  const imagesRef = useRef(new Array(TOTAL_FRAMES))
  const currentFrameRef = useRef(0)

  // Render a specific frame on canvas with object-fit: cover logic
  const renderFrame = (img) => {
    const canvas = canvasRef.current
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cw = canvas.width
    const ch = canvas.height
    const iw = img.naturalWidth || img.width || 1280
    const ih = img.naturalHeight || img.height || 720

    // Compute cover dimensions
    const scale = Math.max(cw / iw, ch / ih)
    const sw = iw * scale
    const sh = ih * scale
    const sx = (cw - sw) / 2
    const sy = (ch - sh) / 2

    ctx.clearRect(0, 0, cw, ch)
    ctx.drawImage(img, sx, sy, sw, sh)
  }

  // Load first frame immediately for fast hero first paint
  useEffect(() => {
    const img0 = new Image()
    img0.src = FRAME_PATH(0)
    img0.onload = () => {
      imagesRef.current[0] = img0
      setFirstFrameLoaded(true)
      renderFrame(img0)
    }
  }, [])

  // Resize canvas according to device pixel ratio
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)

      const currImg = imagesRef.current[currentFrameRef.current] || imagesRef.current[0]
      if (currImg) renderFrame(currImg)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [firstFrameLoaded])

  // Preload remaining frames progressively in background idle time
  useEffect(() => {
    let cancelled = false

    const preloadRest = () => {
      // Prioritize key step frames first for immediate responsiveness
      const stepIndices = []
      const step = 4
      for (let i = step; i < TOTAL_FRAMES; i += step) {
        stepIndices.push(i)
      }
      for (let i = 1; i < TOTAL_FRAMES; i++) {
        if (i % step !== 0) stepIndices.push(i)
      }

      let idx = 0
      const loadNextBatch = () => {
        if (cancelled || idx >= stepIndices.length) return
        const batchSize = 6
        for (let b = 0; b < batchSize && idx < stepIndices.length; b++, idx++) {
          const frameIdx = stepIndices[idx]
          if (!imagesRef.current[frameIdx]) {
            const img = new Image()
            img.src = FRAME_PATH(frameIdx)
            img.onload = () => {
              if (!cancelled) imagesRef.current[frameIdx] = img
            }
          }
        }
        if (idx < stepIndices.length) {
          if ('requestIdleCallback' in window) {
            window.requestIdleCallback(loadNextBatch, { timeout: 200 })
          } else {
            setTimeout(loadNextBatch, 50)
          }
        }
      }

      loadNextBatch()
    }

    if (firstFrameLoaded) {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(preloadRest, { timeout: 400 })
      } else {
        setTimeout(preloadRest, 100)
      }
    }

    return () => {
      cancelled = true
    }
  }, [firstFrameLoaded])

  // Drive animation with GSAP ScrollTrigger pinned to the hero section
  useEffect(() => {
    if (reducedMotion) return undefined

    const heroWrap = document.querySelector('.hero-scroll-container')
    if (!heroWrap) return undefined

    const frameTracker = { frame: 0 }

    const st = ScrollTrigger.create({
      trigger: heroWrap,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        const targetFrame = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(0, Math.round(self.progress * (TOTAL_FRAMES - 1)))
        )
        if (targetFrame !== currentFrameRef.current) {
          currentFrameRef.current = targetFrame
          frameTracker.frame = targetFrame

          // Find the closest loaded frame if this exact one hasn't loaded yet
          let imgToDraw = imagesRef.current[targetFrame]
          if (!imgToDraw) {
            for (let offset = 1; offset < 20; offset++) {
              if (imagesRef.current[targetFrame - offset]) {
                imgToDraw = imagesRef.current[targetFrame - offset]
                break
              }
              if (imagesRef.current[targetFrame + offset]) {
                imgToDraw = imagesRef.current[targetFrame + offset]
                break
              }
            }
          }
          if (!imgToDraw) imgToDraw = imagesRef.current[0]
          if (imgToDraw) renderFrame(imgToDraw)
        }
      },
    })

    return () => {
      st.kill()
    }
  }, [firstFrameLoaded, reducedMotion])

  return (
    <div className="hero-canvas-wrap" aria-hidden="true">
      <canvas ref={canvasRef} className="hero-canvas" />
    </div>
  )
}
