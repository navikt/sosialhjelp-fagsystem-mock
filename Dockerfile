FROM gcr.io/distroless/nodejs22-debian12 AS runtime


WORKDIR /app

COPY package.json /app/
COPY .env /app/
COPY .next/standalone /app/
COPY .next/static /app/.next/static
COPY public /app/public/

EXPOSE 3000

ENV NODE_ENV=production

CMD ["server.js"]
