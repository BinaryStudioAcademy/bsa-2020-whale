FROM node:alpine AS builder

WORKDIR /app

COPY frontend .

RUN npm install && \
    npm run build

FROM nginx:alpine

COPY --from=builder /app/dist/frontend/* /usr/share/nginx/html/
COPY --from=builder /app/dist/frontend/assets/img/* /usr/share/nginx/html/assets/img/
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf