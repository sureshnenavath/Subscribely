#!/usr/bin/env bash
set -euo pipefail

# Simple entrypoint for Render (or any container) that runs migrations,
# collects static files, and starts Gunicorn. Make sure this file is
# executable in the repo so Render can run it directly.

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "Starting Gunicorn..."
exec gunicorn subscribely.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 3
