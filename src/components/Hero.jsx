import { siteConfig } from '../data/siteConfig'
import { ArrowIcon, Button } from './UI'
import HeroCanvas from './HeroCanvas'

export default function Hero({ onBookTable, reducedMotion }) {
  return (
    <div className="hero-scroll-container">
      <section className="hero" id="top" aria-labelledby="hero-title">
        {/* 3D scrolling video frames canvas */}
        <HeroCanvas reducedMotion={reducedMotion} />

        {/* Cinematic gradient overlays for contrast and readability */}
        <div className="hero__shade" />
        <div className="hero__shade-sunset" aria-hidden="true" />

        <div className="hero__content page-shell">
          <div className="hero__eyebrow" aria-hidden="true">
            <span className="hero__line" />
            <span className="hero__location-badge">North Cliff · Near the Helipad · Varkala</span>
          </div>
          <h1 id="hero-title">
            {siteConfig.brand.taglineLines.map((line, index) => (
              <span
                className={`hero-copy-line ${index === 1 ? 'hero-copy-line--indent' : ''}`}
                key={line}
              >
                {line}
              </span>
            ))}
          </h1>
          {(siteConfig.brand.heroHeadline || siteConfig.brand.heroSubline) ? (
            <p className="hero__subline">
              {siteConfig.brand.heroHeadline}
              {siteConfig.brand.heroHeadline && siteConfig.brand.heroSubline && <br />}
              <span className="hero__subline-details">
                {siteConfig.brand.heroSubline}
              </span>
            </p>
          ) : null}
          <div className="hero__actions">
            <Button href="#reservation" onClick={onBookTable}>Book a table</Button>
            <Button href="#menu" variant="light">See the menu</Button>
          </div>
          <div className="hero__badges" data-reveal>
            <span className="hero__pill">☼ Outdoor Seating</span>
            <span className="hero__pill">🌿 Vegetarian Options</span>
            <span className="hero__pill">♪ Live Music</span>
            <span className="hero__pill">★ 3,800+ Google Reviews</span>
          </div>
        </div>

        <div className="hero__scroll">
          <span>Scroll to explore 3D</span>
          <i />
        </div>
      </section>
    </div>
  )
}
