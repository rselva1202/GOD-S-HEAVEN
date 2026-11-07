import { useState, useEffect } from 'react'
import { trackReservation } from '../lib/api'
import { ArrowIcon, Button } from './UI'

export default function TrackReservation({ initialBookingId = '', onClose }) {
  const [bookingId, setBookingId] = useState(initialBookingId)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrack = async (idToTrack) => {
    const id = (idToTrack || bookingId).trim()
    if (!id) {
      setError('Please enter a valid Booking ID (e.g. GOCK-2026-XXXX).')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await trackReservation(id)
      setData(res)
    } catch (err) {
      setData(null)
      setError(err.message || 'No reservation found for this Booking ID. Please verify and try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialBookingId) {
      setBookingId(initialBookingId)
      handleTrack(initialBookingId)
    }
  }, [initialBookingId])

  const statusColors = {
    enquiry: '#B5502B',
    confirmed: '#196F3D',
    seated: '#0B3C49',
    completed: '#0E6655',
    cancelled: '#922B21',
    no_show: '#7B241C',
  }

  return (
    <div className="track-modal" style={{
      background: 'var(--cream, #FAF6EE)',
      border: '1px solid rgba(11, 60, 73, 0.2)',
      borderRadius: '8px',
      padding: 'clamp(20px, 4vw, 36px)',
      maxWidth: '680px',
      margin: '0 auto',
      boxShadow: '0 20px 50px rgba(11, 60, 73, 0.2)',
      color: 'var(--ink, #0B3C49)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--terracotta, #B5502B)', fontWeight: 700 }}>
            Live Booking Status
          </span>
          <h3 style={{ margin: '4px 0 0', fontFamily: 'var(--display, serif)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 400 }}>
            Track Your Table Reservation
          </h3>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--ink)' }}
            aria-label="Close reservation tracker"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleTrack(); }} style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value.toUpperCase())}
          placeholder="Enter Booking ID (e.g. GOCK-2026-X8Y)"
          style={{
            flex: '1 1 240px',
            padding: '12px 16px',
            border: '1.5px solid rgba(11, 60, 73, 0.3)',
            borderRadius: '4px',
            fontFamily: 'inherit',
            fontSize: '0.86rem',
            background: '#FFFFFF',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        />
        <button
          type="submit"
          className="button button--primary"
          disabled={loading}
          style={{ minWidth: '120px', justifyContent: 'center' }}
        >
          <span>{loading ? 'Searching...' : 'Track Table'}</span>
          <ArrowIcon />
        </button>
      </form>

      {error && (
        <div style={{ padding: '12px 16px', background: '#FADBD8', color: '#922B21', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {data && data.reservation && (
        <div style={{ borderTop: '1px solid rgba(11, 60, 73, 0.15)', paddingTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
            <div>
              <strong style={{ fontSize: '1.1rem', letterSpacing: '0.04em' }}>{data.reservation.booking_id}</strong>
              <div style={{ fontSize: '0.82rem', color: '#555' }}>
                {data.reservation.name} · {data.reservation.people}
              </div>
            </div>
            <span style={{
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#FFFFFF',
              background: statusColors[data.current_status] || '#0B3C49',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}>
              Status: {data.current_status}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', background: 'rgba(11, 60, 73, 0.04)', padding: '14px 16px', borderRadius: '6px', marginBottom: '24px' }}>
            <div>
              <span style={{ fontSize: '0.52rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--terracotta)', fontWeight: 700 }}>Date</span>
              <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>{data.formatted_date || data.reservation.date}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.52rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--terracotta)', fontWeight: 700 }}>Time Slot</span>
              <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>{data.reservation.time_slot}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.52rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--terracotta)', fontWeight: 700 }}>Table</span>
              <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                {data.reservation.table_code ? `${data.reservation.table_code} (${data.reservation.table_zone})` : 'Cliffside Seating'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.52rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--terracotta)', fontWeight: 700 }}>Occasion</span>
              <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>{data.reservation.occasion}</div>
            </div>
          </div>

          {/* Lifecycle Timeline */}
          <div style={{ margin: '20px 0' }}>
            <h4 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#555', marginBottom: '14px' }}>
              Reservation Lifecycle Timeline
            </h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              {data.timeline?.map((step, idx) => (
                <div
                  key={step.key}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '12px 14px',
                    borderRadius: '6px',
                    background: step.active ? '#FFFDF5' : step.done ? 'rgba(25, 111, 61, 0.06)' : '#FFFFFF',
                    border: step.active ? '1.5px solid var(--terracotta)' : step.done ? '1px solid rgba(25, 111, 61, 0.25)' : '1px solid rgba(0,0,0,0.08)',
                  }}
                >
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    flexShrink: 0,
                    background: step.done ? (step.active ? 'var(--terracotta)' : '#196F3D') : '#E0E0E0',
                    color: step.done ? '#FFFFFF' : '#888',
                  }}>
                    {step.done ? (step.active ? '★' : '✓') : idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.84rem', color: step.done ? 'var(--ink)' : '#777' }}>
                        {step.label}
                      </strong>
                      {step.active && (
                        <span style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--terracotta)', letterSpacing: '0.1em' }}>
                          Current Stage
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#666', lineHeight: 1.4 }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.74rem', color: '#666', margin: '0 0 10px' }}>
              Need to modify or add guests? Chat directly with our manager on WhatsApp:
            </p>
            <a
              href={`https://wa.me/916369403544?text=${encodeURIComponent(`Hello God's Own Country Kitchen, enquiry regarding my booking ID: ${data.reservation.booking_id}`)}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                background: '#25D366',
                color: '#FFFFFF',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <span>Chat on WhatsApp</span>
              <ArrowIcon />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
