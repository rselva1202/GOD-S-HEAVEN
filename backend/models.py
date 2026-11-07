from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Exact valid constants as specified by the business and frontend
VALID_TIME_SLOTS = [
    'Lunch (12:30 PM – 3:30 PM)',
    'Sunset & Golden Hour (5:00 PM – 7:00 PM)',
    'Dinner & Live Music (7:00 PM – 10:30 PM)',
    'Other / Flexible',
]

VALID_OCCASIONS = [
    'Casual dining',
    'Sunset drinks & dinner',
    'Live music evening',
    'Birthday celebration',
    'Anniversary',
    'Group / Family feast',
]

VALID_GUEST_OPTIONS = [
    '1 person',
    '2 people',
    '3 people',
    '4 people',
    '5–8 people',
    '9+ group',
]

VALID_STATUSES = [
    'enquiry',
    'confirmed',
    'seated',
    'completed',
    'no_show',
    'cancelled',
]


class Table(db.Model):
    __tablename__ = 'tables'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(10), unique=True, nullable=False, index=True)
    zone = db.Column(db.String(40), nullable=False)  # 'cliff-edge', 'family', 'indoor'
    seats = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String(200), nullable=False)

    reservations = db.relationship('Reservation', backref='table', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'zone': self.zone,
            'seats': self.seats,
            'description': self.description,
        }


class Reservation(db.Model):
    __tablename__ = 'reservations'

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.String(32), unique=True, nullable=False, index=True)
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(30), nullable=False, index=True)
    people = db.Column(db.String(50), nullable=False)
    date = db.Column(db.String(10), nullable=False, index=True)  # YYYY-MM-DD
    time_slot = db.Column(db.String(80), nullable=False, index=True)
    table_id = db.Column(db.Integer, db.ForeignKey('tables.id'), nullable=True)
    occasion = db.Column(db.String(80), nullable=False)
    notes = db.Column(db.String(300), nullable=True)
    status = db.Column(db.String(30), default='enquiry', nullable=False)
    whatsapp_sent = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'name': self.name,
            'phone': self.phone,
            'people': self.people,
            'date': self.date,
            'time_slot': self.time_slot,
            'table_id': self.table_id,
            'table_code': self.table.code if self.table else None,
            'table_zone': self.table.zone if self.table else None,
            'occasion': self.occasion,
            'notes': self.notes or '',
            'status': self.status,
            'whatsapp_sent': self.whatsapp_sent,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class LiveMusicDay(db.Model):
    __tablename__ = 'live_music_days'

    id = db.Column(db.Integer, primary_key=True)
    day_index = db.Column(db.Integer, unique=True, nullable=False)  # 0=Sunday, 1=Monday... 6=Saturday
    day_name = db.Column(db.String(20), nullable=False)
    genre = db.Column(db.String(100), nullable=False)
    artist = db.Column(db.String(120), nullable=False)
    time = db.Column(db.String(80), nullable=False)
    description = db.Column(db.Text, nullable=False)
    is_tonight_highlight = db.Column(db.Boolean, default=False, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'day_index': self.day_index,
            'day_name': self.day_name,
            'genre': self.genre,
            'artist': self.artist,
            'time': self.time,
            'description': self.description,
            'is_tonight_highlight': self.is_tonight_highlight,
        }


class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)
    author = db.Column(db.String(120), nullable=False)
    quote = db.Column(db.Text, nullable=False)
    source = db.Column(db.String(80), default='Google review', nullable=False)
    rating = db.Column(db.Integer, default=5, nullable=False)
    status = db.Column(db.String(20), default='pending', nullable=False)  # pending, approved, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'author': self.author,
            'quote': self.quote,
            'source': self.source,
            'rating': self.rating,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class CatchOfTheDay(db.Model):
    __tablename__ = 'catch_of_the_day'

    id = db.Column(db.Integer, primary_key=True)
    dish_id = db.Column(db.String(80), nullable=False)
    dish_name = db.Column(db.String(120), nullable=True)
    note = db.Column(db.String(300), nullable=False)
    date = db.Column(db.String(10), nullable=False)  # YYYY-MM-DD
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'dish_id': self.dish_id,
            'dish_name': self.dish_name,
            'note': self.note,
            'date': self.date,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class Admin(db.Model):
    __tablename__ = 'admins'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(30), default='admin', nullable=False)  # admin / staff
    failed_attempts = db.Column(db.Integer, default=0, nullable=False)
    locked_until = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
