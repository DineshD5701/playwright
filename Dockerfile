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

# Copy Python script for sending reports
COPY send_report.py ./send_report.py

# Default shard envs
ENV SHARD_ID=1
ENV TOTAL_SHARDS=1
ENV EMAIL_USER="dinesh.d@kapturecrm.com"
ENV EMAIL_PASS="zrghcflacjmrjslz"
ENV GCHAT_WEBHOOK="https://chat.googleapis.com/v1/spaces/AAQAd4smdEA/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=YDUnIOtCMz0BHRJJ2ECAEQTSji29soI4EwsCHyiLAyc"


ENTRYPOINT ["sh", "-c", "\
    npx playwright test --shard=${SHARD_ID}/${TOTAL_SHARDS} --reporter=line,allure-playwright || true && \
    npx allure generate allure-results --clean -o allure-report && \
    python3 send_report.py \
"]
