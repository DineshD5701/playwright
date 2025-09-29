# Use latest Playwright base image with Node + browsers preinstalled
FROM mcr.microsoft.com/playwright:v1.55.0-jammy

# Install Allure CLI globally
RUN npm install -g allure-commandline --omit=dev

# Install Java (needed for Allure reports)
RUN apt-get update && apt-get install -y openjdk-17-jdk wget gnupg && rm -rf /var/lib/apt/lists/*
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="$JAVA_HOME/bin:$PATH"

# (Optional) Install Google Chrome Stable
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" \
       > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --omit=dev
RUN npm install allure-playwright --save-dev

# Install all Playwright browsers
RUN npx playwright install

# Copy project files
COPY . .

# Copy Python script for sending reports
COPY send_report.py ./send_report.py

# Default environment variables (can be overridden at runtime)
ENV SHARD_ID=1
ENV TOTAL_SHARDS=1
ENV EMAIL_USER="dinesh.d@kapturecrm.com"
ENV EMAIL_PASS="zrghcflacjmrjslz"
ENV GCHAT_WEBHOOK="https://chat.googleapis.com/v1/spaces/AAQAd4smdEA/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=YDUnIOtCMz0BHRJJ2ECAEQTSji29soI4EwsCHyiLAyc"

# Run tests, generate Allure report, then send report
ENTRYPOINT ["sh", "-c", "\
    npx playwright test --shard=${SHARD_ID}/${TOTAL_SHARDS} --reporter=line,allure-playwright || true && \
    npx allure generate allure-results --clean -o allure-report && \
    python3 send_report.py \
"]
