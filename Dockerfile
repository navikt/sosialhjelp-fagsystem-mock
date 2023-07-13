FROM node:20-alpine
ADD / /source
WORKDIR /source
ENV CI=false

# && npm run test
RUN npm ci  && npm run build && npm install express

CMD ["node", "server.js"]
