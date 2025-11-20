#!/usr/bin/env bash

echo pm-frontend version: ${VERSION}
echo platform: ${PLATFORM}
echo PORT: ${PORT}
echo STAGE: ${STAGE}

pushd ${PROJECT_FOLDER}/pm-frontend

# Set Docker BuildKit with plain output
export DOCKER_BUILDKIT=1
export BUILDKIT_PROGRESS=plain

docker build \
     --no-cache \
     --platform=$PLATFORM \
     --build-arg PORT=${PORT} \
     --build-arg STAGE=${STAGE} \
     --build-arg NPM_CONFIG_UNSAFE_PERM=true \
     --progress=plain \
     -t plusmin/pm-frontend:${VERSION} .

popd