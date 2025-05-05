# Sosialhjelp fagsystem-mock
## Supermoney granter
Supereffektivt fagsystem for rask og korrekt behandling av sosialsøknader.

#### Manuell deploy:
Gjøres via Github Actions, se: https://github.com/navikt/sosialhjelp-fagsystem-mock/actions/workflows/deploy_dev.yml

#### Lokal server

```shell
npm install # Hent avhengigheter
npm run dev #  starter dev-server
npm test # Kjør enhetstestene
```

#### Miljøvariabler

Lag `.env.local` på rot for miljøvariabler. Eksempel:

```
NEXT_PUBLIC_RUNTIME_ENVIRONMENT=local
```