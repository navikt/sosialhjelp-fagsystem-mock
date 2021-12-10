FROM node:16-alpine
ADD / /source
WORKDIR /source
ENV CI=false

# && npm run test
RUN npm ci  && npm run build && npm install express

CMD ["node", "q.js"]
