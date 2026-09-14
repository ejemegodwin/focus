FROM node:22-bookworm AS frontend

WORKDIR /frontend

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.js ./
COPY src ./src
RUN npm run build

FROM golang:1.22-bookworm

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=frontend /frontend/dist ./dist
COPY backend ./backend

ENV HOST=0.0.0.0
ENV PYTHONUNBUFFERED=1

CMD ["python3", "backend/server.py"]
