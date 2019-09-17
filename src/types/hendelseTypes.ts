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
    = SoknadsStatus
    | VedtakFattet
    | TildeltNavKontor
    | DokumentasjonEtterspurt
    | ForelopigSvar
    | SaksStatus
    | Utbetaling
    | Vilkar
    | Rammevedtak

export enum HendelseType {
    SoknadsStatus = "SoknadsStatus",
    VedtakFattet = "VedtakFattet",
    TildeltNavKontor = "TildeltNavKontor",
    DokumentasjonEtterspurt = "DokumentasjonEtterspurt",
    ForelopigSvar = "ForelopigSvar",
    SaksStatus = "SaksStatus",
    Utbetaling = "Utbetaling",
    Vilkar = "Vilkar",
    Rammevedtak = "Rammevedtak"
}


export interface TildeltNavKontor {
    type: HendelseType.TildeltNavKontor;
    hendelsestidspunkt: string;
    navKontor: string;
}
export interface SoknadsStatus {
    type: HendelseType.SoknadsStatus;
    hendelsestidspunkt: string;
    status: SoknadsStatusType
}
export interface VedtakFattet {
    type: HendelseType.VedtakFattet;
    hendelsestidspunkt: string;
    saksreferanse: string;
    utfall: { utfall: Utfall };
    vedtaksfil: { referanse: Svarut | Dokumentlager};
    vedlegg: Vedlegg[]
}
export interface DokumentasjonEtterspurt {
    type: HendelseType.DokumentasjonEtterspurt;
    hendelsestidspunkt: string;
    forvaltningsbrev: Forvaltningsbrev;
    vedlegg: Vedlegg[];
    dokumenter: Dokument[];
}
export interface ForelopigSvar {
    type: HendelseType.ForelopigSvar;
    hendelsestidspunkt: string;
    forvaltningsbrev: Forvaltningsbrev;
    vedlegg: Vedlegg[];
}
export interface SaksStatus {
    type: HendelseType.SaksStatus;
    hendelsestidspunkt: string;
    referanse: string;
    tittel: string;
    status: SaksStatusType;
}
export interface Utbetaling {
    type: HendelseType.Utbetaling;
    hendelsestidspunkt: string;
    // FIXME: fullfør implementasjon
}
export interface Vilkar {
    type: HendelseType.Vilkar;
    hendelsestidspunkt: string;
    utbetalingsreferanse: string[];
    beskrivelse: string;
    status: VilkarStatus;
}
export interface Rammevedtak {
    type: HendelseType.Rammevedtak;
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

export enum SoknadsStatusType {
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

export enum SaksStatusType {
    UNDER_BEHANDLING = "UNDER_BEHANDLING",
    IKKE_INNSYN = "IKKE_INNSYN",
    BEHANDLES_IKKE = "BEHANDLES_IKKE",
    FEILREGISTRERT = "FEILREGISTRERT"
}


// export interface Filreferanse {
//     type: SvarUt | DokumentLager;
// }

export enum FilreferanseType {
    svarut = "svarut",
    dokumentlager = "dokumentlager"
}

export interface Svarut {
    type: FilreferanseType.svarut;
    id: string; // pattern "^[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]-[0-9a-f][0-9a-f][0-9a-f][0-9a-f]-[0-9a-f][0-9a-f][0-9a-f][0-9a-f]-[0-9a-f][0-9a-f][0-9a-f][0-9a-f]-[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]$"
    nr: number; // Filnummer i SvarUt-forsendelsen.
}

export interface SvarutExtended {
    type: FilreferanseType.svarut
    id: string;
    nr: number;
    tittel: string;
}

export interface Dokumentlager {
    type: FilreferanseType.dokumentlager;
    id: string; // pattern "^[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]-[0-9a-f][0-9a-f][0-9a-f][0-9a-f]-[0-9a-f][0-9a-f][0-9a-f][0-9a-f]-[0-9a-f][0-9a-f][0-9a-f][0-9a-f]-[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]$"

}

export interface DokumentlagerExtended{
    type: FilreferanseType.dokumentlager
    id: string;
    tittel: string;
}

export interface Vedlegg {
    tittel: string;
    referanse: Svarut | Dokumentlager;
}

export interface Forvaltningsbrev {
    referanse: Svarut | Dokumentlager;
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