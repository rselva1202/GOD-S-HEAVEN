import re
import random
import string
from datetime import datetime, date
from urllib.parse import quote
from flask import Blueprint, request, jsonify
from sqlalchemy import func

from models import (
    db,
    Reservation,
    Table,
    VALID_TIME_SLOTS,
    VALID_OCCASIONS,
    VALID_GUEST_OPTIONS,
    VALID_STATUSES,
)
from auth import login_required

reservations_bp = Blueprint('reservations', __name__)


def normalize_str(s):
    if not s:
        return ''
    return s.replace('–', '-').replace('—', '-').replace('  ', ' ').strip()


def find_matching_slot(slot_input):
    norm = normalize_str(slot_input).lower()
    for valid_slot in VALID_TIME_SLOTS:
        if normalize_str(valid_slot).lower() == norm:
            return valid_slot
    return None


def find_matching_people(people_input):
    norm = normalize_str(people_input).lower()
    for valid_opt in VALID_GUEST_OPTIONS:
        if normalize_str(valid_opt).lower() == norm:
            return valid_opt
    return None


def generate_booking_id(res_date_str=None):
    year = res_date_str.split('-')[0] if res_date_str and '-' in res_date_str else datetime.utcnow().strftime('%Y')
    for _ in range(20):
        chars = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        candidate = f"GOCK-{year}-{chars}"
        if not Reservation.query.filter_by(booking_id=candidate).first():
            return candidate
    # Fallback with timestamp
    return f"GOCK-{year}-{int(datetime.utcnow().timestamp())}"


def format_date_display(date_str):
    if not date_str:
        return 'Flexible'
    try:
        dt = datetime.strptime(date_str, '%Y-%m-%d')
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return f"{dt.day} {months[dt.month - 1]} {dt.year}"
    except Exception:
        return date_str


def validate_phone(phone_str):
    if not phone_str:
        return False
    digits = re.sub(r'\D', '', str(phone_str))
    return len(digits) >= 10


# -------------------------------------------------------------
# Tables API
# -------------------------------------------------------------
@reservations_bp.route('/tables', methods=['GET'])
def get_tables():
    res_date = request.args.get('date', '').strip()
    slot = request.args.get('slot', '').strip()

    tables = Table.query.order_by(Table.code).all()

    booked_table_ids = set()
    if res_date and slot:
        active_bookings = Reservation.query.filter(
            Reservation.date == res_date,
            Reservation.time_slot == slot,
            Reservation.table_id.isnot(None),
            Reservation.status.notin_(['cancelled', 'no_show'])
        ).all()
        booked_table_ids = {b.table_id for b in active_bookings}

    result = []
    for t in tables:
        d = t.to_dict()
        d['is_available'] = t.id not in booked_table_ids
        d['is_cliff_edge'] = t.zone == 'cliff-edge'
        result.append(d)

    return jsonify({'tables': result, 'date': res_date, 'slot': slot})


# -------------------------------------------------------------
# Reservations API
# -------------------------------------------------------------
@reservations_bp.route('/reservations', methods=['POST'])
def create_reservation():
    data = request.get_json() or {}

    name = (data.get('name') or '').strip()
    phone = (data.get('phone') or '').strip()
    people = (data.get('people') or '2 people').strip()
    res_date = (data.get('date') or '').strip()
    time_slot = (data.get('timeSlot') or data.get('time_slot') or '').strip()
    occasion = (data.get('occasion') or 'Casual dining').strip()
    notes = (data.get('notes') or '').strip()
    table_id = data.get('table_id') or data.get('tableId')

    # 1. Validation
    if len(name) < 2:
        return jsonify({'error': 'Name must be at least 2 characters.'}), 400

    if not validate_phone(phone):
        return jsonify({'error': 'A valid phone number with at least 10 digits is required.'}), 400

    today_str = date.today().isoformat()
    if not res_date:
        return jsonify({'error': 'Reservation date is required.'}), 400

    try:
        parsed_date = datetime.strptime(res_date, '%Y-%m-%d').date()
        if parsed_date < date.today():
            return jsonify({'error': 'Reservation date must be today or a future date.'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid date format. Expected YYYY-MM-DD.'}), 400

    canonical_slot = find_matching_slot(time_slot)
    if not canonical_slot:
        return jsonify({'error': f'Invalid time slot. Must be one of: {", ".join(VALID_TIME_SLOTS)}'}), 400
    time_slot = canonical_slot

    canonical_people = find_matching_people(people)
    if not canonical_people:
        return jsonify({'error': f'Invalid number of guests. Must be one of: {", ".join(VALID_GUEST_OPTIONS)}'}), 400
    people = canonical_people

    if len(notes) > 300:
        return jsonify({'error': 'Notes cannot exceed 300 characters.'}), 400

    # 2. Check total slot capacity (10 tables maximum)
    active_count = Reservation.query.filter(
        Reservation.date == res_date,
        Reservation.time_slot == time_slot,
        Reservation.status.notin_(['cancelled', 'no_show'])
    ).count()

    total_tables_count = Table.query.count() or 10
    if active_count >= total_tables_count:
        return jsonify({
            'error': f'The "{time_slot}" slot on {format_date_display(res_date)} is fully booked. Please select another slot or message us on WhatsApp.'
        }), 400

    # 3. Check table availability if table_id is specified
    selected_table = None
    if table_id:
        selected_table = Table.query.get(table_id)
        if not selected_table:
            # Maybe code was passed instead of numeric ID
            selected_table = Table.query.filter_by(code=str(table_id).upper()).first()

        if selected_table:
            table_id = selected_table.id
            existing = Reservation.query.filter(
                Reservation.date == res_date,
                Reservation.time_slot == time_slot,
                Reservation.table_id == selected_table.id,
                Reservation.status.notin_(['cancelled', 'no_show'])
            ).first()

            if existing:
                return jsonify({
                    'error': f'Table {selected_table.code} ({selected_table.description}) is already reserved for {time_slot} on {format_date_display(res_date)}. Please choose another table.'
                }), 400
        else:
            table_id = None

    # 4. Create Reservation
    booking_id = generate_booking_id(res_date)

    reservation = Reservation(
        booking_id=booking_id,
        name=name,
        phone=phone,
        people=people,
        date=res_date,
        time_slot=time_slot,
        table_id=table_id,
        occasion=occasion,
        notes=notes,
        status='enquiry',
        whatsapp_sent=False
    )
    db.session.add(reservation)
    db.session.commit()

    # 5. Build WhatsApp URL
    formatted_date = format_date_display(res_date)
    table_line = f"Table: {selected_table.code} ({selected_table.description})" if selected_table else None

    wa_lines = [
        "Table Reservation Enquiry · God's Own Country Kitchen",
        f"Booking ID: {booking_id}",
        f"Name: {name}",
        f"Phone: {phone}",
        f"Number of people: {people}",
        f"Date: {formatted_date}",
        f"Time slot: {time_slot}",
        table_line,
        f"Occasion: {occasion}" if occasion else None,
        f"Notes: {notes}" if notes else None,
    ]
    wa_message = "\n".join([line for line in wa_lines if line])
    whatsapp_url = f"https://wa.me/916369403544?text={quote(wa_message)}"

    return jsonify({
        'success': True,
        'message': 'Reservation recorded successfully. Please confirm on WhatsApp.',
        'booking_id': booking_id,
        'reservation': reservation.to_dict(),
        'whatsapp_url': whatsapp_url
    }), 201


@reservations_bp.route('/reservations/slots', methods=['GET'])
def get_reservation_slots():
    res_date = request.args.get('date', '').strip() or date.today().isoformat()

    tables = Table.query.all()
    total_tables = len(tables) if tables else 10
    total_seats = sum(t.seats for t in tables) if tables else 36

    # Get active reservations on that date
    active_reservations = Reservation.query.filter(
        Reservation.date == res_date,
        Reservation.status.notin_(['cancelled', 'no_show'])
    ).all()

    # Group by slot
    slot_map = {slot: [] for slot in VALID_TIME_SLOTS}
    for r in active_reservations:
        if r.time_slot in slot_map:
            slot_map[r.time_slot].append(r)

    cliff_edge_tables = [t for t in tables if t.zone == 'cliff-edge']
    total_cliff_tables = len(cliff_edge_tables)

    slots_data = []
    for slot in VALID_TIME_SLOTS:
        bookings = slot_map[slot]
        booked_table_ids = {b.table_id for b in bookings if b.table_id}

        remaining_tables = max(0, total_tables - len(bookings))
        unbooked_tables = [t for t in tables if t.id not in booked_table_ids]
        remaining_seats = sum(t.seats for t in unbooked_tables) if unbooked_tables else 0

        # Cliff-edge specific stats for sunset
        booked_cliff = sum(1 for b in bookings if b.table and b.table.zone == 'cliff-edge')
        remaining_cliff = max(0, total_cliff_tables - booked_cliff)

        is_sunset = 'Sunset' in slot

        slot_item = {
            'time_slot': slot,
            'remaining_tables': remaining_tables,
            'remaining_seats': remaining_seats,
            'total_tables': total_tables,
            'total_seats': total_seats,
            'is_sunset': is_sunset,
            'remaining_cliff_tables': remaining_cliff,
            'scarcest': is_sunset or (remaining_tables <= 3),
            'note': 'Sunset tables sell out first · Cliff-edge priority' if is_sunset else f'{remaining_tables} tables available',
            'is_full': remaining_tables == 0
        }
        slots_data.append(slot_item)

    return jsonify({
        'date': res_date,
        'formatted_date': format_date_display(res_date),
        'slots': slots_data
    })


@reservations_bp.route('/reservations/track/<booking_id>', methods=['GET'])
def track_reservation(booking_id):
    booking_id = (booking_id or '').strip()
    if not booking_id:
        return jsonify({'error': 'Booking ID is required.'}), 400

    reservation = Reservation.query.filter(
        func.lower(Reservation.booking_id) == booking_id.lower()
    ).first()

    # Also support fallback phone lookup if query param supplied
    phone = request.args.get('phone', '').strip()
    res_date = request.args.get('date', '').strip()
    if not reservation and phone and res_date:
        digits = re.sub(r'\D', '', phone)
        all_matches = Reservation.query.filter(Reservation.date == res_date).all()
        for r in all_matches:
            if re.sub(r'\D', '', r.phone) == digits:
                reservation = r
                break

    if not reservation:
        return jsonify({'error': f'No reservation found for booking ID "{booking_id}". Please check the ID or contact us.'}), 404

    # Build status lifecycle timeline (create -> verify -> seated -> complete)
    lifecycle = [
        {'key': 'enquiry', 'label': 'Enquiry Received', 'desc': 'Booking details recorded & sent via WhatsApp'},
        {'key': 'confirmed', 'label': 'Table Confirmed', 'desc': 'Table reserved & prepared by restaurant staff'},
        {'key': 'seated', 'label': 'Guests Seated', 'desc': 'Welcomed at North Cliff overlooking the Arabian Sea'},
        {'key': 'completed', 'label': 'Dining Completed', 'desc': 'Thank you for dining with us! Hope you enjoyed the sunset & fresh catch.'},
    ]

    current_status = reservation.status
    is_terminal_negative = current_status in ['cancelled', 'no_show']

    status_order = ['enquiry', 'confirmed', 'seated', 'completed']
    current_index = status_order.index(current_status) if current_status in status_order else -1

    timeline = []
    for idx, step in enumerate(lifecycle):
        step_done = False
        step_active = False

        if not is_terminal_negative:
            if idx < current_index:
                step_done = True
            elif idx == current_index:
                step_active = True
                step_done = True

        timeline.append({
            'key': step['key'],
            'label': step['label'],
            'description': step['desc'],
            'done': step_done,
            'active': step_active,
        })

    return jsonify({
        'reservation': reservation.to_dict(),
        'current_status': current_status,
        'is_terminal': is_terminal_negative,
        'timeline': timeline,
        'formatted_date': format_date_display(reservation.date)
    })


@reservations_bp.route('/reservations', methods=['GET'])
@login_required
def get_all_reservations():
    query = Reservation.query

    res_date = request.args.get('date', '').strip()
    status = request.args.get('status', '').strip()
    search = request.args.get('search', '').strip()

    if res_date:
        query = query.filter(Reservation.date == res_date)

    if status and status != 'all':
        query = query.filter(Reservation.status == status)

    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            db.or_(
                func.lower(Reservation.name).like(search_term),
                func.lower(Reservation.phone).like(search_term),
                func.lower(Reservation.booking_id).like(search_term)
            )
        )

    reservations = query.order_by(Reservation.created_at.desc()).all()
    return jsonify({
        'count': len(reservations),
        'reservations': [r.to_dict() for r in reservations]
    })


@reservations_bp.route('/reservations/<int:res_id>/status', methods=['PATCH'])
@login_required
def update_reservation_status(res_id):
    reservation = Reservation.query.get_or_404(res_id)
    data = request.get_json() or {}

    new_status = (data.get('status') or '').strip().lower()
    if new_status not in VALID_STATUSES:
        return jsonify({'error': f'Invalid status. Must be one of: {", ".join(VALID_STATUSES)}'}), 400

    reservation.status = new_status
    reservation.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Reservation {reservation.booking_id} status updated to {new_status}.',
        'reservation': reservation.to_dict()
    })
