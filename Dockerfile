FROM mcr.microsoft.com/playwright:v1.47.0-jammy-slim AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

# Final runtime
FROM mcr.microsoft.com/playwright:v1.47.0-jammy-slim
WORKDIR /app

COPY --from=build /app /app
RUN npx playwright install --with-deps chromium
RUN npm install -g allure-commandline

ENV SHARD_ID=1
ENV TOTAL_SHARDS=1

ENTRYPOINT ["sh", "-c", "npx playwright test --shard=${SHARD_ID}/${TOTAL_SHARDS} --reporter=line,allure-playwright || true"]
