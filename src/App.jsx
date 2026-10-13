import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { siteConfig } from './data/siteConfig'
import useReducedMotion from './hooks/useReducedMotion'
import Header from './components/Header'
import Hero from './components/Hero'
import MenuSection from './components/MenuSection'
import LiveMusicSection from './components/LiveMusicSection'
import GallerySection from './components/GallerySection'
import {
  AboutSection,
  HighlightsSection,
  OutdoorViewSection,
  ReviewsSection,
  EventsSection,
  LocationSection,
  FaqSection,
  ContactSection,
  FooterSection,
} from './components/ExperienceSections'
import { BackToTop, CustomCursor, Lightbox, Loader, MarqueeStrip, WaveDivider, WhatsAppFloat } from './components/UI'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const reducedMotion = useReducedMotion()
  const lenisRef = useRef(null)
  const scrollProgressRef = useRef(0)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const [reservationIntent, setReservationIntent] = useState(null)

  useEffect(() => {
    document.body.classList.toggle('loader-locked', loading)
    if (lenisRef.current) {
      if (loading) lenisRef.current.stop()
      else if (!menuOpen) lenisRef.current.start()
    }
    return () => {
      document.body.classList.remove('loader-locked')
    }
  }, [loading, menuOpen])

  useEffect(() => {
    if (loading) return undefined

    const ctx = gsap.context(() => {
      // 1. Generic fade-up for data-reveal elements
      gsap.utils.toArray('[data-reveal]').forEach((element) => {
        gsap.fromTo(
          element,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.0,
            ease: 'power4.out',
            scrollTrigger: { trigger: element, start: 'top 88%', once: true },
          }
        )
      })

      // 2. Animated Eyebrows: letter-spacing 0.4em to 0.15em + fade in
      gsap.utils.toArray('[data-reveal-eyebrow]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, letterSpacing: '0.4em', y: 12 },
          {
            opacity: 1,
            letterSpacing: '0.15em',
            y: 0,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          }
        )
      })

      // 3. Typography Line Mask Reveal: Each line slides up from translateY(110%) with 0.08s stagger
      gsap.utils.toArray('[data-split-heading]').forEach((heading) => {
        const lineTexts = heading.querySelectorAll('.split-line-text')
        if (lineTexts.length > 0) {
          gsap.fromTo(
            lineTexts,
            { yPercent: 110, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 1.05,
              stagger: 0.08,
              ease: 'power4.out',
              scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
            }
          )
        }

        // Horizontal Parallax Shift: Large heading text slightly shifts against scroll direction
        if (!reducedMotion) {
          gsap.to(heading, {
            xPercent: -3,
            ease: 'none',
            scrollTrigger: {
              trigger: heading,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          })
        }
      })

      // 4. Body paragraphs: fade up with slight blur-to-sharp (blur 6px to 0)
      gsap.utils.toArray('[data-reveal-body]').forEach((body) => {
        gsap.fromTo(
          body,
          { opacity: 0, y: 24, filter: 'blur(6px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: body, start: 'top 88%', once: true },
          }
        )
      })

      // 5. Decorative line draw-in
      gsap.utils.toArray('[data-draw-line]').forEach((line) => {
        gsap.fromTo(
          line,
          { scaleX: 0, transformOrigin: 'left center' },
          {
            scaleX: 1,
            duration: 1.2,
            ease: 'power4.out',
            scrollTrigger: { trigger: line, start: 'top 88%', once: true },
          }
        )
      })

      // 6. Section 1 Arched Image wipe & Hero animations
      if (!reducedMotion) {
        // Hero copy reveal
        gsap.fromTo(
          '.hero-copy-line',
          { yPercent: 105, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1.05, stagger: 0.13, delay: 0.05, ease: 'power4.out' }
        )

        // Hero shade hue shift (gold -> coral -> deep teal)
        gsap.to('.hero__shade-sunset', {
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.hero-scroll-container', start: 'top top', end: 'bottom bottom', scrub: true },
        })

        // About section arch clip-path wipe from bottom arch to full arch
        const archFrame = document.querySelector('.about__arch-frame')
        if (archFrame) {
          gsap.fromTo(
            archFrame,
            { clipPath: 'inset(80% 15% 0% 15% round 180px 180px 0 0)', opacity: 0 },
            {
              clipPath: 'inset(0% 0% 0% 0% round 240px 240px 4px 4px)',
              opacity: 1,
              duration: 1.4,
              ease: 'power4.out',
              scrollTrigger: { trigger: archFrame, start: 'top 85%', once: true },
            }
          )
        }

        // Layered terracotta arch outline drifts opposite to image
        const archOutline = document.querySelector('.about__arch-outline')
        if (archOutline) {
          gsap.to(archOutline, {
            y: -35,
            x: -12,
            ease: 'none',
            scrollTrigger: {
              trigger: '.about',
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          })
        }

        // Highlights Section: Pinned horizontal scroll on desktop + staggered 3D tilt
        const highlightsPin = document.querySelector('.highlights-pin-wrap')
        const highlightsGrid = document.querySelector('.highlights-grid')
        if (highlightsPin && highlightsGrid && window.matchMedia('(min-width: 981px)').matches) {
          const getDist = () => Math.max(0, highlightsGrid.scrollWidth - window.innerWidth + 120)
          gsap.to(highlightsGrid, {
            x: () => -getDist(),
            ease: 'none',
            scrollTrigger: {
              trigger: highlightsPin,
              start: 'top top',
              end: () => `+=${getDist()}`,
              scrub: 1,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })
        }

        // Pinned horizontal scroll for weekly live music lineup
        const track = document.querySelector('.lineup-track')
        const pin = document.querySelector('.lineup-pin')
        if (track && pin && window.matchMedia('(min-width: 981px)').matches) {
          const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth + 80)
          gsap.to(track, {
            x: () => -getDistance(),
            ease: 'none',
            scrollTrigger: {
              trigger: pin,
              start: 'top top',
              end: () => `+=${getDistance()}`,
              scrub: 1,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })
        }

        // Footer Giant Name: Fills with color on scroll (stroke to solid)
        const giantFooter = document.querySelector('[data-footer-giant]')
        if (giantFooter) {
          gsap.fromTo(
            giantFooter.querySelector('.giant-outline-text'),
            { backgroundSize: '0% 100%' },
            {
              backgroundSize: '100% 100%',
              ease: 'none',
              scrollTrigger: {
                trigger: giantFooter,
                start: 'top 92%',
                end: 'bottom 80%',
                scrub: true,
              },
            }
          )
        }
      }

      ScrollTrigger.refresh()
    })

    return () => {
      ctx.revert()
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [loading, reducedMotion])

  // Top scroll-progress bar (teal to terracotta gradient)
  useEffect(() => {
    const bar = document.querySelector('.progress-bar')
    const updateProgress = (scrollVal) => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const p = scrollable > 0 ? Math.min(1, Math.max(0, scrollVal / scrollable)) : 0
      scrollProgressRef.current = p
      if (bar) bar.style.transform = `scaleX(${p})`
    }
    const onScroll = () => updateProgress(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lenis smooth inertial scrolling
  useEffect(() => {
    if (reducedMotion) return undefined
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true })
    lenisRef.current = lenis
    const onScroll = (e) => {
      ScrollTrigger.update()
      if (e && typeof e.progress === 'number') {
        scrollProgressRef.current = e.progress
      }
    }
    const raf = (time) => lenis.raf(time * 1000)
    lenis.on('scroll', onScroll)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    return () => {
      lenis.off('scroll', onScroll)
      gsap.ticker.remove(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reducedMotion])

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)
    if (lenisRef.current) {
      if (menuOpen) lenisRef.current.stop()
      else lenisRef.current.start()
    }
    return () => {
      document.body.classList.remove('menu-open')
      lenisRef.current?.start()
    }
  }, [menuOpen])

  const openReservation = (intent = {}) => {
    setReservationIntent(intent)
    window.setTimeout(() => {
      document.querySelector('#reservation')?.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
      })
    }, 40)
  }

  const handleHighlightSelect = (id) => {
    if (id === 'live-music') {
      document.querySelector('#live-music')?.scrollIntoView({ behavior: 'smooth' })
    } else if (id === 'outdoor-seating') {
      document.querySelector('#outdoor')?.scrollIntoView({ behavior: 'smooth' })
    } else if (id === 'vegetarian-options') {
      document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {loading && <Loader onComplete={() => setLoading(false)} />}
      <div className="progress-bar" aria-hidden="true" />
      <Header menuOpen={menuOpen} onMenuToggle={setMenuOpen} />
      <main>
        {/* 1. Hero */}
        <Hero onBookTable={() => openReservation({ occasion: 'Sunset & Sea View Table' })} reducedMotion={reducedMotion} />
        
        {/* Slow marquee strip between sections */}
        <MarqueeStrip text="FRESH ARABIAN SEA CATCH • LIVE MUSIC • SUNSET SEATING • KERALA RECIPES •" />

        {/* 2. About */}
        <AboutSection />
        <WaveDivider fill="var(--cream)" />

        {/* 3. Service highlights */}
        <HighlightsSection onHighlightSelect={handleHighlightSelect} />

        {/* Slow marquee strip */}
        <MarqueeStrip text="CLIFF-TOP PERCH • NEAR THE HELIPAD • OCEAN BREEZE • AUTHENTIC MALABAR SPICES •" />

        {/* 4. Menu */}
        <MenuSection onReserveItem={openReservation} />
        <WaveDivider fill="var(--ocean-teal)" />

        {/* 5. Live music (Pinned horizontal scroll) */}
        <LiveMusicSection onReserve={openReservation} />
        <WaveDivider fill="var(--sand)" />

        {/* 6. Outdoor seating and sea view */}
        <OutdoorViewSection onReserveTable={openReservation} />
        <WaveDivider fill="var(--ocean-teal)" />

        {/* 7. Reviews (3,800+ Google reviews counter) */}
        <ReviewsSection />
        <WaveDivider fill="var(--cream)" />

        {/* 8. Events and groups */}
        <EventsSection onEnquireEvent={openReservation} />
        <WaveDivider fill="var(--ocean-teal)" />

        {/* 9. Gallery */}
        <GallerySection onOpen={setLightbox} />
        <WaveDivider fill="var(--sand)" />

        {/* 10. Find us */}
        <LocationSection />
        <WaveDivider fill="var(--cream)" />

        {/* 11. FAQ */}
        <FaqSection />
        <WaveDivider fill="var(--laterite)" />

        {/* Table Reservation & Contact */}
        <ContactSection reservationIntent={reservationIntent} />
        <WaveDivider fill="var(--ocean-teal)" />
      </main>

      {/* 12. Footer */}
      <FooterSection />

      {/* Global Interactive Floating UI */}
      <WhatsAppFloat />
      <BackToTop />
      <Lightbox image={lightbox} onClose={() => setLightbox(null)} />
      <CustomCursor />
      
      {/* Film grain & warm subtle vignette */}
      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      
      <div className="sr-only">
        {siteConfig.brand.name} restaurant and live music concept website
      </div>
    </>
  )
}
