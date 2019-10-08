import {
    DokumentasjonEtterspurt, Dokumentasjonkrav,
    ForelopigSvar, Rammevedtak, SaksStatus, SaksStatusType,
    SoknadsStatus,
    TildeltNavKontor, Utbetaling, VedtakFattet, Vilkar
} from "../../types/hendelseTypes";
import {FsSaksStatus, FsSoknad} from "./v3FsTypes";


export interface V3State {
    soknader: FsSoknad[],
}

export enum V3ActionTypeKeys {
    // root
    NY_SOKNAD = "v3/NY_SOKNAD",
    SLETT_SOKNAD = "v3/SLETT_SOKNAD",

    // søknad
    OPPDATER_SOKNADS_STATUS = "v3/OPPDATER_SOKNADS_STATUS",
    OPPDATER_NAV_KONTOR = "v3/OPPDATER_NAV_KONTOR",
    OPPDATER_DOKUMENTASJON_ETTERSPURT = "v3/OPPDATER_DOKUMENTASJON_ETTERSPURT",
    OPPDATER_FORELOPIG_SVAR = "v3/OPPDATER_FORELOPIG_SVAR",

    // saker
    NY_FS_SAKS_STATUS = "v3/NY_FS_SAKS_STATUS",
    OPPDATER_FS_SAKS_STATUS = "v3/OPPDATER_SAKS_STATUS",

    NY_UTBETALING = "v3/NY_UTBETALING",
    OPPDATER_UTBETALING = "v3/OPPDATER_UTBETALING",

    NYTT_DOKUMENTASJONKRAV = "v3/NYTT_DOKUMENTASJONSKRAV",
    OPPDATER_DOKUMENTASJONKRAV = "v3/OPPDATER_DOKUMENTASJONSKRAV",

    OPPDATER_VEDTAK_FATTET = "v3/OPPDATER_VEDTAK_FATTET",
    OPPDATER_RAMMEVEDTAK = "v3/OPPDATER_RAMME_VEDTAK",
    NYTT_VILKAR = "v3/NYTT_VILKAR",
    OPPDATER_VILKAR = "v3/OPPDATER_VILKAR",

}

export type V3Action
    = NyFsSoknad
    | SlettFsSoknad
    | OppdaterSoknadsStatus
    | OppdaterNavKontor
    | OppdaterDokumentasjonEtterspurt
    | OppdaterForelopigSvar
    | NyFsSaksStatus
    | OppdaterFsSaksStatus
    | NyUtbetaling
    | OppdaterUtbetaling
    | NyttDokumentasjonkrav
    | OppdaterDokumentasjonkrav
    | OppdaterVedtakFattet
    | OppdaterRammevedtak
    | NyttVilkar
    | OppdaterVilkar

export interface NyFsSoknad {
    type: V3ActionTypeKeys.NY_SOKNAD;
    nyFiksDigisosId: string;
    nyttFnr: string;
    nyttNavn: string;
}
export interface SlettFsSoknad {
    type: V3ActionTypeKeys.SLETT_SOKNAD;
    forFiksDigisosId: string;
}
export interface OppdaterSoknadsStatus {
    type: V3ActionTypeKeys.OPPDATER_SOKNADS_STATUS;
    forFiksDigisosId: string;
    nySoknadsStatus: SoknadsStatus;
}
export interface OppdaterNavKontor {
    type: V3ActionTypeKeys.OPPDATER_NAV_KONTOR;
    forFiksDigisosId: string;
    nyttNavKontor: TildeltNavKontor;
}
export interface OppdaterDokumentasjonEtterspurt {
    type: V3ActionTypeKeys.OPPDATER_DOKUMENTASJON_ETTERSPURT;
    forFiksDigisosId: string;
    nyDokumentasjonEtterspurt: DokumentasjonEtterspurt;
}
export interface OppdaterForelopigSvar {
    type: V3ActionTypeKeys.OPPDATER_FORELOPIG_SVAR;
    forFiksDigisosId: string;
    nyttForelopigSvar: ForelopigSvar;
}
export interface NyFsSaksStatus {
    type: V3ActionTypeKeys.NY_FS_SAKS_STATUS;
    forFiksDigisosId: string;
    nyFsSaksStatus: FsSaksStatus;
}
export interface OppdaterFsSaksStatus {
    type: V3ActionTypeKeys.OPPDATER_FS_SAKS_STATUS;
    forFiksDigisosId: string;
    saksStatusReferanse: string;
    nySaksStatus: SaksStatus;
}
export interface NyUtbetaling {
    type: V3ActionTypeKeys.NY_UTBETALING;
    forFiksDigisosId: string;
    forSaksStatusReferanse: string;
    nyUtbetaling: Utbetaling;
}
export interface OppdaterUtbetaling {
    type: V3ActionTypeKeys.OPPDATER_UTBETALING;
    forFiksDigisosId: string;
    oppdatertUtbetaling: Utbetaling;
}
export interface NyttDokumentasjonkrav {
    type: V3ActionTypeKeys.NYTT_DOKUMENTASJONKRAV;
    forFiksDigisosId: string;
    nyttDokumentasjonkrav: Dokumentasjonkrav;
}
export interface OppdaterDokumentasjonkrav {
    type: V3ActionTypeKeys.OPPDATER_DOKUMENTASJONKRAV;
    forFiksDigisosId: string;
    oppdatertDokumentasjonkrav: Dokumentasjonkrav;
}
export interface OppdaterVedtakFattet {
    type: V3ActionTypeKeys.OPPDATER_VEDTAK_FATTET;
    forFiksDigisosId: string;
    oppdatertVedtakFattet: VedtakFattet;
}
export interface OppdaterRammevedtak {
    type: V3ActionTypeKeys.OPPDATER_RAMMEVEDTAK;
    forFiksDigisosId: string;
    oppdatertRammeVedtak: Rammevedtak;
}
export interface NyttVilkar {
    type: V3ActionTypeKeys.NYTT_VILKAR;
    forFiksDigisosId: string;
    nyttVilkar: Vilkar;
}
export interface OppdaterVilkar {
    type: V3ActionTypeKeys.OPPDATER_VILKAR;
    forFiksDigisosId: string;
    oppdatertVilkar: Vilkar;
}


