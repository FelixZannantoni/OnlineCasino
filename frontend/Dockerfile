# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy the build output
COPY --from=build /app/dist/frontend ./dist/frontend
COPY --from=build /app/package*.json ./
RUN npm install --omit=dev

EXPOSE 4000

# Command to run the SSR server
CMD ["npm", "run", "serve:ssr:frontend"]
