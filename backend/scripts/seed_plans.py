import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'subscribely.settings')
import django
django.setup()

from subscriptions.models import Plan
import json

plans = [
    {
        'name': 'Basic',
        'monthly_price': '1.00',
        'yearly_price': '10.00',
        'features': ['Basic support', 'Up to 3 projects'],
        'trial_days': 7,
    },
    {
        'name': 'Pro',
        'monthly_price': '2.00',
        'yearly_price': '20.00',
        'features': ['Priority support', 'Unlimited projects', 'Advanced analytics'],
        'trial_days': 14,
    },
    {
        'name': 'Pro Plus',
        'monthly_price': '3.00',
        'yearly_price': '30.00',
        'features': ['All Pro features', 'Dedicated account manager', 'SLAs'],
        'trial_days': 30,
    },
]

created = []
for p in plans:
    obj, created_flag = Plan.objects.get_or_create(
        name=p['name'],
        defaults={
            'monthly_price': p['monthly_price'],
            'yearly_price': p['yearly_price'],
            'features': json.dumps(p['features']),
            'trial_days': p['trial_days'],
        }
    )
    # If the plan already exists, ensure its prices are up-to-date
    if not created_flag:
        updated = False
        if str(obj.monthly_price) != str(p['monthly_price']):
            obj.monthly_price = p['monthly_price']
            updated = True
        if str(obj.yearly_price) != str(p['yearly_price']):
            obj.yearly_price = p['yearly_price']
            updated = True
        if updated:
            obj.save()
    created.append((obj, created_flag))

for obj, flag in created:
    print(f"Plan: {obj.name} - {'created' if flag else 'exists'}")

print('Done')
