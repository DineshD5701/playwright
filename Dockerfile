# Use official Playwright image with all deps and browsers
FROM mcr.microsoft.com/playwright:v1.53.1-jammy

WORKDIR /app

# Copy package info and install dependencies
COPY package.json package-lock.json* ./
RUN npm install
RUN npx playwright install chrome
RUN npx playwright install --with-deps

# Copy test code
COPY . .

# Default: run tests in headless mode
CMD ["npx", "playwright", "test"]