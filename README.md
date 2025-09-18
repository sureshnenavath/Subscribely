# Subscribely - Subscription Management Platform

A full-stack subscription management platform built with Django REST Framework and React, featuring Razorpay payment integration.

## Features

### Backend (Django + DRF)
- JWT Authentication with HTTP-only cookies
- User registration and login
- Subscription plan management
- Razorpay payment integration
- Webhook handling for payment events
- SQLite database
- Admin panel for managing plans and users

### Frontend (React + TypeScript)
- Modern, responsive UI with Tailwind CSS
- Dark/Light theme toggle
- User authentication flows
- Subscription management dashboard
- Interactive plans page with payment integration
- Payment history tracking
- Real-time updates via webhooks

## Tech Stack

**Backend:**
- Django 4.2
- Django REST Framework
- JWT Authentication
- Razorpay Python SDK
- SQLite Database

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- Axios for API calls
- React Router for navigation
- Lucide React for icons

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create environment file:
```bash
cp .env.example .env
```

5. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Load initial data:
```bash
python manage.py loaddata fixtures/initial_data.json
```

7. Create superuser:
```bash
python manage.py createsuperuser
```

8. Start the development server:
```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile

### Plans
- `GET /api/plans/` - List all subscription plans

### Subscriptions
- `GET /api/subscriptions/list/` - List user subscriptions
- `POST /api/subscriptions/subscribe/` - Subscribe to a plan
- `POST /api/subscriptions/<id>/cancel/` - Cancel subscription
- `POST /api/subscriptions/<id>/renew/` - Renew subscription

### Payments
- `GET /api/payments/` - List user payments
- `POST /api/webhooks/razorpay/` - Razorpay webhook endpoint

## Razorpay Integration

### Test Credentials
- **Key ID:** `rzp_test_RIcK2VIpRxbMbg`
- **Key Secret:** `4G78tnRQoskxKS0bbA6i88Vj`

### Test Cards
- **Success:** 4111 1111 1111 1111
- **Failure:** 4000 0000 0000 0002

### UPI Testing
- Use any UPI ID for testing (e.g., test@paytm)

## Database Schema

The application uses SQLite with the following main tables:
- `users` - User accounts (extends Django's User model)
- `plans` - Subscription plans
- `subscriptions` - User subscriptions
- `payments` - Payment records
- `webhook_events` - Webhook event logs

## Deployment

### Using Docker

1. Build and run with Docker Compose:
```bash
cd backend
docker-compose up --build
```

### Manual Deployment

1. Set environment variables for production
2. Configure static files serving
3. Set up SSL certificates
4. Configure webhook URLs in Razorpay dashboard

## Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.