#!/usr/bin/env bash

echo pm-frontend version: ${VERSION}
echo lcl_platform: ${LCL_PLATFORM}
echo platform: ${PLATFORM}
echo PORT: ${PORT}
echo STAGE: ${STAGE}

pushd ${PROJECT_FOLDER}/pm-frontend

# Set Docker BuildKit with plain output
export DOCKER_BUILDKIT=1
export BUILDKIT_PROGRESS=plain

# Check if builder image exists, if not build it
if [[ "$(docker images -q plusmin/pm-frontend-builder:latest 2> /dev/null)" == "" ]]; then
    echo "Builder image not found, building pm-frontend-builder..."
    ./build-builder.sh
else
    echo "Builder image found, using existing pm-frontend-builder..."
fi

docker build \
     --no-cache \
     --platform=$PLATFORM \
     --build-arg PORT=${PORT} \
     --build-arg STAGE=${STAGE} \
     --build-arg NPM_CONFIG_UNSAFE_PERM=true \
     --progress=plain \
     -t plusmin/pm-frontend:${VERSION} .

popd