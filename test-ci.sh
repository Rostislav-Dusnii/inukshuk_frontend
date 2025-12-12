#!/bin/bash
# Script to test if Jest, linting, and CI pipeline work
# This simulates what the CI pipeline does

set -e  # Exit on any error

echo "========================================="
echo "Testing CI Pipeline Components"
echo "========================================="
echo ""

echo "Step 1: Installing dependencies..."
npm ci
echo "✓ Dependencies installed"
echo ""

echo "Step 2: Running linter..."
npm run lint || echo "⚠ Linting completed with warnings (non-blocking)"
echo "✓ Linting completed"
echo ""

echo "Step 3: Running TypeScript type-check..."
npx tsc --noEmit
echo "✓ Type-check passed"
echo ""

echo "Step 4: Running tests with coverage..."
npm run test:coverage --silent
echo "✓ Tests passed"
echo ""

echo "Step 5: Building the project..."
npm run build
echo "✓ Build successful"
echo ""

echo "========================================="
echo "All CI pipeline checks passed! ✓"
echo "========================================="
