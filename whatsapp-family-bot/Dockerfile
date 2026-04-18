FROM node:20-slim AS builder

WORKDIR /app
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package*.json tsconfig.json vitest.config.ts ./
RUN npm ci --ignore-scripts

COPY src ./src
COPY test ./test
RUN npm run build

FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    fonts-noto-color-emoji \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    ca-certificates \
    tini \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN mkdir -p /data/wwebjs_auth /data/store \
    && chown -R node:node /data /app

USER node

ENV DATA_DIR=/data/store \
    WWEBJS_AUTH_DIR=/data/wwebjs_auth

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/index.js"]
