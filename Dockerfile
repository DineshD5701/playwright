FROM mcr.microsoft.com/playwright:v1.47.0-jammy

# Install only Allure CLI
RUN npm install -g allure-commandline@2.29.0 --no-audit --no-fund

# Set working directory
WORKDIR /app

# Install only project dependencies
COPY package*.json ./
RUN npm ci --only=prod --no-audit --no-fund

# Copy test files
COPY . .

# Environment vars for sharding
ENV SHARD_ID=1
ENV TOTAL_SHARDS=1

# Run Playwright tests with Allure reporting
ENTRYPOINT ["sh", "-c", "npx playwright test --shard=${SHARD_ID}/${TOTAL_SHARDS} --reporter=line,allure-playwright"]
