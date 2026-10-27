CREATE TABLE sak
(
    digisos_id      UUID PRIMARY KEY,
    fiks_org_id     UUID        NOT NULL,
    kilde           TEXT        NOT NULL CHECK (kilde IN ('FIKS_IO', 'OPPRETTET')),
    ekstern_ref     TEXT,
    fiks_io_melding UUID,
    digisos_soker   JSONB,
    opprettet       TIMESTAMPTZ NOT NULL DEFAULT now(),
    oppdatert       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX sak_opprettet_idx ON sak (opprettet DESC);
