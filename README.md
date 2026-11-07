# God's Own Country Kitchen, Varkala, Kerala

A full-stack cinematic web application for **God's Own Country Kitchen** (cliff-top Kerala seafood restaurant, North Cliff, near Helipad, Varkala, Kerala 695141. Est. 2012).

Built with **React 18 + Vite** on the frontend and **Python Flask 3.1 + Gunicorn + SQLAlchemy** on the backend, architected with the full-stack reliability of **WelfareX** (PostgreSQL in production / SQLite in development, Werkzeug password hashing, HTTP-only session cookies, and login rate limiting).

---

## Full-Stack Architecture (Like WelfareX)

- **Frontend**: React 18, Vite, GSAP + ScrollTrigger, Lenis smooth scroll, vanilla CSS.
  - Development dev server on port 3000 (`npm run dev`).
  - Production build deployed to GitHub Pages (`/GOD-S-HEAVEN/`).
- **Backend (New `backend/`)**: Python Flask 3.1 + Gunicorn + SQLAlchemy.
  - PostgreSQL in production via `DATABASE_URL`; SQLite (`backend/app.db`) in local development.
  - Centralized API layer at `src/lib/api.js` powered by `VITE_API_URL` (default `http://localhost:5000/api`).
  - Strict security with Werkzeug password hashing, HTTP-only session cookies (`SameSite=Lax`), and 5-attempt rate-limiting lockout (15 min lock).
  - Admin & Staff accounts only — customers require no registration.

---

## 3 Unique Features

1. **Sunset Table Map**:
   - Visual cliffside map embedded in the reservation form featuring all 10 tables:
     - **C1–C6**: Cliff-edge sea view tables facing the Arabian Sea (prime sunset priority).
     - **F1–F2**: Helipad breeze family & celebration tables (6–8 seats).
     - **I1–I2**: Shaded verandah & acoustic indoor tables (2 seats).
   - Real-time double-booking prevention per date and time slot.
   - Highlights the high-demand **Sunset & Golden Hour (5:00 PM – 7:00 PM)** slot with dynamic remaining table count and scarcity badge (*"Sunset tables sell out first"*).

2. **Tonight Live Music**:
   - Dynamic 7-day music lineup managed in the database and updated via the Staff & Admin Portal.
   - Replaces static "to be confirmed" placeholders with the real tonight's musical act and schedule (e.g., *"Varkala Sunset Trio (Acoustic Strings & Flute) · 7:30 PM – 10:30 PM"*).

3. **Catch of the Day**:
   - Daily fresh catch story highlighted on the Cliff Kitchen menu (e.g., Karimeen Pollichathu, Malabar Prawn Roast).
   - The owner sets the featured dish and daily fresh-catch landing note directly from the admin portal, dynamically badging the dish for visiting diners.

---

## How to Run Locally

### 1. Run Backend Server (Port 5000)

```bash
cd backend
pip install -r requirements.txt
python app.py
```
- API starts at: `http://localhost:5000`
- Automatically creates tables and seeds the database with initial tables, music lineup, and admin credentials.

### 2. Run Frontend Server (Port 3000)

```bash
# In the root project directory:
npm install
npm run dev
```
- Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Seed Admin Credentials

- **URL**: [http://localhost:3000/#admin](http://localhost:3000/#admin) (or click *"Staff & Admin Portal"* in the footer)
- **Email**: `admin@godsowncountrykitchen.com`
- **Password**: `admin123`
*(Changeable in `backend/.env` or via Admin settings)*

---

## Production Build

```bash
npm run build
```
Builds the production-ready static bundle in `dist/` with base path `/GOD-S-HEAVEN/` for GitHub Pages.
