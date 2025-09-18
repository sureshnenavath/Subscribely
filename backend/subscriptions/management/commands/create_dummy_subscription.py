from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from subscriptions.models import Plan, Subscription
from payments.models import Payment
from django.utils import timezone


class Command(BaseCommand):
    help = 'Create a dummy subscription and payment for user "user" on the Pro plan'

    def handle(self, *args, **options):
        User = get_user_model()
        user, created = User.objects.get_or_create(
            username='user',
            defaults={
                'email': 'user@example.com',
                'first_name': 'User',
                'last_name': 'Test',
                'is_active': True,
            }
        )
        if created:
            user.set_password('TestPass123!')
            user.save()

        plan = Plan.objects.filter(name__iexact='Pro').first()
        if not plan:
            self.stdout.write(self.style.ERROR('Pro plan not found'))
            return

        now = timezone.now()
        end = now + timezone.timedelta(days=30)

        sub = Subscription.objects.create(
            user=user,
            plan=plan,
            status='active',
            start_date=now,
            end_date=end,
            razorpay_order_id='dummy_order_001'
        )

        Payment.objects.create(
            user=user,
            subscription=sub,
            amount=plan.monthly_price,
            method='Card',
            status='success',
            razorpay_payment_id='dummy_txn_001',
            razorpay_order_id='dummy_order_001',
            raw_response='{"dummy":"response"}'
        )

        self.stdout.write(self.style.SUCCESS('Dummy subscription and payment created for user'))
