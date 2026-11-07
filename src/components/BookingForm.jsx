import { useEffect, useState } from 'react'
import { siteConfig } from '../data/siteConfig'
import { ArrowIcon, Button } from './UI'
import { createReservation, getTables, getReservationSlots } from '../lib/api'
import TrackReservation from './TrackReservation'

const toIsoDate = (d) => d.toISOString().slice(0, 10)
const todayIso = () => toIsoDate(new Date())

export const formatDateDisplay = (dateString) => {
  if (!dateString) return 'Flexible'
  const [year, month, day] = dateString.split('-').map(Number)
  const d = new Date(Date.UTC(year, month - 1, day))
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

const defaultReservation = {
  name: '',
  phone: '',
  people: '2 people',
  date: todayIso(),
  timeSlot: 'Sunset & Golden Hour (5:00 PM – 7:00 PM)',
  tableId: '',
  occasion: 'Casual dining',
  notes: '',
}

export default function BookingForm({ reservationIntent }) {
  const [form, setForm] = useState(defaultReservation)
  const [submitted, setSubmitted] = useState(false)
  const [submittedBookingId, setSubmittedBookingId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [tables, setTables] = useState([])
  const [slotInfo, setSlotInfo] = useState(null)
  const [showTrackerModal, setShowTrackerModal] = useState(false)

  const today = todayIso()

  // Pre-fill from intent
  useEffect(() => {
    if (reservationIntent) {
      setForm((prev) => ({ ...prev, ...reservationIntent }))
      setSubmitted(false)
      setError('')
    }
  }, [reservationIntent])

  // Fetch real tables and slot availability whenever date or timeSlot changes
  useEffect(() => {
    let active = true

    if (form.date && form.timeSlot) {
      getTables(form.date, form.timeSlot)
        .then((res) => {
          if (active && res?.tables) {
            setTables(res.tables)
          }
        })
        .catch(() => {
          // Fallback if API is offline
        })

      getReservationSlots(form.date)
        .then((res) => {
          if (active && res?.slots) {
            const currentSlot = res.slots.find((s) => s.time_slot === form.timeSlot)
            setSlotInfo(currentSlot || null)
          }
        })
        .catch(() => {
          // Fallback if API is offline
        })
    }

    return () => {
      active = false
    }
  }, [form.date, form.timeSlot])

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  const submit = async (event) => {
    event.preventDefault()
    const clean = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      people: form.people,
      date: form.date,
      timeSlot: form.timeSlot,
      table_id: form.tableId || null,
      occasion: form.occasion,
      notes: form.notes.trim(),
    }

    if (!clean.name) {
      return setError('Please enter your name.')
    }
    const phoneDigits = clean.phone.replace(/\D/g, '')
    if (!clean.phone || phoneDigits.length < 10) {
      return setError('Please enter a valid phone number (at least 10 digits).')
    }
    if (clean.date && clean.date < today) {
      return setError('Please choose a reservation date from today onwards.')
    }

    setError('')
    setLoading(true)

    try {
      // 1. Save in database first
      const res = await createReservation(clean)
      const bookingId = res.booking_id || ''

      setSubmitted(true)
      setSubmittedBookingId(bookingId)

      // 2. Open WhatsApp confirmation deep-link
      if (res.whatsapp_url) {
        window.open(res.whatsapp_url, '_blank')
      } else {
        // Fallback WhatsApp message
        const formattedDate = formatDateDisplay(clean.date)
        const lines = [
          `Table Reservation Enquiry · ${siteConfig.brand.name}`,
          bookingId ? `Booking ID: ${bookingId}` : null,
          `Name: ${clean.name}`,
          `Phone: ${clean.phone}`,
          `Number of people: ${clean.people}`,
          `Date: ${formattedDate}`,
          `Time slot: ${clean.timeSlot}`,
          clean.table_id ? `Table: ${clean.table_id}` : null,
          clean.occasion ? `Occasion: ${clean.occasion}` : null,
          clean.notes ? `Notes: ${clean.notes}` : null,
        ].filter(Boolean)
        const message = lines.join('\n')
        const whatsappUrl = `https://wa.me/${siteConfig.brand.whatsapp}?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank')
      }
    } catch (err) {
      setError(err.message || 'Unable to record reservation. Please check your details and try again.')
    } finally {
      setLoading(false)
    }
  }

  const reservationCfg = siteConfig.reservation || {
    title: 'Reserve a Table by the Sea',
    eyebrow: 'Table Reservation',
    description: 'Book your table for lunch, golden hour sunset, or an evening of live music on North Cliff.',
    timeSlots: ['Lunch (12:30 PM – 3:30 PM)', 'Sunset & Golden Hour (5:00 PM – 7:00 PM)', 'Dinner & Live Music (7:00 PM – 10:30 PM)', 'Other / Flexible'],
    occasions: ['Casual dining', 'Sunset drinks & dinner', 'Live music evening', 'Birthday celebration', 'Anniversary', 'Group / Family feast'],
    guestOptions: ['1 person', '2 people', '3 people', '4 people', '5–8 people', '9+ group'],
  }

  const isSunsetSlot = form.timeSlot.includes('Sunset')

  return (
    <div className="booking-card" id="reservation">
      <div className="booking-card__intro">
        <p className="eyebrow">{reservationCfg.eyebrow}</p>
        <h3>{reservationCfg.title}</h3>
        <p>{reservationCfg.description}</p>
        <div className="booking-card__notes">
          <span>☼ Outdoor seating & Arabian Sea views</span>
          <span>♪ Live music every evening</span>
          <span>🌿 Vegetarian options available</span>
        </div>
      </div>

      <form className="booking-form" onSubmit={submit} noValidate>
        <div className="form-row">
          <label className="floating-field">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder=" "
              required
              aria-label="Your full name"
            />
            <span>Your name *</span>
          </label>
          <label className="floating-field">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
              placeholder=" "
              required
              aria-label="Phone number with country code"
            />
            <span>Phone number *</span>
          </label>
        </div>

        <div className="form-row">
          <label className="floating-field">
            <input
              type="date"
              min={today}
              value={form.date}
              onChange={(e) => setField('date', e.target.value)}
              placeholder=" "
              required
              aria-label="Reservation date"
            />
            <span>Date *</span>
          </label>
          <label className="floating-field">
            <select
              value={form.people}
              onChange={(e) => setField('people', e.target.value)}
              aria-label="Number of people"
            >
              {reservationCfg.guestOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span>Number of people</span>
          </label>
        </div>

        <div className="form-row">
          <label className="floating-field">
            <select
              value={form.timeSlot}
              onChange={(e) => setField('timeSlot', e.target.value)}
              aria-label="Preferred time slot"
            >
              {reservationCfg.timeSlots.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
            <span>Time slot</span>
          </label>
          <label className="floating-field">
            <select
              value={form.occasion}
              onChange={(e) => setField('occasion', e.target.value)}
              aria-label="Occasion"
            >
              {reservationCfg.occasions.map((occ) => (
                <option key={occ} value={occ}>{occ}</option>
              ))}
            </select>
            <span>Occasion (optional)</span>
          </label>
        </div>

        <div className="form-row">
          <label className="floating-field" style={{ gridColumn: '1 / -1' }}>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              placeholder=" "
              maxLength={300}
              aria-label="Special requests or dietary notes"
            />
            <span>Special requests / Dietary notes</span>
          </label>
        </div>

        {/* Sunset Table Map & Cliffside Table Picker */}
        <div className="table-map-section" style={{
          margin: '18px 0 24px',
          padding: '16px 20px',
          background: 'rgba(11, 60, 73, 0.04)',
          border: isSunsetSlot ? '1.5px solid var(--terracotta, #B5502B)' : '1px dashed rgba(11, 60, 73, 0.2)',
          borderRadius: '6px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--terracotta, #B5502B)' }}>
                {isSunsetSlot ? '🌅 Cliff-Edge Sunset Seating Map' : 'Cliffside Seating Selection'}
              </span>
              <h4 style={{ margin: '2px 0 0', fontSize: '0.92rem', fontWeight: 600 }}>
                Choose Your Specific Table (Optional)
              </h4>
            </div>
            {isSunsetSlot && (
              <span style={{
                padding: '4px 10px',
                background: 'rgba(181, 80, 43, 0.15)',
                color: 'var(--terracotta, #B5502B)',
                borderRadius: '999px',
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
              }}>
                ⚡ Sunset tables sell out first · {slotInfo ? `${slotInfo.remaining_cliff_tables ?? 6} cliff tables left` : 'High Demand'}
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setField('tableId', '')}
              style={{
                padding: '10px 12px',
                textAlign: 'left',
                border: form.tableId === '' ? '2px solid var(--ink, #0B3C49)' : '1px solid rgba(0,0,0,0.12)',
                background: form.tableId === '' ? 'var(--ink, #0B3C49)' : '#FFFFFF',
                color: form.tableId === '' ? '#FFFFFF' : 'inherit',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.74rem',
                transition: 'all .2s ease',
              }}
            >
              <strong>Any Table</strong>
              <div style={{ fontSize: '0.62rem', opacity: 0.8 }}>Best available sea view</div>
            </button>

            {tables.map((t) => {
              const isSelected = form.tableId === t.code || form.tableId === t.id
              const isBooked = !t.is_available
              const isCliff = t.zone === 'cliff-edge'

              return (
                <button
                  key={t.code}
                  type="button"
                  disabled={isBooked}
                  onClick={() => setField('tableId', t.code)}
                  title={isBooked ? `Table ${t.code} is already reserved for this slot` : t.description}
                  style={{
                    padding: '8px 10px',
                    textAlign: 'left',
                    borderRadius: '4px',
                    border: isSelected
                      ? '2px solid var(--terracotta, #B5502B)'
                      : isBooked
                      ? '1px solid #E0E0E0'
                      : isCliff
                      ? '1px solid rgba(181, 80, 43, 0.35)'
                      : '1px solid rgba(11, 60, 73, 0.2)',
                    background: isSelected
                      ? 'var(--terracotta, #B5502B)'
                      : isBooked
                      ? '#F2F2F2'
                      : isCliff
                      ? '#FFFDF9'
                      : '#FFFFFF',
                    color: isSelected
                      ? '#FFFFFF'
                      : isBooked
                      ? '#A0A0A0'
                      : 'inherit',
                    cursor: isBooked ? 'not-allowed' : 'pointer',
                    opacity: isBooked ? 0.6 : 1,
                    position: 'relative',
                    transition: 'all .2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{t.code}</strong>
                    <span style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      {isBooked ? 'Reserved' : `${t.seats}s`}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.6rem', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isCliff ? '🌊 Cliff-Edge' : t.zone === 'family' ? '🌴 Family' : '🕯 Verandah'}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="booking-form__footer">
          <button type="submit" className="button button--primary" disabled={loading}>
            <span>{loading ? 'Securing Table...' : 'Confirm on WhatsApp'}</span>
            <ArrowIcon />
          </button>

          {submitted && (
            <div style={{
              width: '100%',
              marginTop: '16px',
              padding: '16px 20px',
              background: '#EAFAF1',
              border: '1.5px solid #196F3D',
              borderRadius: '6px',
              color: '#0B3C49',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#196F3D' }}>
                  ✓ Reservation Saved to Database!
                </span>
                {submittedBookingId && (
                  <span style={{
                    padding: '4px 12px',
                    background: 'var(--terracotta, #B5502B)',
                    color: '#FFFFFF',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                  }}>
                    Booking ID: {submittedBookingId}
                  </span>
                )}
              </div>
              <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: '#333' }}>
                WhatsApp opened! Send the pre-filled reservation message to finalize your table confirmation with our North Cliff host.
              </p>
              {submittedBookingId && (
                <button
                  type="button"
                  onClick={() => setShowTrackerModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 18px',
                    background: 'var(--ink, #0B3C49)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  <span>Track your reservation ({submittedBookingId})</span>
                  <ArrowIcon />
                </button>
              )}
            </div>
          )}

          {error && <p className="form-error" role="alert">{error}</p>}
        </div>
      </form>

      {/* Floating Modal for Reservation Tracking */}
      {showTrackerModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11, 60, 73, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <TrackReservation
            initialBookingId={submittedBookingId}
            onClose={() => setShowTrackerModal(false)}
          />
        </div>
      )}
    </div>
  )
}
