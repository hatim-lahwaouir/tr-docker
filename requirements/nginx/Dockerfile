FROM nginx:stable-alpine3.20-otel
USER root
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d


RUN ["apk", "update"]
RUN ["apk", "add", "nodejs"]
RUN ["apk", "add", "npm"]

COPY  app  /app
WORKDIR  "/app/frontend/"
ARG BACKEND_HOST
ENV BACKEND_HOST=${BACKEND_HOST}
ARG URL_42
ENV URL_42=${URL_42}



RUN echo "export const theHost = 'https://$BACKEND_HOST'; \
export const port = 443; \
export const wsHost = '$BACKEND_HOST'; \
export const url42 = '$URL_42';" > /app/frontend/src/config.ts



RUN ["npm", "i"]
RUN ["npm", "run", "build"]

COPY --chmod=111 certif_setup.sh /tmp/
RUN ["/tmp/certif_setup.sh"]




EXPOSE 443