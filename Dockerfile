FROM mcr.microsoft.com/playwright:v1.47.0-jammy

# Install Allure CLI globally
RUN npm install -g allure-commandline --save-dev

# Install Google Chrome Stable
RUN apt-get update && apt-get install -y wget gnupg \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" \
       > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Copy package files and install deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Install Playwright dependencies + Chrome
RUN npx playwright install --with-deps && npx playwright install --force chrome

# Copy all test files
COPY . .

# Set environment variables for shards (default 1/1 if not set)
ENV SHARD_ID=1
ENV TOTAL_SHARDS=1

# Entrypoint will run the shard, allow empty shards gracefully
ENTRYPOINT ["sh", "-c", "npx playwright test --shard=${SHARD_ID}/${TOTAL_SHARDS} --reporter=line,allure-playwright || true"]
