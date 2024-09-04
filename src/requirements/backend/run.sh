#!/bin/sh
cd /app/backend/


python3 manage.py makemigrations
python3 manage.py makemigrations Models
python3 manage.py migrate
python3 manage.py migrate Models
python manage.py showmigrations


exec python3 manage.py runserver 0.0.0.0:8000
