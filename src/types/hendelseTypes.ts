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
    Rammevedtak = "rammevedtak",
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
    tittel: string;
    status: SaksStatusType;
}

// saksreferanse
export interface Utbetaling {
    type: HendelseType.Utbetaling;
    hendelsestidspunkt: string; // f eks "2018-10-08T21:47:00.134Z"
    utbetalingsreferanse: string; // unik string ref
    saksreferanse: string; // "Referanse utbetalingen skal tilknyttes til (samme som i vedtak fattet og saksstatus)"
    rammevedtaksreferanse: string // "Settes dersom utbetalingen er en del av et rammevedtak"
    status: UtbetalingStatus;
    belop: number; // belop i kr
    beskrivelse: string; // "Stønaden utbetalingen gjelder for (livsopphold, strøm etc.)"
    forfallsdato: string; // "pattern": "^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$"
    stonadstype: string; // Grupperingsnøkkel
    utbetalingsdato: string; // "pattern": "^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$"
    fom: string; // DATO
    tom: string; // DATO
    mottaker: string; // "Mottaker (søker eller annen mottaker), fnummer, orgnummer, eller navn"
    kontonummer: string; //"Mottakers kontonummer, bank i Norge, blir bare vist dersom mottaker er brukeren", "^[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]$"
    utbetalingsmetode: string; // "Utbetalingsmetode, eks kontooverføring, kontantkort"
}
//saksreferanse
export interface VedtakFattet {
    type: HendelseType.VedtakFattet;
    hendelsestidspunkt: string;
    saksreferanse: string;
    utfall: { utfall: Utfall };
    vedtaksfil: { referanse: Svarut | Dokumentlager};
    vedlegg: Vedlegg[]
}
// saksreferanse
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
// utbetalingsref
export interface Vilkar {
    type: HendelseType.Vilkar;
    hendelsestidspunkt: string;
    utbetalingsreferanse: string[];
    beskrivelse: string;
    status: VilkarStatus;
}
// utbetalingsref
export interface Dokumentasjonkrav {
    type: HendelseType.Dokumentasjonkrav;
    hendelsestidspunkt: string;
    dokumentasjonkravreferanse: string;
    utbetalingsreferanse: string[], // Array med hvilke utbetalinger som venter på at dette kravet blir oppfylt
    beskrivelse: string, // beskrivelse av hva som må gjøres
    status: VilkarStatus
}


// --------

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

export enum UtbetalingStatus {
    PLANLAGT_UTBETALING = "PLANLAGT_UTBETALING",
    UTBETALT = "UTBETALT",
    STOPPET = "STOPPET",
    ANNULLERT = "ANNULLERT"
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