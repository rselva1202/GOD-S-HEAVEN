from datetime import datetime, timedelta
from functools import wraps
from flask import Blueprint, request, jsonify, session
from werkzeug.security import check_password_hash, generate_password_hash

from models import db, Admin

auth_bp = Blueprint('auth', __name__)

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        admin_id = session.get('admin_id')
        if not admin_id:
            return jsonify({'error': 'Unauthorized: Please log in'}), 401
        admin = Admin.query.get(admin_id)
        if not admin:
            session.clear()
            return jsonify({'error': 'Unauthorized: Account not found'}), 401
        return f(*args, **kwargs)
    return decorated_function


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    admin = Admin.query.filter_by(email=email).first()
    if not admin:
        return jsonify({'error': 'Invalid email or password'}), 401

    # Check lockout
    now = datetime.utcnow()
    if admin.locked_until and admin.locked_until > now:
        remaining = int((admin.locked_until - now).total_seconds() / 60) + 1
        return jsonify({
            'error': f'Account locked due to too many failed attempts. Try again in {remaining} minute(s).'
        }), 429

    # Verify password
    if not check_password_hash(admin.password_hash, password):
        admin.failed_attempts += 1
        if admin.failed_attempts >= MAX_FAILED_ATTEMPTS:
            admin.locked_until = now + timedelta(minutes=LOCKOUT_MINUTES)
            db.session.commit()
            return jsonify({
                'error': f'Account locked for {LOCKOUT_MINUTES} minutes due to 5 consecutive failed login attempts.'
            }), 429
        db.session.commit()
        remaining_attempts = MAX_FAILED_ATTEMPTS - admin.failed_attempts
        return jsonify({
            'error': f'Invalid email or password. {remaining_attempts} attempt(s) remaining before temporary lockout.'
        }), 401

    # Successful login
    admin.failed_attempts = 0
    admin.locked_until = None
    db.session.commit()

    session['admin_id'] = admin.id
    session['admin_role'] = admin.role
    session['admin_email'] = admin.email
    session.permanent = True

    return jsonify({
        'success': True,
        'message': 'Logged in successfully',
        'admin': admin.to_dict()
    })


@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'})


@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    admin_id = session.get('admin_id')
    if not admin_id:
        return jsonify({'authenticated': False, 'admin': None}), 401

    admin = Admin.query.get(admin_id)
    if not admin:
        session.clear()
        return jsonify({'authenticated': False, 'admin': None}), 401

    return jsonify({
        'authenticated': True,
        'admin': admin.to_dict()
    })
