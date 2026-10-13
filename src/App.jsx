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
import { CustomCursor, Lightbox, Loader, WaveDivider, WhatsAppFloat } from './components/UI'

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
      gsap.utils.toArray('[data-reveal]').forEach((element) => {
        gsap.fromTo(
          element,
          { y: 34, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 88%', once: true },
          }
        )
      })

      if (!reducedMotion) {
        gsap.fromTo(
          '.hero-media img',
          { scale: 1.16 },
          { scale: 1.03, duration: 2, ease: 'power2.out' }
        )
        gsap.to('.hero-media img', {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
        })
        gsap.to('.hero__shade-sunset', {
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.hero-scroll-container', start: 'top top', end: 'bottom bottom', scrub: true },
        })
        gsap.fromTo(
          '.hero-copy-line',
          { yPercent: 105, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1.05, stagger: 0.13, delay: 0.05, ease: 'power4.out' }
        )
        gsap.utils.toArray('.image-reveal img').forEach((image) =>
          gsap.fromTo(
            image,
            { scale: 1.08 },
            {
              scale: 1,
              duration: 1.2,
              ease: 'power2.out',
              scrollTrigger: { trigger: image, start: 'top 86%', once: true },
            }
          )
        )

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
      }
      ScrollTrigger.refresh()
    })
    return () => {
      ctx.revert()
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [loading, reducedMotion])

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
        <WaveDivider fill="var(--sand)" />

        {/* 2. About */}
        <AboutSection />
        <WaveDivider fill="var(--cream)" />

        {/* 3. Service highlights */}
        <HighlightsSection onHighlightSelect={handleHighlightSelect} />
        <WaveDivider fill="var(--sand)" />

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

      <WhatsAppFloat />
      <Lightbox image={lightbox} onClose={() => setLightbox(null)} />
      <CustomCursor />
      <div className="grain" aria-hidden="true" />
      <div className="sr-only">
        {siteConfig.brand.name} restaurant and live music concept website
      </div>
    </>
  )
}
