#!/bin/bash
cd /app/backend_app/


python3 manage.py makemigrations
python3 manage.py migrate



exec python3 manage.py runserver
