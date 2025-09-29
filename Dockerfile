# Use the latest Playwright image
FROM mcr.microsoft.com/playwright:v1.55.0-jammy

# Install Allure CLI globally
RUN npm install -g allure-commandline --omit=dev

# Install Google Chrome Stable
RUN apt-get update && apt-get install -y wget gnupg \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" \
       > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update && apt-get install -y google-chrome-stable python3 python3-pip zip \
    && rm -rf /var/lib/apt/lists/*

# Ensure Playwright registers Chrome
RUN npx playwright install chrome

# Set working directory
WORKDIR /app

# Copy only package files first for caching
COPY package*.json ./
RUN npm ci --omit=dev
RUN npm install allure-playwright --save-dev

# Copy the rest of the files
COPY . .

# Copy Python script for sending reports
COPY send_report.py ./send_report.py

# Default shard envs
ENV SHARD_ID=1
ENV TOTAL_SHARDS=1
ENV EMAIL_USER="dinesh.d@kapturecrm.com"
ENV EMAIL_PASS="zrghcflacjmrjslz"
ENV GCHAT_WEBHOOK="https://chat.googleapis.com/v1/spaces/AAQAd4smdEA/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=YDUnIOtCMz0BHRJJ2ECAEQTSji29soI4EwsCHyiLAyc"

# Run tests, generate Allure report, then send via email/Google Chat
ENTRYPOINT ["sh", "-c", "\
    npx playwright test --shard=${SHARD_ID}/${TOTAL_SHARDS} --reporter=line,allure-playwright || true && \
    npx allure generate allure-results --clean -o allure-report && \
    python3 send_report.py \
"]
