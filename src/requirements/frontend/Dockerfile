FROM alpine:3.18



COPY --chmod=111 setup.sh /tmp/
COPY --chmod=111 run.sh /tmp/
COPY --chmod=444 package-lock.json  / 
COPY --chmod=444 package.json  /

RUN ["/tmp/setup.sh"]


ENTRYPOINT ["/tmp/run.sh"]
