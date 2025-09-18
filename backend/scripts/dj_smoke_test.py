import os
import sys
import django
from django.test import Client

# Ensure backend package is on sys.path so 'subscribely' settings can be imported
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'subscribely.settings')
django.setup()

c = Client()
print('GET /api/plans/')
resp = c.get('/api/plans/')
print(resp.status_code)
print(resp.content[:1000])

print('\nPOST /api/auth/signup/')
payload = {
    'first_name':'Smoke',
    'last_name':'Test',
    'email':'smoketest@example.com',
    'username':'smoketest',
    'password':'Password123!',
    'confirm_password':'Password123!'
}
resp = c.post('/api/auth/signup/', data=payload, content_type='application/json')
print(resp.status_code)
print(resp.content[:1000])
