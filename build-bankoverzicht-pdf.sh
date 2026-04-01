#!/usr/bin/env bash

PROJECT_FOLDER=${PWD}/..

pushd 	${PROJECT_FOLDER}/pm-frontend/public/docs/budgetscanner/

./genereer.sh 2> /dev/null

popd