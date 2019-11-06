import {DokumentlagerExtended, FiksDigisosSokerJson, SvarutExtended} from "../types/hendelseTypes";
import {PaletteType} from "@material-ui/core";
import {
    DokumentasjonEtterspurt,
    Dokumentasjonkrav,
    ForelopigSvar, Rammevedtak, SaksStatus,
    SoknadsStatus,
    TildeltNavKontor, Utbetaling, VedtakFattet,
    Vilkar
} from "../types/hendelseTypes";

export interface Model {
    fiksDigisosId: string;
    fiksDigisosSokerJson: FiksDigisosSokerJson;
    loaderOn: boolean;
    setFiksDigisosIdIsEnabled: boolean;
    backendUrls: BackendUrls;
    backendUrlTypeToUse: keyof BackendUrls;
    oppdaterDigisosSakUrl: string;
    nyNavEnhetUrl: string;
    filreferanselager: Filreferanselager;
    thememode: PaletteType;
    
    soknader: FsSoknad[];

    visNySakModal: boolean;
    visNyDokumentasjonEtterspurtModal: boolean;
    visNyUtbetalingModal: boolean;
    visNyVilkarModal: boolean;
    visNyDokumentasjonkravModal: boolean;
    visNyRammevedtakModal: boolean;
    modalSaksreferanse: string|null;
    visEndreNavKontorModal: boolean;
    visSystemSettingsModal: boolean;
    visSnackbar: boolean;
    snackbarVariant: 'success'|'warning'|'error'|'info';

    aktivSoknad: string; // fiksDigisosId
    aktivUtbetaling: string | null; // utbetalingsreferanse
    aktivtVilkar: string | null; // vilkarreferanse
    aktivtDokumentasjonkrav: string | null; // dokumentasjonkravreferanse
    aktivtRammevedtak: string | null; // rammevedtakreferanse
}

export interface FsSoknad {
    // brukes som queryparam
    fiksDigisosId: string;

    // Brukes kun i visningen i woldenatm
    fnr: string;
    navn: string;

    // FS Hendelser
    soknadsStatus: SoknadsStatus; // Default mottatt
    navKontor: TildeltNavKontor | undefined;
    dokumentasjonEtterspurt: DokumentasjonEtterspurt | undefined;
    forelopigSvar: ForelopigSvar | undefined;
    vilkar: Vilkar[];
    dokumentasjonkrav: Dokumentasjonkrav[];
    rammevedtakUtenSaksreferanse: Rammevedtak[];
    utbetalingerUtenSaksreferanse: Utbetaling[];
    saker: FsSaksStatus[];

    fiksDigisosSokerJson: FiksDigisosSokerJson;
}

export interface FsSaksStatus extends SaksStatus {
    utbetalinger: Utbetaling[];
    vedtakFattet: VedtakFattet | undefined;
    rammevedtak: Rammevedtak[];
    vilkar: Vilkar[];
    dokumentasjonskrav: Dokumentasjonkrav[];
}

export interface BackendUrls {
    lokalt: string,
    digisostest: string,
    q0: string,
    q1: string
}

export interface Filreferanselager {
    svarutlager: SvarutExtended[],
    dokumentlager: DokumentlagerExtended[]
}

export type Action
    = SetFiksDigisosId
    | SetDigisosSokerJson
    | SetAktivSoknad
    | SetAktivUtbetaling
    | SetAktivtVilkar
    | SetAktivtDokumentasjonkrav
    | SetAktivtRammevedtak
    | SetBackendUrlTypeToUse
    | TurnOnLoader
    | TurnOffLoader
    | SwitchToDarkMode
    | SwitchToLightMode
    | VisNySakModal
    | VisNyDokumentasjonEtterspurtModal
    | VisNyUtbetalingModal
    | VisNyVilkarModal
    | VisNyDokumentasjonkravModal
    | VisNyRammevedtakModal
    | VisEndreNavKontorModal
    | VisSystemSettingsModal
    | VisSuccessSnackbar
    | VisErrorSnackbar
    | SkjulNySakModal
    | SkjulNyDokumentasjonEtterspurtModal
    | SkjulNyUtbetalingModal
    | SkjulNyVilkarModal
    | SkjulNyDokumentasjonkravModal
    | SkjulNyRammevedtakModal
    | SkjulEndreNavKontorModal
    | SkjulSystemSettingsModal
    | SkjulSnackbar
    // oppdater hendelse.json
    | NyFsSoknad
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
    | NyttRammevedtak
    | OppdaterRammevedtak
    | NyttVilkar
    | OppdaterVilkar
    | OppdaterFiksId


export enum ActionTypeKeys {
    SET_FIKS_DIGISOS_ID = "SET_DIGISOS_FIKS_ID",
    SET_FIKS_DIGISOS_SOKER_JSON = "UPDATE_DIGISOS_SOKER_JSON",
    TURN_ON_LOADER = "TURN_ON_LOADER",
    TURN_OFF_LOADER = "TURN_OFF_LOADER",
    ENABLE_SET_FIKS_DIGISOS_ID = "ENABLE_SET_FIKS_DIGISOS_ID",
    DISABLE_SET_FIKS_DIGISOS_ID = "DISABLE_SET_FIKS_DIGISOS_ID",
    SET_BACKEND_URL_TYPE_TO_USE = "SET_BACKEND_URL_TYPE_TO_USE",
    EDIT_BACKEND_URL_FOR_TYPE = "EDIT_BACKEND_URL_FOR_TYPE",
    LEGG_TIL_NY_FIL_I_LAGER = "LEGG_TIL_NY_TIL_I_LAGER",
    SWITCH_TO_DARK_MODE = "SWITCH_TO_DARK_MODE",
    SWITCH_TO_LIGHT_MODE = "SWITCH_TO_LIGHT_MODE",
    // Visnings ting
    VIS_NY_SAK_MODAL = "VIS_NY_SAK_MODAL",
    SKJUL_NY_SAK_MODAL = "SKJUL_NY_SAK_MODAL",
    VIS_NY_DOKUMENTASJON_ETTERSPURT_MODAL = "VIS_NY_DOKUMENTASJON_ETTERSPURT_MODAL",
    SKJUL_NY_DOKUMENTASJON_ETTERSPURT_MODAL = "SKJUL_NY_DOKUMENTASJON_ETTERSPURT_MODAL",
    VIS_NY_UTBETALING_MODAL = "VIS_NY_UTBETALINGMODAL_MODAL",
    SKJUL_NY_UTBETALING_MODAL = "SKJUL_NY_UTBETALINGMODAL_MODAL",
    VIS_NY_VILKAR_MODAL = "VIS_NY_VILKAR_MODAL",
    SKJUL_NY_VILKAR_MODAL = "SKJUL_NY_VILKAR_MODAL",
    VIS_NY_DOKUMENTASJONKRAV_MODAL = "VIS_NY_DOKUMENTASJONKRAV_MODAL",
    SKJUL_NY_DOKUMENTASJONKRAV_MODAL = "SKJUL_NY_DOKUMENTASJONKRAV_MODAL",
    VIS_NY_RAMMEVEDTAK_MODAL = "VIS_NY_RAMMEVEDTAK_MODAL",
    SKJUL_NY_RAMMEVEDTAK_MODAL = "SKJUL_NY_RAMMEVEDTAK_MODAL",
    SET_SOKNADS_STATUS = "SET_SOKNADS_STATUS",
    VIS_ENDRE_NAV_KONTOR_MODAL = "VIS_ENDRE_NAV_KONTOR_MODAL",
    SKJUL_ENDRE_NAV_KONTOR_MODAL = "SKJUL_ENDRE_NAV_KONTOR_MODAL",
    VIS_SYSTEM_SETTINGS_MODAL = "VIS_SYSTEM_SETTINGS_MODAL",
    SKJUL_SYSTEM_SETTINGS_MODAL = "SKJUL_SYSTEM_SETTINGS_MODAL",
    VIS_SUCCESS_SNACKBAR = "VIS_SUCCESS_SNACKBAR",
    VIS_ERROR_SNACKBAR = "VIS_ERROR_SNACKBAR",
    SKJUL_SNACKBAR = "SKJUL_SNACKBAR",
    // Aktive ting
    SET_AKTIV_SOKNAD = "SET_AKTIV_SOKNAD",
    SET_AKTIV_UTBETALING = "SET_AKTIV_UTBETALING",
    SET_AKTIVT_VILKAR = "SET_AKTIVT_VILKAR",
    SET_AKTIVT_DOKUMENTASJONKRAV = "SET_AKTIVT_DOKUMENTASJONKRAV",
    SET_AKTIVT_RAMMEVEDTAK = "SET_AKTIVT_RAMMEVEDTAK",
    NY_SAKS_STATUS = "NY_SAKS_STATUS",
    SETT_NY_SAKS_STATUS = "SETT_NY_SAKS_STATUS",

    // root
    NY_SOKNAD = "NY_SOKNAD",
    SLETT_SOKNAD = "SLETT_SOKNAD",

    // søknad
    OPPDATER_SOKNADS_STATUS = "OPPDATER_SOKNADS_STATUS",
    OPPDATER_NAV_KONTOR = "OPPDATER_NAV_KONTOR",
    OPPDATER_FIKS_ID = "OPPDATER_FIKS_ID",
    OPPDATER_DOKUMENTASJON_ETTERSPURT = "OPPDATER_DOKUMENTASJON_ETTERSPURT",
    OPPDATER_FORELOPIG_SVAR = "OPPDATER_FORELOPIG_SVAR",

    // saker
    NY_FS_SAKS_STATUS = "NY_FS_SAKS_STATUS",
    OPPDATER_FS_SAKS_STATUS = "OPPDATER_SAKS_STATUS",

    NY_UTBETALING = "NY_UTBETALING",
    OPPDATER_UTBETALING = "OPPDATER_UTBETALING",

    NYTT_DOKUMENTASJONKRAV = "NYTT_DOKUMENTASJONSKRAV",
    OPPDATER_DOKUMENTASJONKRAV = "OPPDATER_DOKUMENTASJONSKRAV",

    OPPDATER_VEDTAK_FATTET = "OPPDATER_VEDTAK_FATTET",
    NYTT_RAMMEVEDTAK = "NYTT_RAMMEVEDTAK",
    OPPDATER_RAMMEVEDTAK = "OPPDATER_RAMMEVEDTAK",
    NYTT_VILKAR = "NYTT_VILKAR",
    OPPDATER_VILKAR = "OPPDATER_VILKAR",
}


export interface SetFiksDigisosId {
    type: ActionTypeKeys.SET_FIKS_DIGISOS_ID;
    fiksDigisosId: string;
}

export interface SetDigisosSokerJson {
    type: ActionTypeKeys.SET_FIKS_DIGISOS_SOKER_JSON;
    fiksDigisosSokerJson: any;
}

export interface TurnOnLoader {
    type: ActionTypeKeys.TURN_ON_LOADER;
}

export interface TurnOffLoader {
    type: ActionTypeKeys.TURN_OFF_LOADER;
}

export interface SetBackendUrlTypeToUse {
    type: ActionTypeKeys.SET_BACKEND_URL_TYPE_TO_USE;
    backendUrlTypeToUse: keyof BackendUrls
}

export interface SwitchToDarkMode {
    type: ActionTypeKeys.SWITCH_TO_DARK_MODE;
}

export interface SwitchToLightMode {
    type: ActionTypeKeys.SWITCH_TO_LIGHT_MODE;
}

// Vis ting
export interface VisNySakModal {
    type: ActionTypeKeys.VIS_NY_SAK_MODAL;
}

export interface SkjulNySakModal {
    type: ActionTypeKeys.SKJUL_NY_SAK_MODAL;
}

export interface VisNyDokumentasjonEtterspurtModal {
    type: ActionTypeKeys.VIS_NY_DOKUMENTASJON_ETTERSPURT_MODAL;
}

export interface VisNyUtbetalingModal {
    type: ActionTypeKeys.VIS_NY_UTBETALING_MODAL;
    saksreferanse: string|null;
}

export interface SkjulNyUtbetalingModal {
    type: ActionTypeKeys.SKJUL_NY_UTBETALING_MODAL;
}

export interface VisNyVilkarModal {
    type: ActionTypeKeys.VIS_NY_VILKAR_MODAL;
}

export interface SkjulNyVilkarModal {
    type: ActionTypeKeys.SKJUL_NY_VILKAR_MODAL;
}

export interface VisNyDokumentasjonkravModal {
    type: ActionTypeKeys.VIS_NY_DOKUMENTASJONKRAV_MODAL;
}

export interface SkjulNyDokumentasjonkravModal {
    type: ActionTypeKeys.SKJUL_NY_DOKUMENTASJONKRAV_MODAL;
}

export interface VisNyRammevedtakModal {
    type: ActionTypeKeys.VIS_NY_RAMMEVEDTAK_MODAL;
    saksreferanse: string|null;
}

export interface SkjulNyRammevedtakModal {
    type: ActionTypeKeys.SKJUL_NY_RAMMEVEDTAK_MODAL;
}

export interface SkjulNyDokumentasjonEtterspurtModal {
    type: ActionTypeKeys.SKJUL_NY_DOKUMENTASJON_ETTERSPURT_MODAL;
}

export interface VisEndreNavKontorModal {
    type: ActionTypeKeys.VIS_ENDRE_NAV_KONTOR_MODAL,
}

export interface SkjulEndreNavKontorModal {
    type: ActionTypeKeys.SKJUL_ENDRE_NAV_KONTOR_MODAL,
}

export interface VisSystemSettingsModal {
    type: ActionTypeKeys.VIS_SYSTEM_SETTINGS_MODAL,
}

export interface SkjulSystemSettingsModal {
    type: ActionTypeKeys.SKJUL_SYSTEM_SETTINGS_MODAL,
}

export interface VisSuccessSnackbar {
    type: ActionTypeKeys.VIS_SUCCESS_SNACKBAR,
}

export interface VisErrorSnackbar {
    type: ActionTypeKeys.VIS_ERROR_SNACKBAR,
}

export interface SkjulSnackbar {
    type: ActionTypeKeys.SKJUL_SNACKBAR,
}

// Aktive ting
export interface SetAktivSoknad {
    type: ActionTypeKeys.SET_AKTIV_SOKNAD;
    fiksDigisosId: string
}

export interface SetAktivUtbetaling {
    type: ActionTypeKeys.SET_AKTIV_UTBETALING;
    referanse: string | null
}

export interface SetAktivtVilkar {
    type: ActionTypeKeys.SET_AKTIVT_VILKAR;
    referanse: string | null
}

export interface SetAktivtDokumentasjonkrav {
    type: ActionTypeKeys.SET_AKTIVT_DOKUMENTASJONKRAV;
    referanse: string | null
}

export interface SetAktivtRammevedtak {
    type: ActionTypeKeys.SET_AKTIVT_RAMMEVEDTAK;
    referanse: string | null
}

export interface NyFsSoknad {
    type: ActionTypeKeys.NY_SOKNAD;
    nyFiksDigisosId: string;
    nyttFnr: string;
    nyttNavn: string;
}

export interface SlettFsSoknad {
    type: ActionTypeKeys.SLETT_SOKNAD;
    forFiksDigisosId: string;
}

export interface OppdaterSoknadsStatus {
    type: ActionTypeKeys.OPPDATER_SOKNADS_STATUS;
    forFiksDigisosId: string;
    nySoknadsStatus: SoknadsStatus;
}

export interface OppdaterNavKontor {
    type: ActionTypeKeys.OPPDATER_NAV_KONTOR;
    forFiksDigisosId: string;
    nyttNavKontor: TildeltNavKontor;
}

export interface OppdaterFiksId {
    type: ActionTypeKeys.OPPDATER_FIKS_ID;
    forFiksDigisosId: string;
    nyFiksId: string;
}

export interface OppdaterDokumentasjonEtterspurt {
    type: ActionTypeKeys.OPPDATER_DOKUMENTASJON_ETTERSPURT;
    forFiksDigisosId: string;
    nyDokumentasjonEtterspurt: DokumentasjonEtterspurt;
}

export interface OppdaterForelopigSvar {
    type: ActionTypeKeys.OPPDATER_FORELOPIG_SVAR;
    forFiksDigisosId: string;
    nyttForelopigSvar: ForelopigSvar;
}

export interface NyFsSaksStatus {
    type: ActionTypeKeys.NY_FS_SAKS_STATUS;
    forFiksDigisosId: string;
    nyFsSaksStatus: FsSaksStatus;
}

export interface OppdaterFsSaksStatus {
    type: ActionTypeKeys.OPPDATER_FS_SAKS_STATUS;
    forFiksDigisosId: string;
    oppdatertSaksstatus: SaksStatus;
}

export interface NyUtbetaling {
    type: ActionTypeKeys.NY_UTBETALING;
    forFiksDigisosId: string;
    nyUtbetaling: Utbetaling;
}

export interface OppdaterUtbetaling {
    type: ActionTypeKeys.OPPDATER_UTBETALING;
    forFiksDigisosId: string;
    oppdatertUtbetaling: Utbetaling;
}

export interface NyttDokumentasjonkrav {
    type: ActionTypeKeys.NYTT_DOKUMENTASJONKRAV;
    forFiksDigisosId: string;
    nyttDokumentasjonkrav: Dokumentasjonkrav;
}

export interface OppdaterDokumentasjonkrav {
    type: ActionTypeKeys.OPPDATER_DOKUMENTASJONKRAV;
    forFiksDigisosId: string;
    oppdatertDokumentasjonkrav: Dokumentasjonkrav;
}

export interface OppdaterVedtakFattet {
    type: ActionTypeKeys.OPPDATER_VEDTAK_FATTET;
    forFiksDigisosId: string;
    oppdatertVedtakFattet: VedtakFattet;
}

export interface NyttRammevedtak {
    type: ActionTypeKeys.NYTT_RAMMEVEDTAK;
    forFiksDigisosId: string;
    nyttRammevedtak: Rammevedtak;
}

export interface OppdaterRammevedtak {
    type: ActionTypeKeys.OPPDATER_RAMMEVEDTAK;
    forFiksDigisosId: string;
    oppdatertRammevedtak: Rammevedtak;
}

export interface NyttVilkar {
    type: ActionTypeKeys.NYTT_VILKAR;
    forFiksDigisosId: string;
    nyttVilkar: Vilkar;
}

export interface OppdaterVilkar {
    type: ActionTypeKeys.OPPDATER_VILKAR;
    forFiksDigisosId: string;
    oppdatertVilkar: Vilkar;
}
