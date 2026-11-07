import { useState, useEffect } from 'react'
import {
  adminLogin,
  adminLogout,
  adminGetMe,
  getAdminStats,
  getAllReservations,
  updateReservationStatus,
  getLiveMusicLineup,
  updateLiveMusicDay,
  getAllReviews,
  updateReviewStatus,
  getCatchOfTheDay,
  setCatchOfTheDay,
  getTables,
} from '../lib/api'
import { siteConfig } from '../data/siteConfig'
import { ArrowIcon, Button } from './UI'

const toIsoDate = (d) => d.toISOString().slice(0, 10)
const todayIso = () => toIsoDate(new Date())

export default function AdminDashboard({ onBackToSite }) {
  // Auth state
  const [admin, setAdmin] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loginEmail, setLoginEmail] = useState('admin@godsowncountrykitchen.com')
  const [loginPassword, setLoginPassword] = useState('admin123')
  const [loginError, setLoginError] = useState('')

  // Dashboard active view
  const [activeTab, setActiveTab] = useState('reservations') // reservations, music, reviews, catch, tables
  const [selectedDate, setSelectedDate] = useState(todayIso())

  // Data states
  const [stats, setStats] = useState(null)
  const [reservations, setReservations] = useState([])
  const [resStatusFilter, setResStatusFilter] = useState('all')
  const [resSearch, setResSearch] = useState('')
  const [musicDays, setMusicDays] = useState([])
  const [editingDay, setEditingDay] = useState(null)
  const [reviewsList, setReviewsList] = useState([])
  const [reviewFilter, setReviewFilter] = useState('all')
  const [catchOfDay, setCatchOfDayState] = useState(null)
  const [selectedDishId, setSelectedDishId] = useState('karimeen-pollichathu')
  const [catchNote, setCatchNote] = useState('Fresh catch landed this morning by Varkala coast fishermen')
  const [tablesList, setTablesList] = useState([])
  const [tableSlot, setTableSlot] = useState('Sunset & Golden Hour (5:00 PM – 7:00 PM)')

  // Notification message
  const [toast, setToast] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  // 1. Check session on mount
  useEffect(() => {
    adminGetMe()
      .then((res) => {
        if (res?.authenticated && res?.admin) {
          setAdmin(res.admin)
        }
      })
      .catch(() => {
        setAdmin(null)
      })
      .finally(() => {
        setAuthLoading(false)
      })
  }, [])

  // 2. Load dashboard data when authenticated
  const loadStats = () => {
    getAdminStats(selectedDate)
      .then(setStats)
      .catch(() => {})
  }

  const loadReservations = () => {
    getAllReservations({
      date: selectedDate,
      status: resStatusFilter,
      search: resSearch,
    })
      .then((res) => setReservations(res?.reservations || []))
      .catch(() => {})
  }

  const loadMusic = () => {
    getLiveMusicLineup()
      .then((res) => {
        const days = res?.days || []
        setMusicDays(days)
        if (days.length > 0 && !editingDay) {
          setEditingDay(days[0])
        }
      })
      .catch(() => {})
  }

  const loadReviews = () => {
    getAllReviews(reviewFilter === 'all' ? '' : reviewFilter)
      .then((res) => setReviewsList(res?.reviews || []))
      .catch(() => {})
  }

  const loadCatch = () => {
    getCatchOfTheDay()
      .then((data) => {
        if (data) {
          setCatchOfDayState(data)
          if (data.dish_id) setSelectedDishId(data.dish_id)
          if (data.note) setCatchNote(data.note)
        }
      })
      .catch(() => {})
  }

  const loadTables = () => {
    getTables(selectedDate, tableSlot)
      .then((res) => setTablesList(res?.tables || []))
      .catch(() => {})
  }

  useEffect(() => {
    if (admin) {
      loadStats()
      loadReservations()
      loadMusic()
      loadReviews()
      loadCatch()
      loadTables()
    }
  }, [admin, selectedDate, resStatusFilter, resSearch, reviewFilter, tableSlot])

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await adminLogin(loginEmail, loginPassword)
      if (res?.admin) {
        setAdmin(res.admin)
      }
    } catch (err) {
      setLoginError(err.message || 'Login failed')
    }
  }

  // Logout Handler
  const handleLogout = async () => {
    await adminLogout().catch(() => {})
    setAdmin(null)
  }

  // Update Reservation Status
  const handleStatusChange = async (resId, newStatus) => {
    try {
      await updateReservationStatus(resId, newStatus)
      showToast(`Reservation status updated to ${newStatus}`)
      loadReservations()
      loadStats()
      loadTables()
    } catch (err) {
      alert(`Error updating status: ${err.message}`)
    }
  }

  // Save Music Day
  const handleSaveMusic = async (e) => {
    e.preventDefault()
    if (!editingDay) return
    try {
      await updateLiveMusicDay(editingDay.day_index, {
        artist: editingDay.artist,
        time: editingDay.time,
        genre: editingDay.genre,
        description: editingDay.description,
      })
      showToast(`Saved live music for ${editingDay.day_name}`)
      loadMusic()
      loadStats()
    } catch (err) {
      alert(`Error saving music: ${err.message}`)
    }
  }

  // Review Status
  const handleReviewStatus = async (reviewId, newStatus) => {
    try {
      await updateReviewStatus(reviewId, newStatus)
      showToast(`Review marked as ${newStatus}`)
      loadReviews()
      loadStats()
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  // Save Catch of the Day
  const handleSaveCatch = async (e) => {
    e.preventDefault()
    const allDishes = siteConfig.menu?.items || []
    const dishObj = allDishes.find((d) => d.id === selectedDishId)
    try {
      await setCatchOfTheDay({
        dish_id: selectedDishId,
        dish_name: dishObj?.name || selectedDishId,
        note: catchNote,
      })
      showToast(`Catch of the Day updated to "${dishObj?.name || selectedDishId}"`)
      loadCatch()
      loadStats()
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B3C49', color: '#FAF6EE' }}>
        <p>Loading Admin Portal...</p>
      </div>
    )
  }

  // -------------------------------------------------------------
  // Login Screen
  // -------------------------------------------------------------
  if (!admin) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0B3C49 0%, #061e25 100%)',
        color: '#FAF6EE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'var(--font-sans, sans-serif)',
      }}>
        <div style={{
          background: '#FFFFFF',
          color: '#0B3C49',
          borderRadius: '8px',
          padding: 'clamp(28px, 5vw, 44px)',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#B5502B', fontWeight: 700 }}>
              Management Portal
            </span>
            <h2 style={{ margin: '6px 0', fontFamily: 'var(--display, serif)', fontSize: '1.6rem', fontWeight: 500 }}>
              Staff & Admin Login
            </h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
              God's Own Country Kitchen · Varkala
            </p>
          </div>

          {loginError && (
            <div style={{ padding: '10px 14px', background: '#FADBD8', color: '#922B21', borderRadius: '4px', fontSize: '0.78rem', marginBottom: '18px' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #ccc', borderRadius: '4px', fontSize: '0.86rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #ccc', borderRadius: '4px', fontSize: '0.86rem', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              className="button button--primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
            >
              <span>Sign In to Admin Portal</span>
              <ArrowIcon />
            </button>
          </form>

          <div style={{ marginTop: '20px', padding: '12px', background: '#FFFDF9', border: '1px dashed #DDD', borderRadius: '4px', fontSize: '0.72rem', color: '#555' }}>
            <strong>Default Seed Admin Credentials:</strong><br />
            Email: <code>admin@godsowncountrykitchen.com</code><br />
            Password: <code>admin123</code>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={onBackToSite}
              style={{ background: 'none', border: 'none', color: '#0B3C49', fontSize: '0.78rem', textDecoration: 'underline', cursor: 'pointer' }}
            >
              ← Back to Restaurant Website
            </button>
          </div>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------
  // Main Authenticated Dashboard
  // -------------------------------------------------------------
  const allDishes = siteConfig.menu?.items || []

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F6F3EC',
      color: '#0B3C49',
      fontFamily: 'var(--font-sans, sans-serif)',
    }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0B3C49',
          color: '#FAF6EE',
          padding: '12px 22px',
          borderRadius: '999px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          zIndex: 10000,
          fontSize: '0.82rem',
          fontWeight: 600,
        }}>
          ✓ {toast}
        </div>
      )}

      {/* Top Navbar */}
      <header style={{
        background: '#0B3C49',
        color: '#FAF6EE',
        padding: '16px clamp(20px, 4vw, 40px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: 'var(--display, serif)', fontSize: '1.25rem', fontWeight: 500 }}>
              God's Own Country Kitchen
            </h1>
            <span style={{ fontSize: '0.65rem', color: '#7FC8C0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Staff & Admin Portal · North Cliff, Varkala
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.74rem', background: 'rgba(255,255,255,0.12)', padding: '5px 12px', borderRadius: '999px' }}>
            👤 {admin.email} ({admin.role})
          </span>
          <button
            type="button"
            onClick={onBackToSite}
            style={{
              padding: '6px 14px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.4)',
              color: '#FFFFFF',
              borderRadius: '4px',
              fontSize: '0.72rem',
              cursor: 'pointer',
            }}
          >
            ← View Site
          </button>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: '6px 14px',
              background: '#B5502B',
              border: 'none',
              color: '#FFFFFF',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Content Container */}
      <main style={{ maxWidth: '1360px', margin: '0 auto', padding: '24px clamp(16px, 3vw, 32px)' }}>
        {/* Date Filter & Quick Stats Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: '1.4rem', fontWeight: 600 }}>
              Today's Overview
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#666' }}>
              Real-time reservations and operational stats calculated from the database
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.82rem' }}
            />
          </div>
        </div>

        {/* 5 Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#666' }}>
              Total Bookings ({selectedDate})
            </span>
            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#0B3C49', marginTop: '4px' }}>
              {stats?.today_reservation_count ?? 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#196F3D', fontWeight: 600, marginTop: '4px' }}>
              ✓ {stats?.today_confirmed_count ?? 0} Confirmed / Seated
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B5502B' }}>
              🌅 Sunset Slot Occupancy
            </span>
            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#B5502B', marginTop: '4px' }}>
              {stats?.sunset_occupancy_percentage ?? 0}%
            </div>
            <div style={{ fontSize: '0.72rem', color: '#666', marginTop: '4px' }}>
              {stats?.sunset_booked_count ?? 0} of {stats?.total_tables ?? 10} tables booked
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#666' }}>
              Tonight's Live Music
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0B3C49', marginTop: '8px', lineHeight: 1.2 }}>
              {stats?.tonight_live_music?.artist || 'To be confirmed'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#666', marginTop: '4px' }}>
              {stats?.tonight_live_music?.genre} · {stats?.tonight_live_music?.time}
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#666' }}>
              Catch of the Day
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0B3C49', marginTop: '8px', lineHeight: 1.2 }}>
              {stats?.catch_of_the_day?.dish_name || 'Fresh Catch of the Day'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#B5502B', marginTop: '4px', fontStyle: 'italic' }}>
              {stats?.catch_of_the_day?.note || 'Landed this morning'}
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#666' }}>
              Customer Reviews
            </span>
            <div style={{ fontSize: '2.2rem', fontWeight: 700, color: stats?.pending_reviews_count ? '#B5502B' : '#0B3C49', marginTop: '4px' }}>
              {stats?.pending_reviews_count ?? 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#666', marginTop: '4px' }}>
              {stats?.pending_reviews_count ? '⚠ Pending moderation' : 'All reviews reviewed'}
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid rgba(11, 60, 73, 0.1)', paddingBottom: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { id: 'reservations', label: `Reservations (${reservations.length})` },
            { id: 'tables', label: 'Sunset Table Map' },
            { id: 'music', label: 'Tonight Live Music' },
            { id: 'catch', label: 'Catch of the Day' },
            { id: 'reviews', label: `Reviews (${reviewsList.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === tab.id ? '#0B3C49' : '#FFFFFF',
                color: activeTab === tab.id ? '#FFFFFF' : '#0B3C49',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(11,60,73,0.2)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: RESERVATIONS */}
        {activeTab === 'reservations' && (
          <div style={{ background: '#FFFFFF', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['all', 'enquiry', 'confirmed', 'seated', 'completed', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setResStatusFilter(st)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '999px',
                      border: '1px solid #ccc',
                      background: resStatusFilter === st ? '#B5502B' : '#FFF',
                      color: resStatusFilter === st ? '#FFF' : '#333',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={resSearch}
                onChange={(e) => setResSearch(e.target.value)}
                placeholder="Search name, phone, booking ID..."
                style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.78rem', minWidth: '220px' }}
              />
            </div>

            {reservations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888', fontSize: '0.85rem' }}>
                No reservations found for {selectedDate} ({resStatusFilter}).
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(11, 60, 73, 0.05)', borderBottom: '2px solid rgba(11,60,73,0.1)' }}>
                      <th style={{ padding: '10px 12px' }}>Booking ID</th>
                      <th style={{ padding: '10px 12px' }}>Guest</th>
                      <th style={{ padding: '10px 12px' }}>Contact</th>
                      <th style={{ padding: '10px 12px' }}>Slot & Guests</th>
                      <th style={{ padding: '10px 12px' }}>Table</th>
                      <th style={{ padding: '10px 12px' }}>Occasion / Notes</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                      <th style={{ padding: '10px 12px' }}>Actions (Lifecycle)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #EEE' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0B3C49' }}>
                          {r.booking_id}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                          {r.name}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <a
                            href={`https://wa.me/${r.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${r.name}, God's Own Country Kitchen regarding your booking ${r.booking_id}`)}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#0E6655', textDecoration: 'none', fontWeight: 600 }}
                          >
                            💬 {r.phone}
                          </a>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div>{r.time_slot}</div>
                          <small style={{ color: '#666' }}>{r.people}</small>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {r.table_code ? (
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              background: r.table_zone === 'cliff-edge' ? 'rgba(181, 80, 43, 0.12)' : '#EAECEE',
                              color: r.table_zone === 'cliff-edge' ? '#B5502B' : '#333',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                            }}>
                              {r.table_code} ({r.table_zone})
                            </span>
                          ) : (
                            <span style={{ color: '#888' }}>Any Table</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <strong>{r.occasion}</strong>
                          {r.notes && <div style={{ color: '#666', fontStyle: 'italic', fontSize: '0.72rem' }}>"{r.notes}"</div>}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: r.status === 'confirmed' ? '#D5F5E3' : r.status === 'seated' ? '#D4E6F1' : r.status === 'completed' ? '#D4EFEA' : r.status === 'cancelled' ? '#FADBD8' : '#FCF3CF',
                            color: r.status === 'confirmed' ? '#196F3D' : r.status === 'seated' ? '#1B4F72' : r.status === 'completed' ? '#0E6655' : r.status === 'cancelled' ? '#922B21' : '#7D6608',
                          }}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {r.status === 'enquiry' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(r.id, 'confirmed')}
                                style={{ padding: '3px 8px', background: '#196F3D', color: '#FFF', border: 'none', borderRadius: '3px', fontSize: '0.68rem', cursor: 'pointer' }}
                              >
                                Confirm
                              </button>
                            )}
                            {r.status === 'confirmed' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(r.id, 'seated')}
                                style={{ padding: '3px 8px', background: '#1B4F72', color: '#FFF', border: 'none', borderRadius: '3px', fontSize: '0.68rem', cursor: 'pointer' }}
                              >
                                Seat
                              </button>
                            )}
                            {r.status === 'seated' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(r.id, 'completed')}
                                style={{ padding: '3px 8px', background: '#0E6655', color: '#FFF', border: 'none', borderRadius: '3px', fontSize: '0.68rem', cursor: 'pointer' }}
                              >
                                Complete
                              </button>
                            )}
                            {r.status !== 'cancelled' && r.status !== 'completed' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(r.id, 'cancelled')}
                                style={{ padding: '3px 6px', background: '#FFF', color: '#922B21', border: '1px solid #922B21', borderRadius: '3px', fontSize: '0.68rem', cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SUNSET TABLE MAP */}
        {activeTab === 'tables' && (
          <div style={{ background: '#FFFFFF', borderRadius: '8px', padding: '24px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 600 }}>
                  Cliffside Seating Availability Map
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#666' }}>
                  Live visual layout of all 10 tables on Varkala North Cliff overlooking the Arabian Sea
                </span>
              </div>

              <select
                value={tableSlot}
                onChange={(e) => setTableSlot(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '4px', border: '1.5px solid #0B3C49', fontSize: '0.8rem', fontWeight: 600 }}
              >
                <option value="Sunset & Golden Hour (5:00 PM – 7:00 PM)">Sunset & Golden Hour (5:00 PM – 7:00 PM)</option>
                <option value="Dinner & Live Music (7:00 PM – 10:30 PM)">Dinner & Live Music (7:00 PM – 10:30 PM)</option>
                <option value="Lunch (12:30 PM – 3:30 PM)">Lunch (12:30 PM – 3:30 PM)</option>
                <option value="Other / Flexible">Other / Flexible</option>
              </select>
            </div>

            {/* Visual Cliffside Layout Grid */}
            <div style={{ border: '1px solid #E0E0E0', borderRadius: '8px', padding: '20px', background: '#FAFAFA' }}>
              {/* Sea Edge Boundary Indicator */}
              <div style={{
                textAlign: 'center',
                padding: '8px',
                background: 'linear-gradient(90deg, #0B3C49 0%, #1B4F72 50%, #0B3C49 100%)',
                color: '#FFF',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}>
                🌊 ARABIAN SEA CLIFF-EDGE HORIZON (SUNSET PANORAMA)
              </div>

              {/* Cliff Tables C1-C6 */}
              <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#B5502B' }}>
                Cliff-Edge Tables (C1–C6) · Sunset Priority
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                {tablesList.filter((t) => t.zone === 'cliff-edge').map((t) => (
                  <div
                    key={t.code}
                    style={{
                      padding: '16px',
                      borderRadius: '6px',
                      border: t.is_available ? '1.5px solid #196F3D' : '1.5px solid #922B21',
                      background: t.is_available ? '#EAFAF1' : '#FADBD8',
                      color: '#0B3C49',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '1.2rem' }}>{t.code}</strong>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '999px',
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: t.is_available ? '#196F3D' : '#922B21',
                        color: '#FFF',
                      }}>
                        {t.is_available ? 'Available' : 'Reserved'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', marginTop: '6px' }}>{t.description}</div>
                  </div>
                ))}
              </div>

              {/* Family Tables F1-F2 */}
              <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#1B4F72' }}>
                Family & Group Seating (F1–F2)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                {tablesList.filter((t) => t.zone === 'family').map((t) => (
                  <div
                    key={t.code}
                    style={{
                      padding: '16px',
                      borderRadius: '6px',
                      border: t.is_available ? '1.5px solid #196F3D' : '1.5px solid #922B21',
                      background: t.is_available ? '#EAFAF1' : '#FADBD8',
                      color: '#0B3C49',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '1.2rem' }}>{t.code}</strong>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '999px',
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: t.is_available ? '#196F3D' : '#922B21',
                        color: '#FFF',
                      }}>
                        {t.is_available ? 'Available' : 'Reserved'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', marginTop: '6px' }}>{t.description}</div>
                  </div>
                ))}
              </div>

              {/* Indoor Tables I1-I2 */}
              <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#555' }}>
                Verandah & Indoor (I1–I2)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {tablesList.filter((t) => t.zone === 'indoor').map((t) => (
                  <div
                    key={t.code}
                    style={{
                      padding: '16px',
                      borderRadius: '6px',
                      border: t.is_available ? '1.5px solid #196F3D' : '1.5px solid #922B21',
                      background: t.is_available ? '#EAFAF1' : '#FADBD8',
                      color: '#0B3C49',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '1.2rem' }}>{t.code}</strong>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '999px',
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: t.is_available ? '#196F3D' : '#922B21',
                        color: '#FFF',
                      }}>
                        {t.is_available ? 'Available' : 'Reserved'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', marginTop: '6px' }}>{t.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TONIGHT LIVE MUSIC */}
        {activeTab === 'music' && (
          <div style={{ background: '#FFFFFF', borderRadius: '8px', padding: '24px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', fontWeight: 600 }}>
              Live Music Schedule & Tonight's Act Manager
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.8rem', color: '#666' }}>
              Update real artists, times, and acoustic performance notes from the database. Replaces 'to be confirmed' across the website.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {/* Day Selector */}
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem' }}>Select Day of the Week</h4>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {musicDays.map((d) => (
                    <button
                      key={d.day_index}
                      type="button"
                      onClick={() => setEditingDay(d)}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        borderRadius: '6px',
                        border: editingDay?.day_index === d.day_index ? '2px solid #B5502B' : '1px solid #DDD',
                        background: editingDay?.day_index === d.day_index ? '#FFF9F6' : '#FFF',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.9rem' }}>{d.day_name}</strong>
                        {d.is_today && (
                          <span style={{ fontSize: '0.62rem', background: '#B5502B', color: '#FFF', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                            TODAY ★
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '2px' }}>
                        {d.artist} · {d.time}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit Form */}
              {editingDay && (
                <form onSubmit={handleSaveMusic} style={{ background: '#FDFBF7', padding: '20px', borderRadius: '8px', border: '1px solid #EAE6DE' }}>
                  <h4 style={{ margin: '0 0 16px', fontSize: '1.05rem', color: '#0B3C49' }}>
                    Edit Music for {editingDay.day_name}
                  </h4>

                  <div style={{ display: 'grid', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                        Genre / Set Title
                      </label>
                      <input
                        type="text"
                        value={editingDay.genre}
                        onChange={(e) => setEditingDay({ ...editingDay, genre: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #CCC', borderRadius: '4px', fontSize: '0.84rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                        Artist / Ensemble Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingDay.artist}
                        onChange={(e) => setEditingDay({ ...editingDay, artist: e.target.value })}
                        placeholder="e.g. Varkala Sunset Trio (Acoustic Strings & Flute)"
                        style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #0B3C49', borderRadius: '4px', fontSize: '0.84rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                        Performance Timings *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingDay.time}
                        onChange={(e) => setEditingDay({ ...editingDay, time: e.target.value })}
                        placeholder="e.g. Sunset & Evening · 7:00 PM – 10:30 PM"
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #CCC', borderRadius: '4px', fontSize: '0.84rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={editingDay.description}
                        onChange={(e) => setEditingDay({ ...editingDay, description: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #CCC', borderRadius: '4px', fontSize: '0.84rem' }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="button button--primary"
                      style={{ justifyContent: 'center', marginTop: '10px' }}
                    >
                      <span>Save Live Music for {editingDay.day_name}</span>
                      <ArrowIcon />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CATCH OF THE DAY */}
        {activeTab === 'catch' && (
          <div style={{ background: '#FFFFFF', borderRadius: '8px', padding: '24px', maxWidth: '640px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', fontWeight: 600 }}>
              Set Today's Catch of the Day
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.8rem', color: '#666' }}>
              Highlight today's fresh sea catch on the Cliff Kitchen menu with your custom landing story note.
            </p>

            <form onSubmit={handleSaveCatch} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                  Select Dish from Real Menu Items *
                </label>
                <select
                  value={selectedDishId}
                  onChange={(e) => setSelectedDishId(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #0B3C49', borderRadius: '4px', fontSize: '0.86rem' }}
                >
                  {allDishes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                  Daily Landing Story / Chef Note *
                </label>
                <textarea
                  rows={3}
                  required
                  value={catchNote}
                  onChange={(e) => setCatchNote(e.target.value)}
                  placeholder="e.g. Pearl spot caught this morning off North Cliff, marinated in banana leaf"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #CCC', borderRadius: '4px', fontSize: '0.86rem' }}
                />
              </div>

              <button type="submit" className="button button--primary" style={{ justifyContent: 'center' }}>
                <span>Publish as Today's Catch of the Day</span>
                <ArrowIcon />
              </button>
            </form>

            {catchOfDay && (
              <div style={{ marginTop: '24px', padding: '16px', background: '#F8F9F9', border: '1px dashed #CCC', borderRadius: '6px', fontSize: '0.8rem' }}>
                <strong>Currently Active:</strong> {catchOfDay.dish_name} (ID: {catchOfDay.dish_id})<br />
                <span style={{ fontStyle: 'italic', color: '#B5502B' }}>"{catchOfDay.note}"</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: REVIEWS MODERATION */}
        {activeTab === 'reviews' && (
          <div style={{ background: '#FFFFFF', borderRadius: '8px', padding: '24px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 600 }}>
                  Customer Reviews Moderation
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#666' }}>
                  Review submissions start as 'pending' and are only published to the site after admin approval.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {['all', 'pending', 'approved', 'rejected'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setReviewFilter(st)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '999px',
                      border: '1px solid #ccc',
                      background: reviewFilter === st ? '#0B3C49' : '#FFF',
                      color: reviewFilter === st ? '#FFF' : '#333',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              {reviewsList.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    padding: '16px',
                    borderRadius: '6px',
                    border: '1px solid #EAEAEA',
                    background: rev.status === 'pending' ? '#FFFDF5' : '#FFFFFF',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: '1 1 300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong>{rev.author}</strong>
                      <span style={{ color: '#E59866' }}>{'★'.repeat(rev.rating)}</span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: rev.status === 'approved' ? '#D5F5E3' : rev.status === 'pending' ? '#FCF3CF' : '#FADBD8',
                        color: rev.status === 'approved' ? '#196F3D' : rev.status === 'pending' ? '#7D6608' : '#922B21',
                      }}>
                        {rev.status}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#444' }}>"{rev.quote}"</p>
                    <small style={{ color: '#888', fontSize: '0.68rem' }}>Source: {rev.source}</small>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {rev.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleReviewStatus(rev.id, 'approved')}
                        style={{ padding: '6px 14px', background: '#196F3D', color: '#FFF', border: 'none', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Approve
                      </button>
                    )}
                    {rev.status !== 'rejected' && (
                      <button
                        type="button"
                        onClick={() => handleReviewStatus(rev.id, 'rejected')}
                        style={{ padding: '6px 14px', background: '#FFF', color: '#922B21', border: '1px solid #922B21', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
