#!/bin/sh
#This sleep is necessary in case the test use WireMock, otherwise, it can be deleted. 
sleep 120
DATE=`date`
echo "Starting performance test ...$ENV"
[[ $ENV = "dev" ]] && k6 run -e ENV="$ENV" $SCRIPT --tag test_run_id=$SCRIPT
[[ ! $ENV = "dev" ]] && K6_STATSD_ENABLE_TAGS=true K6_STATSD_ADDR="$DD_AGENT_HOST:8125" k6 run $SCRIPT -e ENV="$ENV" --out statsd --tag test_run_id=$SCRIPT --tag jarvis_component_id="$JARVIS_COMPONENT_ID" --tag date="$DATE" --tag appname="$APPNAME"
