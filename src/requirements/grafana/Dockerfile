FROM grafana/grafana-oss:latest

USER root
COPY --chmod=777 datasource.yml  /etc/grafana/provisioning/datasources

COPY --chmod=666 django_Dashboard.json /var/lib/grafana/dashboards/
COPY --chmod=666 nginx_Dashboard.json /var/lib/grafana/dashboards/

COPY --chmod=666 dashboards.yml /etc/grafana/provisioning/dashboards/