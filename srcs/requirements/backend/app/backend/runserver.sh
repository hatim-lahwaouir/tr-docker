#!/bin/bash


source ../venv/bin/activate
python3 manage.py makemigrations Models
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py runscript run
python3 manage.py runserver 0.0.0.0:80
