#!/usr/bin/env bash
set -euo pipefail

# ----------------------------
# 1. Load environment variables
# ----------------------------
FRONTEND_TEST_ENV="NEXT_PUBLIC_API_URL=http://localhost:8080
BASE_URL=http://localhost:3000
NEXT_PUBLIC_RECAPTCHA_SITE_KEY='"$NEXT_PUBLIC_RECAPTCHA_SITE_KEY"'
NEXT_PUBLIC_RECAPTCHA_SECRET_KEY='"$NEXT_PUBLIC_RECAPTCHA_SECRET_KEY"''"

# Export frontend env vars
echo "Loading frontend environment variables..."
while IFS= read -r line; do
  export "$line"
done <<< "$FRONTEND_TEST_ENV"

# ----------------------------
# 2. Debug environment variables
# ----------------------------
echo "Environment variables loaded:"
echo "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"
echo "BASE_URL=$BASE_URL"

# # ----------------------------
# # 3. Build frontend Docker image
# # ----------------------------
echo "Building frontend Docker image..."
printf "%s\n" "$FRONTEND_TEST_ENV" > .env
docker build . -f ./Dockerfile --tag frontend:latest

# # ----------------------------
# # 4. Run frontend container
# # ----------------------------
echo "Starting frontend container..."
docker run -d --name frontend_test -p 3000:3000 --env-file <(echo "$FRONTEND_TEST_ENV") frontend:latest