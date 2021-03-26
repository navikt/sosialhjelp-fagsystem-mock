export interface FiksDigisosSokerJson {
    "sak": {
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
    | Dokumentasjonkrav

export enum HendelseType {
    SoknadsStatus = "soknadsStatus",
    VedtakFattet = "vedtakFattet",
    TildeltNavKontor = "tildeltNavKontor",
    DokumentasjonEtterspurt = "dokumentasjonEtterspurt",
    ForelopigSvar = "forelopigSvar",
    SaksStatus = "saksStatus",
    Utbetaling = "utbetaling",
    Vilkar = "vilkar",
    Dokumentasjonkrav = "dokumentasjonkrav"
}

// ----- Disse fire er på søknadsnivå
export interface SoknadsStatus {
    type: HendelseType.SoknadsStatus;
    hendelsestidspunkt: string;
    status: SoknadsStatusType
}

export interface TildeltNavKontor {
    type: HendelseType.TildeltNavKontor;
    hendelsestidspunkt: string;
    navKontor: string;
}

export interface DokumentasjonEtterspurt {
    type: HendelseType.DokumentasjonEtterspurt;
    hendelsestidspunkt: string;
    forvaltningsbrev: Forvaltningsbrev;
    vedlegg: Vedlegg[];
    dokumenter: Dokument[];
}

export interface ForelopigSvar { // hvis behandlingstiden er lenger enn forventa så kommer det en slik hendelse og alert stripe på innsyn.
    type: HendelseType.ForelopigSvar;
    hendelsestidspunkt: string;
    forvaltningsbrev: Forvaltningsbrev;
    vedlegg: Vedlegg[];
}


// -----
// En sak og alle tingene som kan knyttes til en sak.
export interface SaksStatus {
    type: HendelseType.SaksStatus;
    hendelsestidspunkt: string;
    referanse: string; // FIXME: Lag generator function. Ikke la bru
    tittel: string | null;
    status: SaksStatusType | null;
}

// saksreferanse
export interface Utbetaling {
    type: HendelseType.Utbetaling;
    hendelsestidspunkt: string; // f eks "2018-10-08T21:47:00.134Z"
    utbetalingsreferanse: string; // unik string ref
    saksreferanse: string|null; // "Referanse utbetalingen skal tilknyttes til (samme som i vedtak fattet og saksstatus)"
    status: UtbetalingStatus | null;
    belop: number | null; // belop i kr
    beskrivelse: string | null; // "Stønaden utbetalingen gjelder for (livsopphold, strøm etc.)"
    forfallsdato: string | null; // "pattern": "^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$"
    utbetalingsdato: string | null; // "pattern": "^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$"
    fom: string | null; // DATO
    tom: string | null; // DATO
    annenMottaker: boolean | null; // "Om en annen mottaker enn brukeren skal ha pengene"
    mottaker: string | null; // "Mottaker (søker eller annen mottaker), fnummer, orgnummer, eller navn"
    kontonummer: string | null; //"Mottakers kontonummer, bank i Norge, blir bare vist dersom mottaker er brukeren", "^[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]$"
    utbetalingsmetode: string | null; // "Utbetalingsmetode, eks kontooverføring, kontantkort"
}

//saksreferanse
export interface VedtakFattet {
    type: HendelseType.VedtakFattet;
    hendelsestidspunkt: string;
    saksreferanse: string;
    utfall: Utfall | null;
    vedtaksfil: { referanse: Svarut | Dokumentlager };
    vedlegg: Vedlegg[]
}

// utbetalingsref
export interface Vilkar {
    type: HendelseType.Vilkar;
    hendelsestidspunkt: string;
    vilkarreferanse: string;
    utbetalingsreferanse: string[] | null;
    beskrivelse: string | null;
    status: VilkarStatus | null;
}

// utbetalingsref
export interface Dokumentasjonkrav {
    type: HendelseType.Dokumentasjonkrav;
    hendelsestidspunkt: string;
    dokumentasjonkravreferanse: string;
    utbetalingsreferanse: string[] | null, // Array med hvilke utbetalinger som venter på at dette kravet blir oppfylt
    beskrivelse: string | null, // beskrivelse av hva som må gjøres
    status: DokumentasjonkravStatus | null
}


// --------

export enum VilkarStatus {
    OPPFYLT = "OPPFYLT",
    IKKE_OPPFYLT = "IKKE_OPPFYLT"
}

export enum DokumentasjonkravStatus {
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

export enum UtbetalingStatus {
    PLANLAGT_UTBETALING = "PLANLAGT_UTBETALING",
    UTBETALT = "UTBETALT",
    STOPPET = "STOPPET",
    ANNULLERT = "ANNULLERT"
}

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

export interface DokumentlagerExtended {
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
    tilleggsinformasjon: string | null;
    innsendelsesfrist: string | null;
    dokumentreferanse: string | null;
}

export interface Version {

}

export interface Avsender {
    systemnavn: string,
    systemversjon: string
}

export default Hendelse;