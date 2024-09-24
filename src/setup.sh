#!/bin/bash
cp -R ft_transcendence ./requirements/backend/app

cp -R ft_transcendence ./requirements/nginx/app

cd ./requirements/backend/app && git switch backend

cd ../../nginx/app && git switch frontend
