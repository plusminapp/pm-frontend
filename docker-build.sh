#!/usr/bin/env bash

echo pm-frontend version: ${VERSION}
echo platform: ${PLATFORM}
echo PORT: ${PORT}
echo STAGE: ${STAGE}

pushd ${PROJECT_FOLDER}/pm-frontend

docker build \
     --no-cache \
     --platform=$PLATFORM \
     --build-arg PORT=${PORT} \
     --build-arg STAGE=${STAGE} \
     -t rimvanvliet/pm-frontend:${VERSION} .

popd