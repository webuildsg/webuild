#! /bin/bash
curl -X POST --data "secret=$WEBUILD_API_SECRET" $WEBUILD_URL/api/v1/events/update
curl -X POST --data "secret=$WEBUILD_API_SECRET" $WEBUILD_URL/api/v1/repos/update
