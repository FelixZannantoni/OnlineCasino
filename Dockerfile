# Stage 1: Build Frontend
FROM node:22-slim AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend & Compile Native Modules
FROM node:22-slim AS backend-build
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npm rebuild better-sqlite3

# Stage 3: Final Production Image
FROM node:22-slim
WORKDIR /app

# Copy Backend
COPY --from=backend-build /app ./

# Improved Frontend Asset Management:
# 1. Copy the entire dist folder to public
COPY --from=frontend-build /frontend/dist/frontend ./public
# 2. If 'browser' folder exists (typical in SSR), move its contents up and clean up
RUN if [ -d "./public/browser" ]; then \
      cp -r ./public/browser/* ./public/ && \
      rm -rf ./public/browser ./public/server; \
    fi

RUN mkdir -p resources/sample_data

EXPOSE 3000
CMD ["npm", "run", "dev"]
