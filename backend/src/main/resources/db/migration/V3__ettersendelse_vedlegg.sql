CREATE TABLE ettersendelse_vedlegg
(
    id                  BIGSERIAL PRIMARY KEY,
    digisos_id          UUID        NOT NULL REFERENCES sak (digisos_id),
    fiks_io_melding_id  UUID        NOT NULL,
    posisjon            INT         NOT NULL,
    ekstern_ref         TEXT,
    type                TEXT,
    tilleggsinfo        TEXT,
    hendelse_type       TEXT,
    hendelse_referanse  TEXT,
    status              TEXT,
    antall_filer        INT         NOT NULL,
    mottatt             TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (fiks_io_melding_id, posisjon)
);

CREATE INDEX ettersendelse_vedlegg_digisos_id_idx ON ettersendelse_vedlegg (digisos_id);
