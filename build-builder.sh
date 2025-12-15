#!/bin/bash

# Build de builder image voor pm-frontend
echo "Building pm-frontend-builder image..."
docker build -f Dockerfile.builder -t plusmin/pm-frontend-builder:latest .