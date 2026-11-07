import os
from datetime import timedelta
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from models import db
from auth import auth_bp
from routes.reservations import reservations_bp
from routes.live_music import live_music_bp
from routes.reviews import reviews_bp
from routes.admin import admin_bp
from seed import seed_database

# Load environment variables
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))


def create_app(test_config=None):
    app = Flask(__name__)

    # 1. Config
    secret_key = os.getenv('SECRET_KEY', 'gods-own-country-kitchen-dev-secret-key-varkala')
    app.config['SECRET_KEY'] = secret_key

    # Database URL: PostgreSQL in production, SQLite in development
    default_db_path = os.path.join(basedir, 'app.db')
    database_url = os.getenv('DATABASE_URL', f"sqlite:///{default_db_path}")

    # Fix legacy postgres:// prefix if used by some cloud providers
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Session cookie configuration (Werkzeug + HTTP-only session cookies)
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = os.getenv('FLASK_ENV') == 'production'
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

    if test_config:
        app.config.update(test_config)

    # 2. CORS setup
    frontend_urls = os.getenv(
        'FRONTEND_URL',
        'http://localhost:3000,http://127.0.0.1:3000,https://rselva1202.github.io'
    ).split(',')
    frontend_origins = [url.strip() for url in frontend_urls if url.strip()]

    CORS(
        app,
        resources={r"/api/*": {"origins": frontend_origins + ["http://localhost:3000", "http://127.0.0.1:3000"]}},
        supports_credentials=True
    )

    # 3. Initialize Extensions
    db.init_app(app)

    # 4. Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/admin')
    app.register_blueprint(reservations_bp, url_prefix='/api')
    app.register_blueprint(live_music_bp, url_prefix='/api')
    app.register_blueprint(reviews_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api')

    # 5. Global Health & Info Routes
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': "God's Own Country Kitchen API",
            'location': 'North Cliff, Varkala, Kerala',
            'version': '1.0.0'
        })

    # Error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'error': 'Internal server error'}), 500

    # 6. Auto-create tables and seed data if not already present
    with app.app_context():
        db.create_all()
        try:
            seed_database()
        except Exception as ex:
            print(f"[!] Seed note: {ex}")

    return app


app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"[*] Starting God's Own Country Kitchen API on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
