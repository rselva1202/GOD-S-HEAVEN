import { useEffect, useRef, useState } from 'react'
import { siteConfig, navigation } from '../data/siteConfig'
import BookingForm from './BookingForm'
import { ArrowIcon, Button, ImageReveal, SectionHeading } from './UI'
import brandLogo from '../assets/logo.png'

export function AboutSection() {
  const logoSrc = brandLogo || siteConfig.brand.logo
  const archRef = useRef(null)
  const imageWrapRef = useRef(null)

  // 3D tilt interaction on mouse move for the arched image
  const handleMouseMove = (e) => {
    if (!archRef.current) return
    const rect = archRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const rotateX = -(y / (rect.height / 2)) * 6 // max 6 deg
    const rotateY = (x / (rect.width / 2)) * 6
    archRef.current.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`
  }

  const handleMouseLeave = () => {
    if (archRef.current) {
      archRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)'
    }
  }

  return (
    <section className="about section-sand" id="about" aria-labelledby="about-title">
      <div className="about__grid page-shell">
        {/* Layered Arched Image with rotating circular badge, offset terracotta outline, and Ken Burns zoom */}
        <div
          className="about__arch-container"
          ref={archRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          data-arch-tilt
        >
          {/* Faint offset terracotta arch outline behind (layered depth) */}
          <div className="about__arch-outline" aria-hidden="true" />

          {/* Arched image wrapper with clip-path wipe & Ken Burns */}
          <div className="about__arch-frame" ref={imageWrapRef}>
            <ImageReveal
              image={siteConfig.images.about}
              className="about__image arch-kenburns"
            />
          </div>

          {/* Rotating circular text badge around corner */}
          <div className="about__badge-rotate" aria-hidden="true">
            <svg viewBox="0 0 140 140" className="badge-svg">
              <path
                id="badgeTextPath"
                d="M 70, 70 m -52, 0 a 52,52 0 1,1 104,0 a 52,52 0 1,1 -104,0"
                fill="none"
              />
              <text className="badge-svg-text">
                <textPath href="#badgeTextPath" startOffset="0%">
                  VARKALA • NORTH CLIFF • HELIPAD •
                </textPath>
              </text>
            </svg>
            <span className="badge-icon" aria-hidden="true">≈</span>
          </div>
        </div>

        <div className="about__copy">
          <SectionHeading
            eyebrow={siteConfig.about?.eyebrow || 'Our Story & Perch'}
            title={siteConfig.about?.title || 'A cliff-top Kerala kitchen above the waves.'}
            body={siteConfig.about?.body}
          />

          {/* 3 Animated Stat Counters under the story */}
          <div className="about__stats" data-reveal>
            <div className="about-stat">
              <strong className="about-stat__num" data-count="365">365</strong>
              <span className="about-stat__label">Sunset views every evening</span>
            </div>
            <div className="about-stat">
              <strong className="about-stat__num">100%</strong>
              <span className="about-stat__label">Fresh Arabian catch daily</span>
            </div>
            <div className="about-stat">
              <strong className="about-stat__num">7 / 7</strong>
              <span className="about-stat__label">Live music nights weekly</span>
            </div>
          </div>

          <div className="about__signature">
            {logoSrc ? (
              <img src={logoSrc} alt={siteConfig.brand.name} className="about__signature-logo" />
            ) : (
              <span className="signature-mark">G</span>
            )}
            <span>{siteConfig.about?.caption || 'North Cliff near the Helipad · Est. 2012'}</span>
          </div>
          <div className="about__actions">
            <a className="text-link" href="#menu">
              Explore our menu <ArrowIcon />
            </a>
            <a className="text-link" href="#location">
              Find our cliff perch <ArrowIcon />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export function HighlightsSection({ onHighlightSelect }) {
  const highlights = siteConfig.highlights || []

  // Hover spotlight tracker (sets --x and --y on cards)
  const handleCardMouseMove = (e) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    card.style.setProperty('--spot-x', `${x}px`)
    card.style.setProperty('--spot-y', `${y}px`)
  }

  // Relevant photos behind cards for hover reveal (15% opacity with slow zoom)
  const cardBgs = [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', // sea view
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', // kerala veg curry
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80', // live music
  ]

  return (
    <section className="highlights section-cream" id="highlights" aria-labelledby="highlights-title">
      <div className="page-shell highlights__intro-wrap">
        <SectionHeading
          eyebrow="What We Offer"
          title="Cliffside Dining Highlights."
          body="Everything that makes an unhurried coastal meal on North Cliff special."
        />

        {/* Floating parallax decorative wave graphic filling space to the right */}
        <div className="highlights__cluster" aria-hidden="true">
          <svg className="cluster-wave-svg" viewBox="0 0 320 80" fill="none">
            <path
              d="M10,40 Q80,10 160,40 T310,40"
              stroke="var(--terracotta)"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              className="cluster-wave-path"
            />
          </svg>
          <span className="cluster-pill">North Cliff • Varkala Perch</span>
        </div>
      </div>

      <div className="highlights-pin-wrap">
        <div className="highlights-grid page-shell">
          {highlights.map((item, idx) => (
            <div
              className={`highlight-card highlight-card--${item.id}`}
              key={item.id}
              data-reveal
              onMouseMove={handleCardMouseMove}
            >
              {/* Background photo reveal on hover (15% opacity) */}
              <div
                className="highlight-card__bg-reveal"
                style={{ backgroundImage: `url(${cardBgs[idx % cardBgs.length]})` }}
                aria-hidden="true"
              />

              {/* Radial spotlight effect */}
              <div className="highlight-card__spotlight" aria-hidden="true" />

              <div className="highlight-card__top">
                <span className={`highlight-card__icon highlight-card__icon--${item.id}`} aria-hidden="true">
                  {item.icon}
                </span>
                <span className="highlight-card__tag">{item.tag}</span>
              </div>
              <h3>{item.title}</h3>
              <p className="highlight-card__subtitle">{item.subtitle}</p>
              <p className="highlight-card__body">{item.description}</p>
              <button
                type="button"
                className="highlight-card__link text-link"
                onClick={() => onHighlightSelect?.(item.id)}
              >
                <span>Learn more</span> <ArrowIcon />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function OutdoorViewSection({ onReserveTable }) {
  const cfg = siteConfig.outdoorSeating || {}
  return (
    <section className="outdoor section-sand" id="outdoor" aria-labelledby="outdoor-title">
      <div className="outdoor__grid page-shell">
        <div className="outdoor__copy">
          <SectionHeading
            eyebrow={cfg.eyebrow || 'Cliffside Atmosphere'}
            title={cfg.title || 'Tables with unobstructed Arabian Sea views.'}
            body={cfg.body}
          />
          <ul className="outdoor__features" data-reveal>
            {(cfg.features || []).map((feat) => (
              <li key={feat}>
                <span className="feature-check" aria-hidden="true">✓</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
          <div className="outdoor__actions">
            <Button href="#reservation" onClick={() => onReserveTable?.({ occasion: 'Sunset & Sea View Table' })}>
              Reserve a sunset table
            </Button>
          </div>
        </div>
        <div className="outdoor__media" data-reveal>
          <ImageReveal image={cfg.image || siteConfig.images.outdoor} className="outdoor__image" />
        </div>
      </div>
    </section>
  )
}

function AnimatedReviewsCounter({ target = 3800 }) {
  const [count, setCount] = useState(0)
  const counterRef = useRef(null)

  useEffect(() => {
    let triggered = false
    const checkVisible = () => {
      if (!triggered && counterRef.current) {
        const rect = counterRef.current.getBoundingClientRect()
        if (rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.95 && rect.bottom >= 0) {
          triggered = true
          const duration = 1800
          const startTime = performance.now()
          const step = (now) => {
            const elapsed = now - startTime
            const progress = Math.min(1, elapsed / duration)
            const ease = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(ease * target))
            if (progress < 1) {
              requestAnimationFrame(step)
            } else {
              setCount(target)
            }
          }
          requestAnimationFrame(step)
        }
      }
    }

    window.addEventListener('scroll', checkVisible, { passive: true })
    window.addEventListener('resize', checkVisible, { passive: true })
    const timer = setTimeout(checkVisible, 100)
    return () => {
      window.removeEventListener('scroll', checkVisible)
      window.removeEventListener('resize', checkVisible)
      clearTimeout(timer)
    }
  }, [target])

  return (
    <div ref={counterRef} className="reviews-counter">
      <span className="reviews-counter__num">{count.toLocaleString()}+</span>
      <span className="reviews-counter__label">Google Reviews</span>
    </div>
  )
}

export function ReviewsSection() {
  const [active, setActive] = useState(0)
  const data = siteConfig.reviewsData || { reviews: [] }
  const total = data.reviews?.length || 1
  const review = data.reviews?.[active] || {}

  // Auto-sliding review carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % total)
    }, 6500)
    return () => clearInterval(timer)
  }, [total])

  return (
    <section className="reviews section-ink" id="reviews" aria-labelledby="reviews-title">
      <div className="reviews__inner page-shell">
        <div className="reviews__header">
          <SectionHeading
            eyebrow={data.eyebrow || 'Kind words from our guests'}
            title={data.title || 'Over 3,800 Google reviews.'}
            dark
          />
          <AnimatedReviewsCounter target={data.counter || 3800} />
        </div>

        <div className="review-card" data-reveal key={active}>
          <div className="review-card__stars" aria-label="5 out of 5 stars">
            {'★★★★★'.split('').map((star, sIdx) => (
              <span className="star-pop" key={sIdx} style={{ animationDelay: `${sIdx * 0.08}s` }}>{star}</span>
            ))}
          </div>
          <div className="review-card__quote">“</div>
          <blockquote>{review.quote}</blockquote>
          <div className="review-card__meta">
            <span>{review.author}</span>
            <small>{review.source}</small>
          </div>
          <div className="review-card__controls">
            <button
              type="button"
              aria-label="Previous review"
              onClick={() => setActive((active - 1 + total) % total)}
            >
              ←
            </button>
            <span>0{active + 1} <i>/</i> 0{total}</span>
            <button
              type="button"
              aria-label="Next review"
              onClick={() => setActive((active + 1) % total)}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export function EventsSection({ onEnquireEvent }) {
  const cfg = siteConfig.events || {}
  return (
    <section className="events section-cream" id="events" aria-labelledby="events-title">
      <div className="page-shell">
        <div className="events__grid">
          <div className="events__copy">
            <SectionHeading
              eyebrow={cfg.eyebrow || 'Gatherings & Celebrations'}
              title={cfg.title || 'Birthdays, group dinners & private celebrations.'}
              body={cfg.body}
            />
            <Button
              href="#reservation"
              onClick={() => onEnquireEvent?.({ occasion: 'Group / Birthday Celebration' })}
            >
              Enquire about a group table
            </Button>
          </div>
          <div className="events__options">
            {(cfg.options || []).map((opt) => (
              <div className="event-item" key={opt.title} data-reveal>
                <h4>{opt.title}</h4>
                <p>{opt.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function LocationSection() {
  const loc = siteConfig.location || {}

  // Live status badge: "Open Sunset to Late" with pulsing green indicator
  return (
    <section className="location section-sand" id="location" aria-labelledby="location-title">
      <div className="location__grid page-shell">
        <div className="location__copy">
          <SectionHeading
            eyebrow={loc.eyebrow || 'Find Us on the Cliff'}
            title={loc.title || 'Near the Helipad on North Cliff.'}
            body={loc.body}
          />

          {/* Live Open / Closed Status Badge */}
          <div className="live-status-badge" data-reveal>
            <span className="live-status-dot" aria-hidden="true" />
            <strong>Open Sunset to Late</strong>
            <span>• Walk-ins & Reservations welcome</span>
          </div>

          <div className="location__info-cards">
            <div className="info-card">
              <span className="info-card__label">Address</span>
              <p>{siteConfig.brand.address}</p>
              <small>Landmark: {siteConfig.brand.landmark}</small>
            </div>
            <div className="info-card">
              <span className="info-card__label">Opening Hours</span>
              <p>{siteConfig.brand.hours}</p>
            </div>
            <div className="info-card">
              <span className="info-card__label">Parking & Arrival</span>
              <p>{siteConfig.brand.parking}</p>
            </div>
          </div>
          <div className="location__actions">
            <Button
              href={siteConfig.brand.mapsUrl}
              target="_blank"
              variant="outline"
            >
              <span>Search on Google Maps</span>
              <ArrowIcon />
            </Button>
          </div>
        </div>

        <div className="map-embed-wrapper" data-reveal>
          {/* Animated dropping map pin with bounce */}
          <div className="bouncing-map-pin" aria-hidden="true">
            <span className="pin-pulse" />
            <span className="pin-head">📍</span>
          </div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3943.52622970911!2d76.7033032!3d8.7364556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b05ef1c6cdef8c3%3A0xb901243366d650b8!2sGod's%20Own%20Country%20Kitchen!5e0!3m2!1sen!2sin!4v1791660658325!5m2!1sen!2sin"
            width="600"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            title="God's Own Country Kitchen Google Map"
          />
        </div>
      </div>
    </section>
  )
}

export function FaqSection() {
  const [open, setOpen] = useState(0)
  return (
    <section className="faq section-cream" id="faq" aria-labelledby="faq-title">
      <div className="faq__grid page-shell">
        <SectionHeading
          eyebrow="Helpful Details"
          title="Frequently Asked Questions."
          body="A few details guests ask before heading to our cliffside table."
        />
        <div className="faq-list">
          {siteConfig.faqs.map((faq, index) => (
            <div className={`faq-item ${open === index ? 'is-open' : ''}`} key={faq.question}>
              <button
                type="button"
                onClick={() => setOpen(open === index ? -1 : index)}
                aria-expanded={open === index}
              >
                <span>0{index + 1}</span>
                <strong>{faq.question}</strong>
                <i>{open === index ? '−' : '+'}</i>
              </button>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ContactSection({ reservationIntent }) {
  return (
    <section className="contact section-terracotta" id="contact" aria-labelledby="contact-title">
      <div className="contact__top page-shell">
        <div>
          <p className="eyebrow">Table Reservations & Enquiries</p>
          <h2 id="contact-title">An unhurried table<br /><em>overlooking the sea.</em></h2>
        </div>
        <a className="contact__phone" href={siteConfig.brand.phoneHref} target="_blank" rel="noreferrer">
          Chat on WhatsApp
          <span>Fastest reservation enquiry <ArrowIcon /></span>
        </a>
      </div>
      <div className="page-shell">
        <BookingForm reservationIntent={reservationIntent} />
      </div>
      <div className="contact__details page-shell">
        <div>
          <span>Location</span>
          <p>{siteConfig.brand.address}</p>
        </div>
        <div>
          <span>Hours</span>
          <p>{siteConfig.brand.hours}<br />{siteConfig.brand.phone}</p>
        </div>
        <div>
          <span>Direct Contact</span>
          <p>WhatsApp: {siteConfig.brand.whatsappLabel}<br />{siteConfig.brand.email}</p>
        </div>
      </div>
    </section>
  )
}

export function FooterSection() {
  return (
    <footer className="footer section-ink">
      <div className="footer__top page-shell">
        <BrandFooter />
        <div className="footer__links">
          <div>
            <span>Explore</span>
            {navigation.map((item) => (
              <a key={item.href} href={item.href}>{item.label}</a>
            ))}
          </div>
          <div>
            <span>Connect</span>
            <a href={siteConfig.brand.phoneHref} target="_blank" rel="noreferrer">WhatsApp Reservation</a>
            <a href={siteConfig.brand.mapsUrl} target="_blank" rel="noreferrer">Google Maps Location</a>
          </div>
        </div>
      </div>

      {/* Giant outlined brand name that fills with solid color on scroll */}
      <div className="footer__giant-name page-shell" aria-hidden="true" data-footer-giant>
        <span className="giant-outline-text">{siteConfig.brand.name}</span>
      </div>

      <div className="footer__bottom page-shell">
        <span>© {new Date().getFullYear()} {siteConfig.brand.shortName}</span>
        <span>{siteConfig.brand.locationLine}</span>
      </div>
    </footer>
  )
}

function BrandFooter() {
  const logoSrc = brandLogo || siteConfig.brand.logo
  return (
    <div className="footer-brand" aria-label={siteConfig.brand.name}>
      {logoSrc && (
        <img src={logoSrc} alt={siteConfig.brand.name} className="footer-brand__logo" />
      )}
      <div className="footer-brand__text">
        <span>{siteConfig.brand.name}</span>
        {siteConfig.brand.descriptor && <small>{siteConfig.brand.descriptor}</small>}
      </div>
    </div>
  )
}
