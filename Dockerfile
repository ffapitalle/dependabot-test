# We propose to use the image of the creator of K6, Load Impact AB.
FROM grafana/k6:0.44.1
ARG JARVIS_COMPONENT_ID
ARG APPNAME
ENV JARVIS_COMPONENT_ID=$JARVIS_COMPONENT_ID
ENV APPNAME=$APPNAME
# The scripts and data sets(in .csv format) must be made available in the "script" folder.

COPY ./script/ script/
COPY ./script/k6run.sh /usr/bin/k6run.sh
USER root
RUN chmod +x /usr/bin/k6run.sh
USER k6

# Datadog integration

WORKDIR script

ENTRYPOINT ["sh","-c"]

#The following command allows running a k6 script, where the name is passed through an environment variable (key: script, value: <script_name.js >) 
CMD ["k6run.sh"]
