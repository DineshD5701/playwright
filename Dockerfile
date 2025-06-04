# Use Node.js 14 as base
FROM mcr.microsoft.com/playwright:focal

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Install Playwright and its dependencies
RUN npx playwright install --with-deps

# Copy the rest of your code
COPY . .

# Expose app port (optional if you're not serving anything)
EXPOSE 3000

# Run Playwright tests by default
CMD ["npx", "playwright", "test"]
