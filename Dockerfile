FROM node as node-builder
ADD / /source
WORKDIR /source
ENV CI=false

# && npm run test
RUN npm ci  && npm run build && npm install express

CMD ["node", "heroku.js"]
