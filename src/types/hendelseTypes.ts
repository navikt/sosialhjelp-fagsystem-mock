export interface FiksDigisosSokerJson {
    "sak" : {
        "soker": DigisosSokerJson
    }
    "type": string
}

export interface DigisosSokerJson {
    "version": Version,
    "avsender": Avsender,
    "hendelser": Hendelse[]
}

export type Hendelse
    = soknadsStatus
    | vedtakFattet
    | tildeltNavKontor
    | dokumentasjonEtterspurt
    | forelopigSvar
    | saksStatus
    | utbetaling
    | vilkar
    | rammevedtak

export enum HendelseType {
    soknadsStatus = "soknadsStatus",
    vedtakFattet = "vedtakFattet",
    tildeltNavKontor = "tildeltNavKontor",
    dokumentasjonEtterspurt = "dokumentasjonEtterspurt",
    forelopigSvar = "forelopigSvar",
    saksStatus = "saksStatus",
    utbetaling = "utbetaling",
    vilkar = "vilkar",
    rammevedtak = "rammevedtak"
}


export interface tildeltNavKontor {
    type: HendelseType.tildeltNavKontor;
    hendelsestidspunkt: string;
    navKontor: string;
}
export interface soknadsStatus {
    type: HendelseType.soknadsStatus;
    hendelsestidspunkt: string;
    status: SoknadsStatus
}
export interface vedtakFattet {
    type: HendelseType.vedtakFattet;
    hendelsestidspunkt: string;
    saksreferanse: string;
    utfall: { utfall: Utfall };
    vedtaksfil: { referanse: Filreferanse};
    vedlegg: Vedlegg[]
}
export interface dokumentasjonEtterspurt {
    type: HendelseType.dokumentasjonEtterspurt;
    hendelsestidspunkt: string;
    forvaltningsbrev: Forvaltningsbrev;
    vedlegg: Vedlegg[];
    dokumenter: Dokument[];
}
export interface forelopigSvar {
    type: HendelseType.forelopigSvar;
    hendelsestidspunkt: string;
    forvaltningsbrev: Forvaltningsbrev;
    vedlegg: Vedlegg[];
}
export interface saksStatus {
    type: HendelseType.saksStatus;
    hendelsestidspunkt: string;
    referanse: string;
    tittel: string;
    status: SaksStatus;
}
export interface utbetaling {
    type: HendelseType.utbetaling;
    hendelsestidspunkt: string;
    // FIXME: fullfør implementasjon
}
export interface vilkar {
    type: HendelseType.vilkar;
    hendelsestidspunkt: string;
    utbetalingsreferanse: string[];
    beskrivelse: string;
    status: VilkarStatus;
}
export interface rammevedtak {
    type: HendelseType.rammevedtak;
    hendelsestidspunkt: string;
    rammevedtaksreferanse: string;
    saksreferanse: string;
    beskrivelse: string;
    belop: string;
    fom: string;
    tom: string;
}


export enum VilkarStatus {
    OPPFYLT = "OPPFYLT",
    IKKE_OPPFYLT = "IKKE_OPPFYLT"
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

export interface Version {

}

export interface Avsender {
    systemnavn: string,
    systemversjon: string
}

export default Hendelse;