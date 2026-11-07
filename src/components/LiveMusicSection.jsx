import { useEffect, useMemo, useState } from 'react'
import { siteConfig } from '../data/siteConfig'
import { ArrowIcon, Button, SectionHeading } from './UI'
import TonightLive from './TonightLive'
import { getLiveMusicLineup, getTonightLiveMusic } from '../lib/api'

export default function LiveMusicSection({ onReserve }) {
  const cfg = siteConfig.liveMusic || {}
  const todayDayIndex = useMemo(() => new Date().getDay(), [])
  const [days, setDays] = useState(cfg.days || [])
  const [tonightData, setTonightData] = useState(null)

  useEffect(() => {
    let active = true
    getLiveMusicLineup()
      .then((res) => {
        if (active && res?.days && res.days.length > 0) {
          setDays((prev) =>
            prev.map((d) => {
              const apiMatch = res.days.find((x) => x.day_index === d.dayIndex)
              if (apiMatch) {
                return {
                  ...d,
                  artist: apiMatch.artist || d.artist,
                  time: apiMatch.time || d.time,
                  genre: apiMatch.genre || d.genre,
                  description: apiMatch.description || d.description,
                }
              }
              return d
            })
          )
        }
      })
      .catch(() => {})

    getTonightLiveMusic()
      .then((t) => {
        if (active && t) setTonightData(t)
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [cfg.days])

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
            {tonightData && tonightData.artist && tonightData.artist !== 'Artist lineup: to be confirmed' ? (
              <span className="tonight-live-pill">
                <strong>Tonight:</strong> {tonightData.artist} · {tonightData.time}
              </span>
            ) : (
              <TonightLive fallbackText={cfg.scheduleNote || 'Artist lineup and timings: to be confirmed.'} />
            )}
          </p>
        </div>
      </div>

      <div className="lineup-pin">
        <div className="lineup-track">
          {days.map((item) => {
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
