import { useEffect, useRef, useState } from 'react'
import { siteConfig } from '../data/siteConfig'
import brandLogo from '../assets/logo.png'

const responsiveSrcSet = (src) => {
  if (!src || !src.includes('w=')) return undefined
  return [600, 900, 1400].map((width) => `${src.replace(/([?&])w=\d+/, `$1w=${width}`)} ${width}w`).join(', ')
}

export function ArrowIcon({ direction = 'right' }) {
  return <span className={`arrow-icon arrow-icon--${direction}`} aria-hidden="true">↗</span>
}

export function BrandMark({ light = false, className = '' }) {
  const initial = siteConfig.brand.name ? siteConfig.brand.name[0] : 'G'
  const logoSrc = brandLogo || siteConfig.brand.logo
  return (
    <span className={`brand-mark ${light ? 'brand-mark--light' : ''} ${className}`}>
      {logoSrc ? (
        <img src={logoSrc} alt={siteConfig.brand.name} className="brand-mark__logo" />
      ) : (
        <span className="brand-mark__seal" aria-hidden="true"><span>{initial}</span></span>
      )}
      <span className="brand-mark__type">
        <strong>{siteConfig.brand.name}</strong>
        {siteConfig.brand.descriptor && <small>{siteConfig.brand.descriptor}</small>}
      </span>
    </span>
  )
}

export function Button({ children, href, onClick, variant = 'primary', type = 'button', className = '', target }) {
  const classes = `button button--${variant} ${className}`
  const handleClick = (event) => {
    const btn = event.currentTarget
    const circle = document.createElement('span')
    const diameter = Math.max(btn.clientWidth, btn.clientHeight)
    const radius = diameter / 2
    const rect = btn.getBoundingClientRect()
    circle.style.width = circle.style.height = `${diameter}px`
    circle.style.left = `${event.clientX - rect.left - radius}px`
    circle.style.top = `${event.clientY - rect.top - radius}px`
    circle.classList.add('button-ripple')
    const existing = btn.querySelector('.button-ripple')
    if (existing) existing.remove()
    btn.appendChild(circle)
    window.setTimeout(() => circle.remove(), 650)
    if (onClick) onClick(event)
  }

  if (href) {
    return (
      <a className={classes} href={href} onClick={handleClick} target={target} rel={target === '_blank' ? 'noreferrer' : undefined}>
        <span className="button__text">{children}</span>
        <ArrowIcon />
      </a>
    )
  }
  return (
    <button className={classes} onClick={handleClick} type={type}>
      <span className="button__text">{children}</span>
      <ArrowIcon />
    </button>
  )
}

export function WaveDivider({ flip = false, fill = 'currentColor', className = '' }) {
  return (
    <div className={`wave-divider ${flip ? 'wave-divider--flip' : ''} ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
        <path
          className="wave-drift"
          fill={fill}
          d="M0,24 C240,48 480,4 720,24 C960,44 1200,8 1440,24 L1440,60 L0,60 Z"
        />
      </svg>
    </div>
  )
}

export function MarqueeStrip({ text = 'FRESH ARABIAN SEA CATCH • LIVE MUSIC • SUNSET SEATING • KERALA RECIPES •' }) {
  const trackRef = useRef(null)
  
  useEffect(() => {
    let lastY = window.scrollY
    let lastTime = performance.now()
    let currentX = 0
    let velocity = 0
    let animationId

    const loop = (now) => {
      const dt = Math.max(1, now - lastTime)
      lastTime = now
      
      // Decay velocity back to base speed
      velocity *= 0.94
      const baseSpeed = 0.45
      currentX -= (baseSpeed + Math.abs(velocity))

      // Loop when first segment passes
      if (trackRef.current) {
        const halfWidth = trackRef.current.scrollWidth / 2
        if (halfWidth > 0 && Math.abs(currentX) >= halfWidth) {
          currentX += halfWidth
        }
        trackRef.current.style.transform = `translate3d(${currentX}px, 0, 0)`
      }
      animationId = requestAnimationFrame(loop)
    }

    const onScroll = () => {
      const curY = window.scrollY
      const curTime = performance.now()
      const dy = curY - lastY
      const dt = curTime - lastTime || 16
      lastY = curY
      // Calculate scroll velocity
      const instantVelocity = (Math.abs(dy) / dt) * 1.8
      velocity = Math.min(instantVelocity, 4.5)
    }

    animationId = requestAnimationFrame(loop)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <aside className="marquee-strip" aria-hidden="true">
      <div className="marquee-strip__track" ref={trackRef}>
        <span className="marquee-strip__item">{text}</span>
        <span className="marquee-strip__item">{text}</span>
        <span className="marquee-strip__item">{text}</span>
        <span className="marquee-strip__item">{text}</span>
      </div>
    </aside>
  )
}

/**
 * Split title into masked lines, terracotta/italic last words, and animated punctuation
 */
export function SectionHeading({ eyebrow, title, body, align = 'left', dark = false }) {
  // Parse title into lines (if string, split by \n or punctuation)
  const lines = typeof title === 'string' ? title.split(/\n|<br\s*\/?>/i) : [title]

  return (
    <div className={`section-heading section-heading--${align} ${dark ? 'section-heading--dark' : ''}`}>
      {eyebrow && <p className="eyebrow heading-eyebrow" data-reveal-eyebrow>{eyebrow}</p>}
      <h2 className="heading-split" data-split-heading>
        {lines.map((line, lIdx) => {
          const isLastLine = lIdx === lines.length - 1
          if (!isLastLine) {
            return (
              <span className="split-line-mask" key={lIdx}>
                <span className="split-line-text">{line}</span>
              </span>
            )
          }

          // In the last line, highlight the final word and trailing punctuation
          const trimmed = line.trim()
          const words = trimmed.split(' ')
          if (words.length <= 1) {
            return (
              <span className="split-line-mask" key={lIdx}>
                <span className="split-line-text highlight-last-word">{trimmed}</span>
              </span>
            )
          }
          const leadWords = words.slice(0, -1).join(' ')
          const lastWord = words[words.length - 1]
          const match = lastWord.match(/^(.*?)([.,!?:;]*)$/)
          const wordText = match ? match[1] : lastWord
          const punct = match ? match[2] : ''

          return (
            <span className="split-line-mask" key={lIdx}>
              <span className="split-line-text">
                {leadWords}{' '}
                <em className="highlight-last-word">
                  {wordText}
                  {punct && <span className="punct-wave">{punct}</span>}
                </em>
              </span>
            </span>
          )
        })}
      </h2>
      {body && <p className="section-heading__body" data-reveal-body>{body}</p>}
    </div>
  )
}

export function ImageReveal({ image, className = '', eager = false, onClick, cursorView = false }) {
  const sizes = className.includes('hero-media') ? '100vw' : '(max-width: 680px) 100vw, (max-width: 980px) 90vw, 50vw'
  return (
    <figure className={`image-reveal ${className} ${cursorView ? 'cursor-view' : ''}`} data-reveal onClick={onClick}>
      <img
        src={image.src}
        srcSet={responsiveSrcSet(image.src)}
        sizes={sizes}
        width={image.width || 1400}
        height={image.height || 1000}
        alt={image.alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
      {cursorView && <span className="image-reveal__label">View</span>}
    </figure>
  )
}

export { Loader } from './Loader'

/**
 * Premium custom cursor with smooth lerp, contextual labels (View, Reserve), and magnetic pull
 */
export function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    // Only initialize on devices with fine pointer (mouse/trackpad)
    const finePointer = window.matchMedia('(pointer: fine)')
    if (!finePointer.matches) return undefined

    let mouseX = -100
    let mouseY = -100
    let ringX = -100
    let ringY = -100
    let targetMagneticX = null
    let targetMagneticY = null
    let activeMode = '' // '', 'view', 'reserve', 'magnetic'
    let animId

    const onMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`
      }

      // Check hover targets
      const target = e.target.closest('a, button, .cursor-view, .cursor-reserve, .menu-item')
      if (!target) {
        activeMode = ''
        targetMagneticX = null
        targetMagneticY = null
        if (ringRef.current) {
          ringRef.current.className = 'custom-cursor__ring'
        }
        if (labelRef.current) labelRef.current.textContent = ''
        return
      }

      if (target.classList.contains('cursor-view') || target.closest('.cursor-view')) {
        activeMode = 'view'
        targetMagneticX = null
        targetMagneticY = null
        if (ringRef.current) ringRef.current.className = 'custom-cursor__ring is-view'
        if (labelRef.current) labelRef.current.textContent = 'View'
      } else if (target.classList.contains('cursor-reserve') || target.closest('.menu-item')) {
        activeMode = 'reserve'
        targetMagneticX = null
        targetMagneticY = null
        if (ringRef.current) ringRef.current.className = 'custom-cursor__ring is-reserve'
        if (labelRef.current) labelRef.current.textContent = 'Reserve'
      } else if (target.classList.contains('button') || target.tagName === 'BUTTON' || target.closest('.button')) {
        activeMode = 'hover'
        targetMagneticX = null
        targetMagneticY = null
        if (ringRef.current) ringRef.current.className = 'custom-cursor__ring is-hover'
        if (labelRef.current) labelRef.current.textContent = ''
      } else {
        activeMode = 'hover'
        targetMagneticX = null
        targetMagneticY = null
        if (ringRef.current) ringRef.current.className = 'custom-cursor__ring is-hover'
        if (labelRef.current) labelRef.current.textContent = ''
      }
    }

    // Smooth lerp loop for the lagging ring
    const render = () => {
      let destX = mouseX
      let destY = mouseY
      if (activeMode === 'magnetic' && targetMagneticX !== null) {
        destX = mouseX * 0.45 + targetMagneticX * 0.55
        destY = mouseY * 0.45 + targetMagneticY * 0.55
      }

      ringX += (destX - ringX) * 0.18
      ringY += (destY - ringY) * 0.18

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`
      }
      animId = requestAnimationFrame(render)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    animId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <>
      <span ref={dotRef} className="custom-cursor" aria-hidden="true" />
      <span ref={ringRef} className="custom-cursor__ring" aria-hidden="true">
        <span ref={labelRef} className="custom-cursor__label" />
      </span>
    </>
  )
}

export function Lightbox({ image, onClose }) {
  useEffect(() => {
    if (!image) return undefined
    const handleKey = (event) => event.key === 'Escape' && onClose()
    document.body.classList.add('lightbox-open')
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.classList.remove('lightbox-open')
      window.removeEventListener('keydown', handleKey)
    }
  }, [image, onClose])

  if (!image) return null
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Gallery image" onClick={onClose}>
      <button className="lightbox__close" type="button" onClick={onClose} aria-label="Close image">×</button>
      <img
        src={image.src}
        srcSet={responsiveSrcSet(image.src)}
        sizes="(max-width: 680px) 94vw, 90vw"
        width={image.width || 1400}
        height={image.height || 1000}
        alt={image.alt}
        loading="lazy"
        decoding="async"
        onClick={(event) => event.stopPropagation()}
      />
      <p>{image.alt}</p>
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg className="whatsapp-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.5 3.5A11.8 11.8 0 0 0 12.08 0C5.55 0 .24 5.31.24 11.84c0 2.09.55 4.13 1.6 5.93L.14 24l6.37-1.67a11.82 11.82 0 0 0 5.57 1.42h.01c6.53 0 11.84-5.31 11.84-11.84 0-3.17-1.24-6.15-3.43-8.41ZM12.1 21.78h-.01a9.88 9.88 0 0 1-5.03-1.38l-.36-.21-3.78.99 1.01-3.68-.23-.38a9.9 9.9 0 0 1-1.52-5.28C2.18 6.37 6.63 1.92 12.1 1.92c2.65 0 5.14 1.03 7.01 2.91a9.84 9.84 0 0 1 2.9 7.02c0 5.47-4.45 9.93-9.91 9.93Zm5.44-7.44c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.23-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.8.38-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.21 5.09 4.5.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.08-.13-.27-.2-.57-.35Z" fill="currentColor" />
    </svg>
  )
}

/**
 * Floating WhatsApp button with gentle pulse ring every 4s, magnetic hover, and hero slide-in
 */
export function WhatsAppFloat() {
  const floatRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const href = `https://wa.me/${siteConfig.brand.whatsapp}?text=${encodeURIComponent(`Hello ${siteConfig.brand.shortName}, I would like to reserve a table.`)}`

  useEffect(() => {
    const handleScroll = () => {
      // Slide in after hero section (e.g. 350px)
      setVisible(window.scrollY > 300)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <a
      ref={floatRef}
      className={`whatsapp-float ${visible ? 'is-visible' : ''}`}
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Book a table on WhatsApp"
    >
      <span className="whatsapp-float__label">Book a Table</span>
      <span className="whatsapp-float__icon">
        <span className="whatsapp-float__pulse" aria-hidden="true" />
        <WhatsAppIcon />
      </span>
    </a>
  )
}

/**
 * Back to top floating button with a circular SVG progress ring
 */
export function BackToTop() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      if (scrollable > 0) {
        const p = Math.min(1, Math.max(0, window.scrollY / scrollable))
        setProgress(p)
        setVisible(window.scrollY > 400)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const radius = 18
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - progress * circumference

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      type="button"
      className={`back-to-top ${visible ? 'is-visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <svg className="back-to-top__ring" viewBox="0 0 44 44" aria-hidden="true">
        <circle className="back-to-top__bg" cx="22" cy="22" r={radius} />
        <circle
          className="back-to-top__fill"
          cx="22"
          cy="22"
          r={radius}
          style={{ strokeDasharray: circumference, strokeDashoffset }}
        />
      </svg>
      <span className="back-to-top__arrow">↑</span>
    </button>
  )
}
