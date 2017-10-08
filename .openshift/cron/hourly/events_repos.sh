#! /bin/bash

# Run archival at 3am every day
hour=$(date '+%H')
if [ $hour == 03 ]; then
	curl -X POST --data "secret=$WEBUILD_API_SECRET" $WEBUILD_URL/api/v1/archives/update
fi

# Run update every hour
curl -X POST --data "secret=$WEBUILD_API_SECRET" $WEBUILD_URL/api/v1/events/update
curl -X POST --data "secret=$WEBUILD_API_SECRET" $WEBUILD_URL/api/v1/repos/update
