FROM nginx:stable-alpine3.20-otel

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d


RUN ["apk", "update"]
RUN ["apk", "add", "nodejs"]
RUN ["apk", "add", "npm"]

COPY  app  /app
COPY .env /app/frontend/
WORKDIR  "/app/frontend/"
RUN ["npm", "i"]
RUN ["npm", "run", "build"]

COPY --chmod=111 certif_setup.sh /tmp/

RUN ["/tmp/certif_setup.sh"]

EXPOSE 443