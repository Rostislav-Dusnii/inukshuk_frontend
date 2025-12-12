#!/usr/bin/env bash
set -euo pipefail
BACKEND_FOLDER="${1:-../back-end-team40}"
if [ ! -d "$BACKEND_FOLDER" ]; then
  echo "Error: Backend folder '$BACKEND_FOLDER' does not exist."
  exit 1
fi

echo "Using backend folder: $BACKEND_FOLDER"

# ----------------------------
# 1. Load environment variables
# ----------------------------

BACKEND_TEST_ENV="JWT_SECRET=my-super-secret-jwt-key-for-development-only-change-in-production-12345678
CORS_ALLOWED_ORIGINS=http://localhost:3000"

# Export backend env vars
echo "Loading backend environment variables..."
while IFS= read -r line; do
  export "$line"
done <<< "$BACKEND_TEST_ENV"

# ----------------------------
# 2. Debug environment variables
# ----------------------------
echo "Environment variables loaded:"
echo "CORS_ALLOWED_ORIGINS=$CORS_ALLOWED_ORIGINS"
echo "JWT_SECRET=$JWT_SECRET"
# echo "DATASOURCE_DBNAME=$DATASOURCE_DBNAME"
# echo "DATASOURCE_URL=$DATASOURCE_URL"
# echo "DATASOURCE_USERNAME=$DATASOURCE_USERNAME"
# echo "DATASOURCE_PASSWORD=$DATASOURCE_PASSWORD"
# echo "DATASOURCE_TYPE=$DATASOURCE_TYPE"

# # ----------------------------
# # 3. Build backend Docker image
# # ----------------------------
echo "Building backend Docker image from '$BACKEND_FOLDER'..."
docker build "$BACKEND_FOLDER" -f "$BACKEND_FOLDER/Dockerfile" --tag backend:latest

# # ----------------------------
# # 4. Run backend container
# # ----------------------------
echo "Starting backend container..."
docker run -d --name backend_test -p 8080:8080 --env-file <(echo "$BACKEND_TEST_ENV") backend:latest

# # ----------------------------
# # 5. Verify backend is running
# # ----------------------------
echo "Waiting for backend to start..."
timeout=60
elapsed=0
while ! curl -s -f -o /dev/null http://localhost:8080/status; do
  sleep 3
  elapsed=$((elapsed + 3))
  if [ "$elapsed" -ge "$timeout" ]; then
    echo "Backend failed to start within $timeout seconds"
    docker logs backend_test
    exit 1
  fi
done

echo "Backend is up and running!"
