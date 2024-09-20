FROM alpine:3.18
EXPOSE 8000

COPY --chmod=111 setup.sh /tmp/

COPY --chmod=111 run.sh /tmp/

COPY --chmod=444  requirements.txt /



ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1


RUN ["apk", "update"]
RUN ["apk", "add", "python3"]
RUN ["apk", "add", "py-pip"]

RUN ["pip3", "install" , "-r", "requirements.txt"]



ENTRYPOINT ["/tmp/run.sh"]
