FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app

# Install 'serve' globally to host static files
RUN npm install -g serve

COPY --from=builder /app/dist/frontend/browser ./dist

EXPOSE 4000
ENV PORT=4000
CMD ["serve", "-s", "dist", "-l", "4000"]
