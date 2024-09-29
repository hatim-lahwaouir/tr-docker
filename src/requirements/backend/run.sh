#!/bin/sh
cd /app/backend/



while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
    echo "Waiting for postgres..."
    sleep 1
done
echo "PostgreSQL started"


echo "Making migrations"
python3 manage.py makemigrations
echo "Making migrate"
python3 manage.py migrate


python manage.py runserver 0.0.0.0:8000


