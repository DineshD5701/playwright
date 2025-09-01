FROM mcr.microsoft.com/playwright:v1.47.0-jammy

# Install Allure CLI globally (use prod install, not dev)
RUN npm install -g allure-commandline

# Workdir
WORKDIR /app

# Copy only package files first (to leverage Docker cache)
COPY package*.json ./
RUN npm ci --omit=dev

# Install ONLY required Playwright browsers (skip duplicates)
RUN npx playwright install --with-deps chromium

# Copy tests after deps are installed
COPY . .

# Set env variables
ENV SHARD_ID=1
ENV TOTAL_SHARDS=1

# Entrypoint
ENTRYPOINT ["sh", "-c", "npx playwright test --shard=${SHARD_ID}/${TOTAL_SHARDS} --reporter=line,allure-playwright || true"]

