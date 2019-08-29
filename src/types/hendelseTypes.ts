interface Hendelse {
    type: HendelseType;
    hendelsestidspunkt: string;
}

export interface tildeltNavKontor extends Hendelse {
    navKontor: string;
}
export interface soknadsStatus extends Hendelse {
    status: SoknadsStatus
}
export interface vedtakFattet extends Hendelse {
    saksreferanse: string;
    utfall: { utfall: Utfall };
    vedtaksfil: { referanse: Filreferanse};
    vedlegg: Vedlegg[]
}
export interface dokumentasjonEtterspurt extends Hendelse {
    forvaltningsbrev: Forvaltningsbrev;
    vedlegg: Vedlegg[];
    dokumenter: Dokument[];
}
export interface forelopigSvar extends Hendelse {
    forvaltningsbrev: Forvaltningsbrev;
    vedlegg: Vedlegg[];
}
export interface saksStatus extends Hendelse {
    referanse: string;
    tittel: string;
    status: SaksStatus;
}
export interface utbetaling extends Hendelse {
    // FIXME: fullfør implementasjon
}
export interface vilkar extends Hendelse {
    utbetalingsreferanse: string[];
    beskrivelse: string;
    status: VilkarStatus;
}
export enum VilkarStatus {
    OPPFYLT = "OPPFYLT",
    IKKE_OPPFYLT = "IKKE_OPPFYLT"
}
export interface rammevedtak extends Hendelse {
    rammevedtaksreferanse: string;
    saksreferanse: string;
    beskrivelse: string;
    belop: string;
    fom: string;
    tom: string;
}


export enum HendelseType {
    tildeltNavKontor = "tildeltNavKontor",
    soknadsStatus = "soknadsStatus",
    vedtakFattet = "vedtakFattet",
    dokumentasjonEtterspurt = "dokumentasjonEtterspurt",
    forelopigSvar = "forelopigSvar",
    saksStatus = "saksStatus",
    utbetaling = "utbetaling",
    vilkar = "vilkar",
    rammevedtak = "rammevedtak"
}

export enum SoknadsStatus {
    MOTTATT = "MOTTATT",
    UNDER_BEHANDLING = "UNDER_BEHANDLING",
    FERDIGBEHANDLET = "FERDIGBEHANDLET",
    BEHANDLES_IKKE = "BEHANDLES_IKKE"
}

export enum Utfall {
    INNVILGET = "INNVILGET",
    DELVIS_INNVILGET = "DELVIS_INNVILGET",
    AVSLATT = "AVSLATT",
    AVVIST = "AVVIST"
}

export enum SaksStatus {
    UNDER_BEHANDLING = "UNDER_BEHANDLING",
    IKKE_INNSYN = "IKKE_INNSYN",
    BEHANDLES_IKKE = "BEHANDLES_IKKE",
    FEILREGISTRERT = "FEILREGISTRERT"
}


export interface Filreferanse {
    type: FilreferanseType
}

export enum FilreferanseType {
    svarut = "svarut",
    dokumentlager = "dokumentlager"
}

export interface Vedlegg {
    tittel: string;
    referanse: Filreferanse;
}

export interface Forvaltningsbrev {
    referanse: Filreferanse;
}

export interface Dokument {
    dokumenttype: string;
    tilleggsinformasjon: string;
    innsendelsesfrist: string;
}

export default Hendelse;