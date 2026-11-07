from datetime import datetime
from flask import Blueprint, request, jsonify

from models import db, LiveMusicDay
from auth import login_required

live_music_bp = Blueprint('live_music', __name__)


def get_current_day_index():
    # JavaScript getDay(): Sunday=0, Monday=1, ..., Saturday=6
    # Python weekday(): Monday=0, ..., Sunday=6
    # (weekday() + 1) % 7 maps correctly to 0=Sunday, 1=Monday... 6=Saturday
    return (datetime.now().weekday() + 1) % 7


@live_music_bp.route('/live-music', methods=['GET'])
def get_all_live_music():
    days = LiveMusicDay.query.order_by(LiveMusicDay.day_index).all()
    today_idx = get_current_day_index()

    result = []
    for d in days:
        item = d.to_dict()
        item['is_today'] = (d.day_index == today_idx)
        result.append(item)

    return jsonify({
        'days': result,
        'today_day_index': today_idx,
    })


@live_music_bp.route('/live-music/today', methods=['GET'])
def get_today_live_music():
    today_idx = get_current_day_index()
    day = LiveMusicDay.query.filter_by(day_index=today_idx).first()

    if not day:
        # Fallback to first record
        day = LiveMusicDay.query.first()

    if not day:
        return jsonify({
            'day_index': today_idx,
            'day_name': datetime.now().strftime('%A'),
            'genre': 'Acoustic Sunset',
            'artist': 'Artist lineup: to be confirmed',
            'time': 'Evening · 7:00 PM – 10:00 PM',
            'description': 'Acoustic sets and seaside rhythms.',
            'is_tonight': True
        })

    data = day.to_dict()
    data['is_tonight'] = True
    return jsonify(data)


@live_music_bp.route('/live-music/<int:day_index>', methods=['PUT'])
@login_required
def update_live_music_day(day_index):
    day = LiveMusicDay.query.filter_by(day_index=day_index).first()
    if not day:
        return jsonify({'error': f'Live music day with index {day_index} not found.'}), 404

    data = request.get_json() or {}

    if 'artist' in data:
        day.artist = (data['artist'] or '').strip()
    if 'time' in data:
        day.time = (data['time'] or '').strip()
    if 'genre' in data:
        day.genre = (data['genre'] or '').strip()
    if 'description' in data:
        day.description = (data['description'] or '').strip()
    if 'is_tonight_highlight' in data:
        day.is_tonight_highlight = bool(data['is_tonight_highlight'])

    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Live music for {day.day_name} updated.',
        'day': day.to_dict()
    })
