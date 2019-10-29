FROM node as node-builder
ADD / /source
WORKDIR /source
ENV CI=false
RUN npm ci && npm run test && npm run build

COPY --from=node-builder /source/build /app
