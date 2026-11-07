# God's Own Country Kitchen — Backend API

Backend REST API for **God's Own Country Kitchen** (cliff-top Kerala seafood restaurant, North Cliff, near Helipad, Varkala, Kerala).

Built with **Python Flask 3.1 + Gunicorn + SQLAlchemy**, following the full-stack architecture of **WelfareX** (PostgreSQL in production, SQLite in development, Werkzeug password hashing, HTTP-only session cookies, and login rate limiting).

---

## Architecture & Stack (Like WelfareX)

- **Framework**: Flask 3.1 + Werkzeug
- **Database**: SQLite (`backend/app.db`) in development; PostgreSQL in production via `DATABASE_URL`
- **ORM**: Flask-SQLAlchemy 3.1
- **Auth**: Admin & Staff accounts only with Werkzeug password hashing, HTTP-only session cookies, and 5-attempt rate-limiting lockout
- **CORS**: `Flask-CORS` with cookie credential support for React frontend (`http://localhost:3000` & GitHub Pages)
- **WSGI**: Gunicorn for production deployments

---

## Unique Features

1. **Sunset Table Map**:
   - Visual cliff-edge seating map for tables C1–C6 facing the Arabian Sea, F1–F2 family tables, and I1–I2 indoor verandah tables.
   - Prevents double-booking for the same date & time slot.
   - Highlights the high-demand **Sunset & Golden Hour (5:00 PM – 7:00 PM)** slot with live remaining cliff-edge capacity.

2. **Tonight Live Music**:
   - Dynamic artist & timing management from the database.
   - Replaces static "to be confirmed" with the real tonight's musical act set by the owner.

3. **Catch of the Day**:
   - Daily fresh catch story highlighted on the Cliff Kitchen Menu (e.g. Karimeen Pollichathu, Malabar Prawn Roast).
   - Allows owner/staff to set the daily landing note directly from the admin portal.

---

## Setup & Running

### 1. Prerequisites
- Python 3.10+
- pip

### 2. Environment Configuration
Copy the example environment file:
```bash
cd backend
cp .env.example .env
```
Default configuration will run with SQLite (`app.db`) and seed the default admin account.

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run Development Server
```bash
python app.py
```
The API server starts on **`http://localhost:5000`** and automatically initializes and seeds the database.

### 5. Seed Admin Credentials
- **Email**: `admin@godsowncountrykitchen.com`
- **Password**: `admin123`
*(Changeable in `.env` or via Admin settings)*

---

## API Endpoints Summary

### Public Endpoints
- `GET  /api/health` — Health check
- `POST /api/reservations` — Book table & generate booking ID + WhatsApp deep-link
- `GET  /api/reservations/slots?date=YYYY-MM-DD` — Time slots with remaining tables & sunset scarcity
- `GET  /api/reservations/track/:booking_id` — Customer reservation tracking timeline
- `GET  /api/tables?date=YYYY-MM-DD&slot=...` — Visual table availability
- `GET  /api/live-music` — 7-day music lineup from DB
- `GET  /api/live-music/today` — Tonight's live artist & schedule
- `GET  /api/reviews` — Approved customer reviews
- `POST /api/reviews` — Submit a review (saved as `pending`)
- `GET  /api/admin/catch-of-day` — Today's fresh catch highlight

### Staff / Admin Endpoints (Session Required)
- `POST  /api/admin/login` — Rate-limited admin login (5 attempts = 15 min lock)
- `POST  /api/admin/logout` — Clear session
- `GET   /api/admin/me` — Verify session
- `GET   /api/admin/stats` — Real-time stats (reservations, sunset occupancy %, tonight live, pending reviews)
- `GET   /api/reservations` — View all reservations with date/status filters
- `PATCH /api/reservations/:id/status` — Lifecycle update (`enquiry` → `confirmed` → `seated` → `completed` / `cancelled`)
- `PUT   /api/live-music/:day_index` — Update weekly music schedule & artists
- `GET   /api/reviews/all` — View all reviews (including pending)
- `PATCH /api/reviews/:id/status` — Approve or reject review
- `PUT   /api/admin/catch-of-day` — Set today's fresh catch & notes
