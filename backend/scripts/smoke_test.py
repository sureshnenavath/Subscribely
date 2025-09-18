import requests
BASE='http://127.0.0.1:8000'
print('GET /api/plans/')
r = requests.get(BASE + '/api/plans/')
print(r.status_code)
print(r.text[:1000])

print('\nPOST /api/auth/signup/')
payload = {
    'first_name':'Smoke',
    'last_name':'Test',
    'email':'smoketest@example.com',
    'username':'smoketest',
    'password':'Password123!',
    'confirm_password':'Password123!'
}
r = requests.post(BASE + '/api/auth/signup/', json=payload)
print(r.status_code)
print(r.text[:1000])
