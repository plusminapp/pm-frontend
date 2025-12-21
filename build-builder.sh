#!/bin/bash

# Build de builder image voor pm-frontend
echo "Building pm-frontend-builder image..."
echo "Using LCL_PLATFORM: ${LCL_PLATFORM}"
docker build --platform=$LCL_PLATFORM -f Dockerfile.builder -t plusmin/pm-frontend-builder:latest . 