FROM mcr.microsoft.com/playwright:v1.47.0-jammy

# Install Allure CLI globally
RUN npm install -g allure-commandline --save-dev

# Copy package files and install deps
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npx playwright install --with-deps

# Copy all test files
COPY . .

# Set environment variables for shards (default 1/1 if not set)
ENV SHARD_ID=1
ENV TOTAL_SHARDS=1

# Entrypoint will run the shard
ENTRYPOINT ["sh", "-c", "npx playwright test --shard=${SHARD_ID}/${TOTAL_SHARDS} --reporter=line,allure-playwright"]
