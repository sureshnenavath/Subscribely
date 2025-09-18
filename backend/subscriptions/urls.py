from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_plans, name='list_plans'),
    # Alias for checkout session creation requested by assessment
    path('create-session/', views.subscribe_to_plan, name='create_session'),
    path('list/', views.list_subscriptions, name='list_subscriptions'),
    path('subscribe/', views.subscribe_to_plan, name='subscribe_to_plan'),
    path('subscriber-only/', views.subscriber_only_content, name='subscriber_only'),
    path('<int:subscription_id>/cancel/', views.cancel_subscription, name='cancel_subscription'),
    path('<int:subscription_id>/renew/', views.renew_subscription, name='renew_subscription'),
    path('<int:subscription_id>/simulate_payment/', views.simulate_payment, name='simulate_payment'),
]