import os
from datetime import date
from werkzeug.security import generate_password_hash

from models import db, Table, LiveMusicDay, Review, CatchOfTheDay, Admin


def seed_database():
    """Seed initial data for tables, live music, reviews, catch of the day, and admin account."""

    # 1. Seed Admin User
    admin_email = os.getenv('ADMIN_EMAIL', 'admin@godsowncountrykitchen.com').strip().lower()
    admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')

    existing_admin = Admin.query.filter_by(email=admin_email).first()
    if not existing_admin:
        admin = Admin(
            email=admin_email,
            password_hash=generate_password_hash(admin_password),
            role='admin'
        )
        db.session.add(admin)
        print(f"[*] Seeded Admin: {admin_email}")
    else:
        # Reset password to ensure test credentials work reliably
        existing_admin.password_hash = generate_password_hash(admin_password)
        existing_admin.failed_attempts = 0
        existing_admin.locked_until = None
        print(f"[*] Reset Admin password: {admin_email}")

    # 2. Seed Tables (10 total: C1-C6 cliff-edge, F1-F2 family, I1-I2 indoor)
    initial_tables = [
        {'code': 'C1', 'zone': 'cliff-edge', 'seats': 2, 'description': 'Cliff-Edge Sea View 1 (2 seats · Front row sunset)'},
        {'code': 'C2', 'zone': 'cliff-edge', 'seats': 2, 'description': 'Cliff-Edge Sea View 2 (2 seats · Front row sunset)'},
        {'code': 'C3', 'zone': 'cliff-edge', 'seats': 4, 'description': 'Cliff-Edge Sunset Front 3 (4 seats · Prime ocean horizon)'},
        {'code': 'C4', 'zone': 'cliff-edge', 'seats': 4, 'description': 'Cliff-Edge Sunset Front 4 (4 seats · Prime ocean horizon)'},
        {'code': 'C5', 'zone': 'cliff-edge', 'seats': 4, 'description': 'Cliff-Edge Panoramic 5 (4 seats · Lantern light view)'},
        {'code': 'C6', 'zone': 'cliff-edge', 'seats': 4, 'description': 'Cliff-Edge Panoramic 6 (4 seats · Lantern light view)'},
        {'code': 'F1', 'zone': 'family', 'seats': 6, 'description': 'Helipad Ocean Breeze Family 1 (6 seats · Group seating)'},
        {'code': 'F2', 'zone': 'family', 'seats': 8, 'description': 'Coastal Garden Feast 2 (8 seats · Group & celebration)'},
        {'code': 'I1', 'zone': 'indoor', 'seats': 2, 'description': 'Verandah Lantern Table 1 (2 seats · Shaded & cosy)'},
        {'code': 'I2', 'zone': 'indoor', 'seats': 2, 'description': 'Indoor Acoustic Corner 2 (2 seats · Intimate dining)'},
    ]

    for t_data in initial_tables:
        existing = Table.query.filter_by(code=t_data['code']).first()
        if not existing:
            t = Table(**t_data)
            db.session.add(t)
    print(f"[*] Seeded {len(initial_tables)} restaurant tables (C1-C6, F1-F2, I1-I2).")

    # 3. Seed 7 Days of Live Music
    initial_music = [
        {
            'day_index': 1,
            'day_name': 'Monday',
            'genre': 'Acoustic Sunset',
            'artist': 'Artist lineup: to be confirmed',
            'time': 'Evening · Times: to be confirmed',
            'description': 'Gentle acoustic guitar and slow coastal melodies as the sun sinks into the Arabian Sea.',
            'is_tonight_highlight': False
        },
        {
            'day_index': 2,
            'day_name': 'Tuesday',
            'genre': 'Coastal Folk & Strings',
            'artist': 'Artist lineup: to be confirmed',
            'time': 'Evening · Times: to be confirmed',
            'description': 'Soulful string acoustic sets blending regional rhythms and international classics.',
            'is_tonight_highlight': False
        },
        {
            'day_index': 3,
            'day_name': 'Wednesday',
            'genre': 'Seaside Blues',
            'artist': 'Artist lineup: to be confirmed',
            'time': 'Evening · Times: to be confirmed',
            'description': 'Warm blues and acoustic rock ballads under the North Cliff lantern lights.',
            'is_tonight_highlight': False
        },
        {
            'day_index': 4,
            'day_name': 'Thursday',
            'genre': 'Indie & Unplugged',
            'artist': 'Artist lineup: to be confirmed',
            'time': 'Evening · Times: to be confirmed',
            'description': 'Intimate unplugged sessions celebrating vocal harmonies and indie favourites.',
            'is_tonight_highlight': False
        },
        {
            'day_index': 5,
            'day_name': 'Friday',
            'genre': 'Kerala Fusion & Rhythms',
            'artist': 'Artist lineup: to be confirmed',
            'time': 'Evening · Times: to be confirmed',
            'description': 'Vibrant percussion and acoustic arrangements to kick off the coastal weekend.',
            'is_tonight_highlight': False
        },
        {
            'day_index': 6,
            'day_name': 'Saturday',
            'genre': 'Weekend Live Showcase',
            'artist': 'Artist lineup: to be confirmed',
            'time': 'Evening · Times: to be confirmed',
            'description': 'Our headline weekend session with full acoustic ensemble overlooking the illuminated shoreline.',
            'is_tonight_highlight': False
        },
        {
            'day_index': 0,
            'day_name': 'Sunday',
            'genre': 'Sundowner Jam',
            'artist': 'Artist lineup: to be confirmed',
            'time': 'Sunset & Evening · Times: to be confirmed',
            'description': 'Relaxed golden hour acoustic jam session wrapping up the week with chilled seaside vibes.',
            'is_tonight_highlight': False
        },
    ]

    for m_data in initial_music:
        existing = LiveMusicDay.query.filter_by(day_index=m_data['day_index']).first()
        if not existing:
            m = LiveMusicDay(**m_data)
            db.session.add(m)
    print("[*] Seeded 7 days of live music lineup.")

    # 4. Seed Reviews (The 3 existing quoted reviews)
    initial_reviews = [
        {
            'author': 'Rahul S.',
            'quote': 'The fresh grilled fish with Kerala masala right next to the cliff edge was unforgettable. Live acoustic guitar at sunset made the evening pure magic.',
            'source': 'Google review',
            'rating': 5,
            'status': 'approved'
        },
        {
            'author': 'Emily T.',
            'quote': 'Incredible vegetarian options alongside the seafood! The appams and coconut stew were delicious, and the outdoor sea view is second to none.',
            'source': 'Google review',
            'rating': 5,
            'status': 'approved'
        },
        {
            'author': 'Anand & Divya M.',
            'quote': 'Great vibe on North Cliff near the Helipad. Wonderful live music, attentive team, and watching the sunset with fresh tender coconut water was bliss.',
            'source': 'Google review',
            'rating': 5,
            'status': 'approved'
        },
    ]

    for r_data in initial_reviews:
        existing = Review.query.filter_by(author=r_data['author']).first()
        if not existing:
            r = Review(**r_data)
            db.session.add(r)
    print(f"[*] Seeded {len(initial_reviews)} approved reviews.")

    # 5. Seed Catch of the Day
    existing_catch = CatchOfTheDay.query.first()
    if not existing_catch:
        catch = CatchOfTheDay(
            dish_id='catch-of-the-day',
            dish_name='Fresh Catch of the Day',
            note='Landed fresh this morning by Varkala coast fishermen',
            date=date.today().isoformat(),
            is_active=True
        )
        db.session.add(catch)
        print("[*] Seeded Catch of the Day.")

    db.session.commit()
    print("[✓] Database seeding complete.")


if __name__ == '__main__':
    from app import create_app
    app = create_app()
    with app.app_context():
        seed_database()
