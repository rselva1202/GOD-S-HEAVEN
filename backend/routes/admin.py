from datetime import datetime, date
from flask import Blueprint, request, jsonify

from models import (
    db,
    Reservation,
    Table,
    LiveMusicDay,
    Review,
    CatchOfTheDay,
    VALID_TIME_SLOTS,
    VALID_OCCASIONS
)
from auth import login_required
from routes.live_music import get_current_day_index

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/admin/stats', methods=['GET'])
@login_required
def get_admin_stats():
    today_str = date.today().isoformat()
    requested_date = request.args.get('date', '').strip() or today_str

    # 1. Total and Confirmed reservations for the date
    date_reservations = Reservation.query.filter_by(date=requested_date).all()
    active_reservations = [r for r in date_reservations if r.status not in ['cancelled', 'no_show']]

    today_total = len(active_reservations)
    today_confirmed = sum(1 for r in active_reservations if r.status in ['confirmed', 'seated', 'completed'])

    # 2. Sunset slot occupancy %
    sunset_slot_name = 'Sunset & Golden Hour (5:00 PM – 7:00 PM)'
    sunset_reservations = [r for r in active_reservations if r.time_slot == sunset_slot_name]

    total_tables_count = Table.query.count() or 10
    cliff_tables_count = Table.query.filter_by(zone='cliff-edge').count() or 6

    sunset_occupancy_pct = min(100.0, round((len(sunset_reservations) / float(total_tables_count)) * 100, 1))

    # 3. Reservations grouped by time slot
    by_time_slot = {}
    for slot in VALID_TIME_SLOTS:
        count = sum(1 for r in active_reservations if r.time_slot == slot)
        by_time_slot[slot] = count

    # 4. Reservations grouped by occasion
    by_occasion = {}
    for occ in VALID_OCCASIONS:
        count = sum(1 for r in active_reservations if r.occasion == occ)
        by_occasion[occ] = count

    # 5. Pending reviews count
    pending_reviews_count = Review.query.filter_by(status='pending').count()

    # 6. Tonight's live music
    today_idx = get_current_day_index()
    tonight_music = LiveMusicDay.query.filter_by(day_index=today_idx).first()

    tonight_info = {
        'day_name': tonight_music.day_name if tonight_music else datetime.now().strftime('%A'),
        'genre': tonight_music.genre if tonight_music else 'Acoustic Sunset',
        'artist': tonight_music.artist if tonight_music else 'To be confirmed',
        'time': tonight_music.time if tonight_music else 'Evening · 7:00 PM',
    }

    # 7. Today's Catch of the Day
    catch = CatchOfTheDay.query.filter_by(is_active=True).order_by(CatchOfTheDay.created_at.desc()).first()

    return jsonify({
        'date': requested_date,
        'today_reservation_count': today_total,
        'today_confirmed_count': today_confirmed,
        'sunset_occupancy_percentage': sunset_occupancy_pct,
        'sunset_booked_count': len(sunset_reservations),
        'total_tables': total_tables_count,
        'cliff_tables_count': cliff_tables_count,
        'reservations_by_time_slot': by_time_slot,
        'reservations_by_occasion': by_occasion,
        'pending_reviews_count': pending_reviews_count,
        'tonight_live_music': tonight_info,
        'catch_of_the_day': catch.to_dict() if catch else None
    })


@admin_bp.route('/admin/catch-of-day', methods=['GET'])
def get_catch_of_the_day():
    # Public endpoint to view today's catch
    catch = CatchOfTheDay.query.filter_by(is_active=True).order_by(CatchOfTheDay.created_at.desc()).first()
    if not catch:
        # Default fallback
        return jsonify({
            'dish_id': 'catch-of-the-day',
            'dish_name': 'Fresh Catch of the Day',
            'note': 'Landed this morning by Varkala coast fishermen',
            'is_active': True,
            'date': date.today().isoformat()
        })
    return jsonify(catch.to_dict())


@admin_bp.route('/admin/catch-of-day', methods=['PUT'])
@login_required
def set_catch_of_the_day():
    data = request.get_json() or {}
    dish_id = (data.get('dish_id') or '').strip()
    dish_name = (data.get('dish_name') or '').strip()
    note = (data.get('note') or 'Landed fresh this morning on Varkala cliff').strip()

    if not dish_id:
        return jsonify({'error': 'dish_id is required (e.g. karimeen-pollichathu or malabar-prawn-roast)'}), 400

    today_str = date.today().isoformat()

    # Deactivate any previous catch
    CatchOfTheDay.query.update({'is_active': False})

    new_catch = CatchOfTheDay(
        dish_id=dish_id,
        dish_name=dish_name or dish_id.replace('-', ' ').title(),
        note=note,
        date=today_str,
        is_active=True
    )
    db.session.add(new_catch)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Catch of the Day set to "{new_catch.dish_name}".',
        'catch_of_the_day': new_catch.to_dict()
    })
