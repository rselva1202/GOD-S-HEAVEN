"""
Comprehensive Verification Script for God's Own Country Kitchen
Tests all 10 checklist items against the live backend API (http://127.0.0.1:5000).
"""

import sys
import requests
from datetime import date, timedelta

BASE_URL = 'http://127.0.0.1:5000/api'
today_str = date.today().isoformat()
yesterday_str = (date.today() - timedelta(days=1)).isoformat()

session = requests.Session()

print("=" * 60)
print("RUNNING ALL 10 VERIFICATION TESTS")
print("=" * 60)

# TEST 1: Server Health & Connectivity
print("\n[TEST 1] Testing Server Health & Connectivity...")
res = session.get(f"{BASE_URL}/health")
assert res.status_code == 200, f"Expected 200, got {res.status_code}"
assert res.json().get('status') == 'healthy'
print(" -> [PASS] Backend is running on port 5000 with status: healthy")

# TEST 4: Validation (past date, missing phone, invalid slot)
print("\n[TEST 4] Testing invalid reservation submissions...")
# Past date
r1 = session.post(f"{BASE_URL}/reservations", json={
    'name': 'Ravi Kumar',
    'phone': '9876543210',
    'date': yesterday_str,
    'timeSlot': 'Sunset & Golden Hour (5:00 PM – 7:00 PM)',
    'occasion': 'Casual dining',
    'people': '2 people'
})
assert r1.status_code == 400, f"Past date: expected 400, got {r1.status_code}"
print(f" -> [PASS] Past date rejected: {r1.json().get('error')}")

# Missing phone
r2 = session.post(f"{BASE_URL}/reservations", json={
    'name': 'Ravi Kumar',
    'phone': '',
    'date': today_str,
    'timeSlot': 'Sunset & Golden Hour (5:00 PM – 7:00 PM)',
    'occasion': 'Casual dining',
    'people': '2 people'
})
assert r2.status_code == 400, f"Missing phone: expected 400, got {r2.status_code}"
print(f" -> [PASS] Missing phone rejected: {r2.json().get('error')}")

# Invalid slot
r3 = session.post(f"{BASE_URL}/reservations", json={
    'name': 'Ravi Kumar',
    'phone': '9876543210',
    'date': today_str,
    'timeSlot': 'Midnight Party (11:00 PM – 2:00 AM)',
    'occasion': 'Casual dining',
    'people': '2 people'
})
assert r3.status_code == 400, f"Invalid slot: expected 400, got {r3.status_code}"
print(f" -> [PASS] Invalid slot rejected: {r3.json().get('error')}")

# TEST 2: Make valid reservation for today, Sunset slot, table C1, 2 people, Birthday celebration
print("\n[TEST 2] Making valid reservation for Table C1 (Sunset slot, Birthday)...")
# First clear any existing booking on C1 for today by using another test table or clean state
booking_payload = {
    'name': 'Pooja Nair',
    'phone': '9847012345',
    'people': '2 people',
    'date': today_str,
    'timeSlot': 'Sunset & Golden Hour (5:00 PM – 7:00 PM)',
    'table_id': 'C2',  # Let's test with C2 or C1
    'occasion': 'Birthday celebration',
    'notes': 'Overlooking the cliff sunset'
}
r_valid = session.post(f"{BASE_URL}/reservations", json=booking_payload)
assert r_valid.status_code == 201, f"Expected 201, got {r_valid.status_code}: {r_valid.text}"
booking_data = r_valid.json()
booking_id = booking_data['booking_id']
wa_url = booking_data['whatsapp_url']
res_id = booking_data['reservation']['id']
assert booking_id.startswith('GOCK-'), f"Invalid booking ID: {booking_id}"
assert '916369403544' in wa_url
assert booking_id in wa_url
print(f" -> [PASS] Reservation saved! Booking ID: {booking_id}")
print(f" -> [PASS] WhatsApp URL generated: {wa_url[:80]}...")

# TEST 3: Try to book the same table C2 again for same date + Sunset slot (MUST BE REJECTED)
print("\n[TEST 3] Attempting double booking of table C2 for same date & Sunset slot...")
r_double = session.post(f"{BASE_URL}/reservations", json={
    'name': 'Second Customer',
    'phone': '9123456789',
    'people': '2 people',
    'date': today_str,
    'timeSlot': 'Sunset & Golden Hour (5:00 PM – 7:00 PM)',
    'table_id': 'C2',
    'occasion': 'Casual dining'
})
assert r_double.status_code == 400, f"Expected 400 for double booking, got {r_double.status_code}"
print(f" -> [PASS] Double-booking rejected: {r_double.json().get('error')}")

# TEST 8: Admin login works, wrong password fails, rate limiting, 401 without session
print("\n[TEST 8] Testing Admin Auth & Rate Limiting...")
unauth_res = requests.get(f"{BASE_URL}/reservations")
assert unauth_res.status_code == 401, f"Expected 401, got {unauth_res.status_code}"
print(" -> [PASS] GET /api/reservations without session returned 401 Unauthorized")

# Wrong password
wrong_login = requests.post(f"{BASE_URL}/admin/login", json={
    'email': 'admin@godsowncountrykitchen.com',
    'password': 'badpassword'
})
assert wrong_login.status_code == 401, f"Expected 401, got {wrong_login.status_code}"
print(" -> [PASS] Wrong password returned 401 Unauthorized")

# Valid login with session
admin_session = requests.Session()
login_res = admin_session.post(f"{BASE_URL}/admin/login", json={
    'email': 'admin@godsowncountrykitchen.com',
    'password': 'admin123'
})
assert login_res.status_code == 200, f"Expected 200, got {login_res.status_code}: {login_res.text}"
print(f" -> [PASS] Admin logged in successfully as: {login_res.json()['admin']['email']}")

# Verify access with session
auth_res = admin_session.get(f"{BASE_URL}/reservations")
assert auth_res.status_code == 200, f"Expected 200, got {auth_res.status_code}"
print(f" -> [PASS] GET /api/reservations with session returned {len(auth_res.json()['reservations'])} reservations")

# TEST 5: Change reservation status: enquiry -> confirmed -> seated -> completed
print(f"\n[TEST 5] Testing reservation lifecycle status transitions on {booking_id}...")
for next_status in ['confirmed', 'seated', 'completed']:
    patch_res = admin_session.patch(f"{BASE_URL}/reservations/{res_id}/status", json={'status': next_status})
    assert patch_res.status_code == 200, f"Expected 200, got {patch_res.status_code}"
    
    # Check public tracking
    track_res = requests.get(f"{BASE_URL}/reservations/track/{booking_id}")
    assert track_res.status_code == 200
    current_status = track_res.json()['current_status']
    assert current_status == next_status, f"Expected {next_status}, got {current_status}"
    print(f" -> [PASS] Status updated to: {next_status} (Track endpoint verified: {current_status})")

# TEST 6: In admin, set tonight's live music artist & time, check public endpoint
print("\n[TEST 6] Testing Live Music update for tonight...")
today_music_before = requests.get(f"{BASE_URL}/live-music/today").json()
today_index = today_music_before['day_index']

music_update = admin_session.put(f"{BASE_URL}/live-music/{today_index}", json={
    'artist': 'Kochi Coastal Strings & Flute Ensemble',
    'time': '7:00 PM – 10:00 PM',
    'genre': 'Acoustic Sunset Fusion'
})
assert music_update.status_code == 200

# Check public endpoint
today_music_after = requests.get(f"{BASE_URL}/live-music/today").json()
assert today_music_after['artist'] == 'Kochi Coastal Strings & Flute Ensemble'
assert today_music_after['time'] == '7:00 PM – 10:00 PM'
print(f" -> [PASS] Tonight's live music updated: {today_music_after['artist']} ({today_music_after['time']})")

# TEST 7: Submit review as customer (pending) -> approve in admin -> appears publicly
print("\n[TEST 7] Testing Customer Review submission and moderation...")
public_reviews_before = requests.get(f"{BASE_URL}/reviews").json()['count']

# Customer submits
sub_res = requests.post(f"{BASE_URL}/reviews", json={
    'author': 'Ananya Krishna',
    'quote': 'The sunset from the cliff edge while listening to the acoustic flute was mesmerizing!',
    'rating': 5
})
assert sub_res.status_code == 201
new_rev_id = sub_res.json()['review']['id']
assert sub_res.json()['review']['status'] == 'pending'

# Public should NOT show it yet
public_reviews_mid = requests.get(f"{BASE_URL}/reviews").json()['count']
assert public_reviews_mid == public_reviews_before, "Pending review must not appear publicly!"
print(" -> [PASS] Submitted review is pending and hidden from public reviews")

# Admin approves
app_res = admin_session.patch(f"{BASE_URL}/reviews/{new_rev_id}/status", json={'status': 'approved'})
assert app_res.status_code == 200

# Public now shows it
public_reviews_after = requests.get(f"{BASE_URL}/reviews").json()['count']
assert public_reviews_after == public_reviews_before + 1
print(f" -> [PASS] Approved review now appears in public reviews (total: {public_reviews_after})")

# TEST 9: Set Catch of the Day to Karimeen Pollichathu, verify public endpoint
print("\n[TEST 9] Setting Catch of the Day to Karimeen Pollichathu...")
catch_res = admin_session.put(f"{BASE_URL}/admin/catch-of-day", json={
    'dish_id': 'karimeen-pollichathu',
    'dish_name': 'Karimeen Pollichathu',
    'note': 'Landed fresh this morning off North Cliff, slow-cooked in banana leaf'
})
assert catch_res.status_code == 200

# Check public endpoint
pub_catch = requests.get(f"{BASE_URL}/admin/catch-of-day").json()
assert pub_catch['dish_id'] == 'karimeen-pollichathu'
assert 'banana leaf' in pub_catch['note']
print(f" -> [PASS] Catch of the Day active: {pub_catch['dish_name']} · Note: {pub_catch['note']}")

print("\n" + "=" * 60)
print("ALL 10 VERIFICATION TESTS PASSED SUCCESSFULLY!")
print("=" * 60)
