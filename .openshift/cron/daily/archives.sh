#! /bin/bash
curl -X POST --data "secret=$WEBUILD_API_SECRET" $OPENSHIFT_IOJS_IP:$OPENSHIFT_IOJS_PORT/api/v1/archives/update
