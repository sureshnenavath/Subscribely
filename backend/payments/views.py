from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.conf import settings
import razorpay
import json
from .models import Payment, WebhookEvent
from .serializers import PaymentSerializer
from subscriptions.models import Subscription

# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

@api_view(['GET'])
def list_payments(request):
    payments = Payment.objects.filter(user=request.user)
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def razorpay_webhook(request):
    try:
        # Get the webhook payload and verify signature
        payload = request.body.decode('utf-8')
        signature = request.META.get('HTTP_X_RAZORPAY_SIGNATURE') or request.headers.get('X-Razorpay-Signature')

        # Verify signature if present
        if not signature:
            return Response({'error': 'Missing signature header'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Verify signature manually using HMAC SHA256 to avoid SDK attribute issues
            import hmac
            import hashlib

            computed_sig = hmac.new(
                settings.RAZORPAY_KEY_SECRET.encode('utf-8'),
                payload.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()

            # Compare signatures using constant time comparison
            if not hmac.compare_digest(computed_sig, signature):
                return Response({'error': 'Invalid webhook signature'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'error': 'Invalid webhook signature'}, status=status.HTTP_400_BAD_REQUEST)

        webhook_data = json.loads(payload)
        
        # Store webhook event
        webhook_event = WebhookEvent.objects.create(
            event_type=webhook_data.get('event', 'unknown'),
            payload=payload,
            processed=False
        )
        
        # Process payment events
        if webhook_data.get('event') == 'payment.captured':
            payment_data = webhook_data.get('payload', {}).get('payment', {}).get('entity', {})
            
            # Find the subscription based on razorpay order id stored on subscription
            order_id = payment_data.get('order_id')
            if order_id:
                try:
                    subscription = Subscription.objects.get(razorpay_order_id=order_id)

                    # Create payment record
                    payment = Payment.objects.create(
                        user=subscription.user,
                        subscription=subscription,
                        amount=(payment_data.get('amount', 0) or 0) / 100.0,  # Convert from paise
                        method='Card' if payment_data.get('method') == 'card' else 'UPI',
                        status='success',
                        razorpay_payment_id=payment_data.get('id'),
                        razorpay_order_id=order_id,
                        raw_response=json.dumps(payment_data)
                    )

                    # Update subscription status and set start/end dates if not set
                    subscription.status = 'active'
                    subscription.save()

                    webhook_event.processed = True
                    webhook_event.save()

                except Subscription.DoesNotExist:
                    pass
        
        elif webhook_data.get('event') == 'payment.failed':
            payment_data = webhook_data.get('payload', {}).get('payment', {}).get('entity', {})
            order_id = payment_data.get('order_id')

            if order_id:
                try:
                    subscription = Subscription.objects.get(razorpay_order_id=order_id)

                    # Create failed payment record
                    Payment.objects.create(
                        user=subscription.user,
                        subscription=subscription,
                        amount=(payment_data.get('amount', 0) or 0) / 100.0,
                        method='Card' if payment_data.get('method') == 'card' else 'UPI',
                        status='failed',
                        razorpay_payment_id=payment_data.get('id'),
                        razorpay_order_id=order_id,
                        raw_response=json.dumps(payment_data)
                    )

                    # Update subscription status
                    subscription.status = 'expired'
                    subscription.save()

                    webhook_event.processed = True
                    webhook_event.save()

                except Subscription.DoesNotExist:
                    pass
        
        return Response({'status': 'success'}, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)