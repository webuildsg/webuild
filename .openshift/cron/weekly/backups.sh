#! /bin/bash

# Run firebase db backup at 2am weekly
hour=$(date '+%H')
if [ $hour == 02 ]; then
	curl -X POST --data "secret=$WEBUILD_API_SECRET" $WEBUILD_URL/api/v1/backups/update
fi
