# Pin to specific version
FROM wiremock/wiremock:2.32.0-alpine

ENV JAVA_OPTS="-Dfile.encoding=UTF-8 -server -Xms1G -Xmx1G -XX:NewRatio=3 -XX:+DisableExplicitGC"

# Specify working directory
WORKDIR /home/wiremock

COPY __files/ __files
COPY mappings/ mappings

EXPOSE 8080 8443

CMD ["--local-response-templating","--no-request-journal","--container-threads","100","--jetty-acceptor-threads","4","--jetty-accept-queue-size","100","--jetty-header-buffer-size","16384","--async-response-enabled","true","--async-response-threads","10","--disable-request-logging"]
