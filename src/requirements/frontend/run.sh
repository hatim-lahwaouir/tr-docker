#!/bin/sh



cd /app/frontend
npm i
npm audit fix

exec npm run dev