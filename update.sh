#!/bin/sh

foreman run curl --data "secret=${WEBUILD_API_SECRET}" http://localhost:4000/api/v1/events/update
foreman run curl --data "secret=${WEBUILD_API_SECRET}" http://localhost:4000/api/v1/repos/update
