# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-build
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
# We don't need a specific build step if using tsx/dev mode, 
# but let's prepare the structure.

# Stage 3: Final Production Image
FROM node:20-alpine
WORKDIR /app

# Copy Backend
COPY --from=backend-build /app ./
# Copy Frontend Build to Backend's public folder
COPY --from=frontend-build /frontend/dist/frontend/browser ./public

EXPOSE 3000

# Run Backend (which now serves Frontend)
CMD ["npm", "run", "dev"]
