#! /bin/bash

# Run firebase db backup at 2am Sunday every week
day=$(date '+%a')
hour=$(date '+%H')

if [ $hour == 02 ] && [ $day == 'Sun' ]; then
	curl -X POST --data "secret=$WEBUILD_API_SECRET" $WEBUILD_URL/api/v1/backups/update
	curl -X DELETE --data "secret=$WEBUILD_API_SECRET" $WEBUILD_URL/api/v1/events/cleanup
fi
