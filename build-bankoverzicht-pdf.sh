#!/usr/bin/env bash

PROJECT_FOLDER=${PWD}/..

pushd 	${PROJECT_FOLDER}/pm-frontend/public/docs/bankoverzicht/

./genereer.sh 2> /dev/null

popd