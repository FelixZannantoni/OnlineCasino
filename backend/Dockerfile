# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app ./

# Create resources directory for SQLite
RUN mkdir -p resources/sample_data

EXPOSE 3000

CMD ["npm", "run", "dev"]
