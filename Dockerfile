FROM golang:1.22-bookworm

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends nodejs npm python3 \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV HOST=0.0.0.0
ENV PYTHONUNBUFFERED=1

CMD ["python3", "backend/server.py"]
