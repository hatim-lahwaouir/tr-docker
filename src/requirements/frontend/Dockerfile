FROM alpine:3.18

EXPOSE 5173




RUN ["apk", "update"]
RUN ["apk", "add", "nodejs"]
RUN ["apk", "add", "npm"]

COPY --chmod=111 run.sh /tmp/


CMD ["/tmp/run.sh"]
