from flask import Blueprint, request, jsonify

from models import db, Review
from auth import login_required

reviews_bp = Blueprint('reviews', __name__)


@reviews_bp.route('/reviews', methods=['GET'])
def get_approved_reviews():
    # Only return approved reviews to the public
    approved = Review.query.filter_by(status='approved').order_by(Review.created_at.desc()).all()
    return jsonify({
        'count': len(approved),
        'reviews': [r.to_dict() for r in approved]
    })


@reviews_bp.route('/reviews/all', methods=['GET'])
@login_required
def get_all_reviews():
    # Admin can view all reviews (pending, approved, rejected)
    status_filter = request.args.get('status', '').strip().lower()
    query = Review.query
    if status_filter:
        query = query.filter_by(status=status_filter)

    reviews = query.order_by(Review.created_at.desc()).all()
    return jsonify({
        'count': len(reviews),
        'reviews': [r.to_dict() for r in reviews]
    })


@reviews_bp.route('/reviews', methods=['POST'])
def submit_review():
    data = request.get_json() or {}

    author = (data.get('author') or '').strip()
    quote_text = (data.get('quote') or data.get('comment') or '').strip()
    rating = data.get('rating', 5)

    if len(author) < 2:
        return jsonify({'error': 'Name must be at least 2 characters.'}), 400

    if len(quote_text) < 10:
        return jsonify({'error': 'Review must be at least 10 characters.'}), 400

    try:
        rating = int(rating)
        if rating < 1 or rating > 5:
            rating = 5
    except (ValueError, TypeError):
        rating = 5

    # New customer reviews always start as pending
    review = Review(
        author=author,
        quote=quote_text,
        source='Guest review',
        rating=rating,
        status='pending'
    )
    db.session.add(review)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Thank you! Your review has been submitted for moderation and will appear once approved.',
        'review': review.to_dict()
    }), 201


@reviews_bp.route('/reviews/<int:review_id>/status', methods=['PATCH'])
@login_required
def update_review_status(review_id):
    review = Review.query.get_or_404(review_id)
    data = request.get_json() or {}

    new_status = (data.get('status') or '').strip().lower()
    if new_status not in ['approved', 'rejected', 'pending']:
        return jsonify({'error': 'Status must be one of: approved, rejected, pending'}), 400

    review.status = new_status
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Review from {review.author} marked as {new_status}.',
        'review': review.to_dict()
    })
