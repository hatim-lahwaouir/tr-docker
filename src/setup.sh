#!/bin/bash
cp -R ft_transcendence ./requirements/backend/app

cp -R ft_transcendence ./requirements/frontend/app

cd ./requirements/backend/app && git switch backend

cd ../../frontend/app && git switch frontend
