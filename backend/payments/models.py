from django.db import models
from django.contrib.auth import get_user_model
from subscriptions.models import Subscription

User = get_user_model()

class Payment(models.Model):
    METHOD_CHOICES = [
        ('UPI', 'UPI'),
        ('Card', 'Card'),
    ]
    
    STATUS_CHOICES = [
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('pending', 'Pending'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=10, choices=METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    raw_response = models.TextField()
    payment_date = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.amount} ({self.status})"

    class Meta:
        ordering = ['-payment_date']

class WebhookEvent(models.Model):
    event_type = models.CharField(max_length=100)
    payload = models.TextField()
    processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.event_type} - {'Processed' if self.processed else 'Pending'}"

    class Meta:
        ordering = ['-created_at']