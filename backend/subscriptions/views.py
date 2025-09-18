from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
import razorpay
from .models import Plan, Subscription
from .serializers import PlanSerializer, SubscriptionSerializer, SubscribeSerializer
from .permissions import IsActiveSubscriber

from django.conf import settings
from payments.models import Payment

# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


@api_view(['GET'])
@permission_classes([AllowAny])
def list_plans(request):
    plans = Plan.objects.all()
    serializer = PlanSerializer(plans, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_subscriptions(request):
    subscriptions = Subscription.objects.filter(user=request.user)
    serializer = SubscriptionSerializer(subscriptions, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def subscribe_to_plan(request):
    serializer = SubscribeSerializer(data=request.data)
    if serializer.is_valid():
        plan_id = serializer.validated_data['plan_id']
        is_yearly = serializer.validated_data['is_yearly']
        
        try:
            plan = Plan.objects.get(id=plan_id)
        except Plan.DoesNotExist:
            return Response({'error': 'Plan not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Calculate amount and dates
        amount = plan.yearly_price if is_yearly else plan.monthly_price
        start_date = timezone.now()
        end_date = start_date + timedelta(days=365 if is_yearly else 30)
        
        # Create subscription
        subscription = Subscription.objects.create(
            user=request.user,
            plan=plan,
            status='pending',
            start_date=start_date,
            end_date=end_date
        )
        
        # Create Razorpay order
        try:
            razorpay_order = razorpay_client.order.create({
                'amount': int(amount * 100),  # Amount in paise
                'currency': 'INR',
                'receipt': f'subscription_{subscription.id}',
                'payment_capture': 1
            })
            # store razorpay order id on subscription for webhook lookup
            subscription.razorpay_order_id = razorpay_order.get('id')
            subscription.save()

            return Response({
                'subscription_id': subscription.id,
                'razorpay_order_id': razorpay_order['id'],
                'razorpay_key_id': settings.RAZORPAY_KEY_ID,
                'amount': amount,
                'currency': 'INR',
                'name': 'Subscribely',
                'description': f'{plan.name} Plan Subscription',
                'prefill': {
                    'name': f'{request.user.first_name} {request.user.last_name}',
                    'email': request.user.email,
                }
            })
            
        except Exception:
            subscription.delete()
            return Response({'error': 'Failed to create payment order'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription(request, subscription_id):
    try:
        subscription = Subscription.objects.get(id=subscription_id, user=request.user)
        subscription.status = 'cancelled'
        subscription.cancel_date = timezone.now()
        subscription.save()
        
        serializer = SubscriptionSerializer(subscription)
        return Response(serializer.data)
        
    except Subscription.DoesNotExist:
        return Response({'error': 'Subscription not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def renew_subscription(request, subscription_id):
    try:
        subscription = Subscription.objects.get(id=subscription_id, user=request.user)
        
        if subscription.status != 'cancelled':
            return Response({'error': 'Only cancelled subscriptions can be renewed'}, status=status.HTTP_400_BAD_REQUEST)
        
        subscription.status = 'active'
        subscription.cancel_date = None
        subscription.end_date = timezone.now() + timedelta(days=30)
        subscription.save()
        
        serializer = SubscriptionSerializer(subscription)
        return Response(serializer.data)
        
    except Subscription.DoesNotExist:
        return Response({'error': 'Subscription not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def simulate_payment(request, subscription_id):
    """Development helper: create a successful payment record for a subscription and activate it."""
    try:
        subscription = Subscription.objects.get(id=subscription_id, user=request.user)
        # create a Payment record
        payment = Payment.objects.create(
            user=request.user,
            subscription=subscription,
            amount=subscription.plan.monthly_price,
            method='Card',
            status='success',
            razorpay_payment_id=f'dev_dummy_{subscription.id}',
            razorpay_order_id=subscription.razorpay_order_id or f'dev_order_{subscription.id}',
            raw_response='{"dev":"simulated"}'
        )

        subscription.status = 'active'
        subscription.save()

        return Response({'status': 'ok', 'payment_id': payment.id})
    except Subscription.DoesNotExist:
        return Response({'error': 'Subscription not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsActiveSubscriber])
def subscriber_only_content(request):
    """An example endpoint that only active subscribers can access."""
    return Response({'message': 'You are an active subscriber and can access this content.'})