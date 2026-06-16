FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY --from=builder /app/dist ./dist

EXPOSE 4000
ENV PORT=4000
CMD ["npm", "run", "serve:ssr:frontend"]
