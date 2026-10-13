import { useState, useRef, useEffect, useCallback } from 'react'
import { siteConfig } from '../data/siteConfig'
import { SectionHeading } from './UI'

export default function GallerySection({ onOpen }) {
  const gallery = siteConfig.images?.gallery || []
  const total = gallery.length
  const [activeIndex, setActiveIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const carouselRef = useRef(null)

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total)
  }, [total])

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total)
  }, [total])

  // Keyboard navigation when section or stage is focused
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      handlePrev()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      handleNext()
    }
  }

  // Touch swipe support
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
    setTouchEnd(null)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > 45) {
      handleNext()
    } else if (distance < -45) {
      handlePrev()
    }
    setTouchStart(null)
    setTouchEnd(null)
  }

  // Mouse drag support
  const handleMouseDown = (e) => {
    setIsDragging(true)
    dragStartX.current = e.clientX
  }

  const handleMouseUp = (e) => {
    if (!isDragging) return
    setIsDragging(false)
    const diff = dragStartX.current - e.clientX
    if (diff > 50) {
      handleNext()
    } else if (diff < -50) {
      handlePrev()
    }
  }

  const handleCardClick = (idx, isCenter, image) => {
    if (isCenter) {
      onOpen?.(image)
    } else {
      setActiveIndex(idx)
    }
  }

  // Calculate circular position relative to activeIndex
  const getCardPosition = (idx) => {
    const diff = (idx - activeIndex + total) % total
    if (diff === 0) return 'is-active'
    if (diff === 1) return 'is-next'
    if (diff === total - 1) return 'is-prev'
    if (diff > 1 && diff <= total / 2) return 'is-hidden-right'
    return 'is-hidden-left'
  }

  return (
    <section
      className="gallery section-cream"
      id="gallery"
      aria-labelledby="gallery-title"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Cliffside Life Gallery Carousel"
    >
      <div className="page-shell">
        <SectionHeading
          eyebrow="A glimpse of cliffside life"
          title="Keep a little light for later."
          body="Catch the salt breeze, watch the Arabian Sea turn to gold, and linger for the last table in the twilight."
        />
      </div>

      {/* Side-Scrollable Coverflow Cards Showcase */}
      <div
        className="gallery-carousel"
        ref={carouselRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <div className="gallery-carousel__stage" role="region" aria-label="Photo carousel">
          {gallery.map((image, index) => {
            const posClass = getCardPosition(index)
            const isCenter = posClass === 'is-active'
            const isPrev = posClass === 'is-prev'
            const isNext = posClass === 'is-next'

            return (
              <article
                key={image.src || index}
                className={`gallery-card ${posClass} ${isCenter ? 'cursor-view' : ''}`}
                onClick={() => handleCardClick(index, isCenter, image)}
                role="button"
                tabIndex={isCenter ? 0 : -1}
                aria-label={
                  isCenter
                    ? `Active photo: ${image.caption || image.alt}. Click to open full view.`
                    : isPrev
                    ? `Previous photo: ${image.caption || image.alt}. Click to focus.`
                    : `Next photo: ${image.caption || image.alt}. Click to focus.`
                }
              >
                {/* Image container */}
                <div className="gallery-card__image-wrap">
                  <img
                    src={image.src}
                    alt={image.alt || 'Gallery image'}
                    className="gallery-card__img"
                    loading="lazy"
                    decoding="async"
                  />
                  {/* Subtle glass shimmer reflection on side transparent cards */}
                  {!isCenter && <div className="gallery-card__glass-veil" aria-hidden="true" />}
                </div>

                {/* Center / Original Image Card Details */}
                {isCenter && (
                  <>
                    <div className="gallery-card__badge-top">
                      <span className="badge-pill">
                        <span className="badge-dot" />
                        Original View · {index + 1} / {total}
                      </span>
                    </div>

                    <div className="gallery-card__caption-bar">
                      <div className="gallery-card__caption-text">
                        <strong>{image.caption || image.alt}</strong>
                        <small>North Cliff · Varkala, Kerala</small>
                      </div>
                      <span className="gallery-card__expand-pill">
                        <span>Expand photo</span>
                        <span className="expand-arrow">↗</span>
                      </span>
                    </div>
                  </>
                )}

                {/* Left & Right Transparent Cards Indicators */}
                {(isPrev || isNext) && (
                  <div className="gallery-card__peek-label" aria-hidden="true">
                    <span>{isPrev ? '← Previous' : 'Next →'}</span>
                  </div>
                )}
              </article>
            )
          })}
        </div>

        {/* Carousel Navigation Bar */}
        <div className="gallery-carousel__controls page-shell">
          <button
            type="button"
            className="gallery-nav-btn gallery-nav-btn--prev"
            onClick={handlePrev}
            aria-label="View previous photo"
          >
            <span aria-hidden="true">←</span>
          </button>

          <div className="gallery-carousel__dots" role="tablist" aria-label="Photo select">
            {gallery.map((img, idx) => (
              <button
                key={img.src || idx}
                type="button"
                role="tab"
                aria-selected={activeIndex === idx}
                aria-label={`Jump to photo ${idx + 1}`}
                className={`gallery-dot ${activeIndex === idx ? 'is-active' : ''}`}
                onClick={() => setActiveIndex(idx)}
              >
                <span className="gallery-dot__fill" />
                <span className="gallery-dot__num">0{idx + 1}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="gallery-nav-btn gallery-nav-btn--next"
            onClick={handleNext}
            aria-label="View next photo"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <p className="gallery-carousel__hint" aria-hidden="true">
          <span>✦</span> Click side cards or use arrows to scroll · Click center image for fullscreen
        </p>
      </div>

      <div className="gallery__footer page-shell">
        <span>{siteConfig.brand.cityName} · {siteConfig.brand.coordinates}</span>
        <span>Open daily, always slowly</span>
      </div>
    </section>
  )
}
