#!/bin/sh
cd /app/backend/




while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
    echo "Waiting for postgres..."
    sleep 1
done
echo "PostgreSQL started"



python3 manage.py makemigrations
python3 manage.py migrate


exec gunicorn backend.wsgi:application --bind 0.0.0.0:8000
