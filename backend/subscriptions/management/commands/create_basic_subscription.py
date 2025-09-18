from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from subscriptions.models import Plan, Subscription
from payments.models import Payment
import uuid
import json


class Command(BaseCommand):
    help = "Create an active Basic subscription for a given user"

    def handle(self, *args, **options):
        User = get_user_model()
        username_for_subscription = input("Enter the user name: ")  # Change this to the desired username

        # Fetch user
        try:
            user = User.objects.get(username=username_for_subscription)
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f"User with username '{username_for_subscription}' does not exist.")
            )
            return

        # Fetch plan
        try:
            plan = Plan.objects.get(name__iexact='Basic')
        except Plan.DoesNotExist:
            self.stdout.write(self.style.ERROR("Plan 'Basic' not found."))
            return

        # Subscription details
        now = timezone.now()
        days = plan.trial_days if getattr(plan, 'trial_days', None) else 7
        end_date = now + timedelta(days=days)

        subscription = Subscription.objects.create(
            user=user,
            plan=plan,
            status='active',
            start_date=now,
            end_date=end_date
        )

        # Payment creation
        generated_order_id = f"order_{uuid.uuid4().hex}"
        generated_payment_id = f"pay_{uuid.uuid4().hex}"
        payment = Payment.objects.create(
            user=user,
            subscription=subscription,
            amount=plan.monthly_price,
            method='Card',
            status='success',
            razorpay_order_id=generated_order_id,
            razorpay_payment_id=generated_payment_id,
            raw_response=json.dumps({
                'synthetic': True,
                'note': 'Created by management command create_basic_subscription',
                'order_id': generated_order_id,
                'payment_id': generated_payment_id,
            })
        )

        # Success message
        self.stdout.write(self.style.SUCCESS(
            f"✅ Created Basic subscription for user '{user.username}' "
            f"(plan={plan.name}, subscription_id={subscription.pk}) "
            f"with payment_id={payment.pk}."
        ))
