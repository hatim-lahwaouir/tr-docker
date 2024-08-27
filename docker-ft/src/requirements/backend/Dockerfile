FROM debian:11


COPY --chmod=111 setup.sh /tmp/

COPY --chmod=111 run.sh /tmp/

COPY --chmod=444  requirements.txt /tmp/


RUN /tmp/setup.sh

ENTRYPOINT ["/tmp/run.sh"]
