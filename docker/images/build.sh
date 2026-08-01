#!/bin/bash

# Build all CodeLab execution Docker images

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔨 Building CodeLab execution images..."

echo "Building C++ image..."
docker build -t codelab-cpp:latest -f "$SCRIPT_DIR/Dockerfile.cpp" "$SCRIPT_DIR"

echo "Building Python image..."
docker build -t codelab-python:latest -f "$SCRIPT_DIR/Dockerfile.python" "$SCRIPT_DIR"

echo "Building Java image..."
docker build -t codelab-java:latest -f "$SCRIPT_DIR/Dockerfile.java" "$SCRIPT_DIR"

echo "Building JavaScript image..."
docker build -t codelab-javascript:latest -f "$SCRIPT_DIR/Dockerfile.javascript" "$SCRIPT_DIR"

echo "✅ All images built successfully!"
echo ""
echo "Images created:"
docker images | grep codelab
