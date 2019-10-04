FROM node as node-builder
ADD / /source
WORKDIR /source
ENV CI=false
RUN npm ci && npm run test && npm run build

FROM navikt/pus-decorator
ENV APPLICATION_NAME=sosialhjelp-fagsystem-mock
ENV HEADER_TYPE=WITH_MENU
ENV FOOTER_TYPE=WITHOUT_ALPHABET
ENV CONTEXT_PATH=/sosialhjelp/fagsystem-mock/
COPY --from=node-builder /source/build /app
