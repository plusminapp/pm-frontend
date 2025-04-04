#!/usr/bin/env zsh
set -x
export $(cat lcl.env | xargs)

UNAMEOUT="$(uname -a)"
case "${UNAMEOUT}" in
    Linux*amd64*)     machine=linux/amd64;;
    Darwin*amd64*)    machine=linux/amd64;;
    Linux*aarch64*)   machine=linux/arm64;;
    Darwin*arm64*)    machine=linux/arm64;;
    CYGWIN*)          machine=Cygwin;;
    MINGW*)           machine=MinGw;;
    MSYS_NT*)         machine=MSys;;
    *)                machine="UNKNOWN:${UNAMEOUT}"
esac

PLATFORM=${machine}
VERSION=0.0.1
PROJECT_FOLDER=$PWD
DOCKERCOMMAND=$(which docker)
LINUXDOCKER=`$(which uname) -sr`
GITHOME=$(which git)

pushd ${PROJECT_FOLDER}


if [[ "${UNAMEOUT}" == *"Linux"* ]]; then
 docker buildx build \
     --no-cache \
     --platform=$PLATFORM \
     --build-arg PORT=${PORT} \
     --build-arg STAGE=${STAGE} \
     -t plusmin/pm-frontend-devcontainer:${VERSION} .
else 
# alleen mac want nog geen windows
 docker-buildx build \
     --no-cache \
     --platform=$PLATFORM \
     --build-arg PORT=${PORT} \
     --build-arg STAGE=${STAGE} \
     --load \
     -t plusmin/pm-frontend-mac:${VERSION} .
fi

popd