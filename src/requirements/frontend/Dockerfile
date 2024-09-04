FROM alpine:3.18

EXPOSE 5173




RUN ["apk", "update"]
RUN ["apk", "add", "nodejs"]
RUN ["apk", "add", "npm"]

COPY --chmod=777 ./app/frontend/package.json /
RUN ["npm", "i"]
RUN ["npm", "audit", "fix"]

COPY --chmod=111 run.sh /tmp/


CMD ["/tmp/run.sh"]
