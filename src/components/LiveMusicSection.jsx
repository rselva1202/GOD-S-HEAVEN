import { useMemo } from 'react'
import { siteConfig } from '../data/siteConfig'
import { ArrowIcon, Button, SectionHeading } from './UI'

export default function LiveMusicSection({ onReserve }) {
  const cfg = siteConfig.liveMusic || {}
  const todayDayIndex = useMemo(() => new Date().getDay(), [])

  return (
    <section className="live-music section-dark" id="live-music" aria-labelledby="music-title">
      <div className="lineup__intro page-shell">
        <SectionHeading
          eyebrow={cfg.eyebrow || 'Weekly Sunset & Evening Lineup'}
          title={cfg.title || 'Live Music by the Sea.'}
          body={cfg.description || 'Acoustic sets and seaside rhythms accompanying every sunset on North Cliff.'}
          dark
        />
        <div className="lineup__note">
          <span className="lineup__badge-counter">7 Days a Week</span>
          <p>
            {cfg.scheduleNote || 'Artist lineup and timings: to be confirmed.'}
          </p>
        </div>
      </div>

      <div className="lineup-pin">
        <div className="lineup-track">
          {cfg.days.map((item) => {
            const isToday = item.dayIndex === todayDayIndex
            return (
              <article
                className={`lineup-card lineup-card--${item.dayName.toLowerCase()} ${isToday ? 'lineup-card--today' : ''}`}
                key={item.dayName}
              >
                <div className="lineup-card__top">
                  <span className="lineup-card__day">{item.dayName}</span>
                  {isToday ? (
                    <span className="lineup-card__tonight-badge">Tonight ★</span>
                  ) : (
                    <span className="lineup-card__day-badge">Live Set</span>
                  )}
                </div>

                <div className="lineup-card__body">
                  <span className="lineup-card__genre-pill">{item.genre}</span>
                  <h3 className="lineup-card__title">{item.genre}</h3>
                  <p className="lineup-card__desc">{item.description}</p>

                  <div className="lineup-card__meta">
                    <div>
                      <span className="meta-label">Schedule</span>
                      <strong>{item.time}</strong>
                    </div>
                    <div>
                      <span className="meta-label">Musicians</span>
                      <strong>{item.artist}</strong>
                    </div>
                  </div>
                </div>

                <div className="lineup-card__bottom">
                  <Button
                    variant="primary"
                    className={`lineup-card__btn ${isToday ? 'lineup-card__btn--today' : ''}`}
                    onClick={() =>
                      onReserve?.({
                        occasion: `${item.dayName} Live Music`,
                        timeSlot: 'Dinner & Live Music (7:00 PM – 10:30 PM)',
                      })
                    }
                  >
                    <span>{isToday ? 'Reserve for Tonight ★' : `Book Table for ${item.dayName}`}</span>
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      <div className="lineup__mobile-hint page-shell">
        <span>← Swipe to see full weekly lineup →</span>
      </div>
    </section>
  )
}
