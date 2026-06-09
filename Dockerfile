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
COPY --from=frontend-build /frontend/dist/frontend ./public

# Fix für fehlende index.html bei Angular SSR/Prerendering
RUN if [ -d "./public/browser" ]; then \
      cp -r ./public/browser/* ./public/ && \
      # Falls keine index.html im Root ist, nimm die index.csr.html oder die aus dem login-Ordner
      if [ ! -f "./public/index.html" ]; then \
        if [ -f "./public/index.csr.html" ]; then \
          cp ./public/index.csr.html ./public/index.html; \
        elif [ -f "./public/login/index.html" ]; then \
          cp ./public/login/index.html ./public/index.html; \
        fi \
      fi && \
      rm -rf ./public/browser ./public/server; \
    fi

RUN mkdir -p resources/sample_data

EXPOSE 3000
CMD ["npm", "run", "dev"]
