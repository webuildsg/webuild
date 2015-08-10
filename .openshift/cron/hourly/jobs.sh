#! /bin/bash
curl -X POST --data "secret=$WEBUILD_API_SECRET" http://staging-webuildsg.rhcloud.com/api/v1/events/update
curl -X POST --data "secret=$WEBUILD_API_SECRET" http://staging-webuildsg.rhcloud.com/api/v1/repos/update
curl -X POST --data "secret=$WEBUILD_API_SECRET" http://staging-webuildsg.rhcloud.com/api/v1/archives/update
