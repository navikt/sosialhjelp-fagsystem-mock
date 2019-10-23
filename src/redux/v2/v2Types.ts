import {
    DokumentlagerExtended,
    FiksDigisosSokerJson, SaksStatus, SaksStatusType, SoknadsStatusType,
    SvarutExtended
} from "../../types/hendelseTypes";
import {PaletteType} from "@material-ui/core";
import {Soknad} from "../../types/additionalTypes";
import V2 from "../../pages/V2";
import CheckCircleIcon from "@material-ui/core/SvgIcon/SvgIcon";

export interface V2Model {
    fiksDigisosId: string;
    fiksDigisosSokerJson: FiksDigisosSokerJson;
    loaderOn: boolean;
    setFiksDigisosIdIsEnabled: boolean;
    backendUrls: BackendUrls;
    backendUrlTypeToUse: string;
    oppdaterDigisosSakUrl: string;
    nyNavEnhetUrl: string;
    filreferanselager: Filreferanselager;
    thememode: PaletteType;

    // V3
    soknader: Soknad[];

    visNySakModal: boolean;
    visNyDokumentasjonEtterspurtModal: boolean;
    visNyUtbetalingModal: boolean;
    visNyVilkarModal: boolean;
    visNyDokumentasjonkravModal: boolean;
    visNyRammevedtakModal: boolean;
    visEndreNavKontorModal: boolean;
    visSystemSettingsModal: boolean;
    visSnackbar: boolean;
    snackbarVariant: 'success'|'warning'|'error'|'info';

    aktivSoknad: string; // fiksDigisosId
    aktivSakIndex: number | undefined; // sakReferanse
    aktivUtbetaling: string | undefined | null; // utbetalingsreferanse
    aktivtVilkar: string | undefined | null; // vilkarreferanse
    aktivtDokumentasjonkrav: string | undefined | null; // dokumentasjonkravreferanse
    aktivtRammevedtak: string | undefined | null; // rammevedtakreferanse
}

export interface BackendUrls {
    local: string,
    digisostest: string,
    q0: string,
    q1: string
}

export interface Filreferanselager {
    svarutlager: SvarutExtended[],
    dokumentlager: DokumentlagerExtended[]
}

export type V2Action
    = SetFiksDigisosId
    | SetDigisosSokerJson
    | TurnOnLoader
    | TurnOffLoader
    | EnableSetFiksDigisosId
    | DisableSetFiksDigisosId
    | SetBackendUrlTypeToUse
    | EditBackendUrlForType
    | LeggTilNyFilILager
    | SwitchToDarkMode
    | SwitchToLightMode
    | VisNySakModal
    | SkjulNySakModal
    | VisNyDokumentasjonEtterspurtModal
    | SkjulNyDokumentasjonEtterspurtModal
    | VisNyUtbetalingModal
    | SkjulNyUtbetalingModal
    | VisNyVilkarModal
    | SkjulNyVilkarModal
    | VisNyDokumentasjonkravModal
    | SkjulNyDokumentasjonkravModal
    | VisNyRammevedtakModal
    | SkjulNyRammevedtakModal
    | SetSoknadsStatus
    | VisEndreNavKontorModal
    | SkjulEndreNavKontorModal
    | VisSystemSettingsModal
    | SkjulSystemSettingsModal
    | VisSuccessSnackbar
    | VisErrorSnackbar
    | SkjulSnackbar
    | SetAktivSoknad
    | SetAktivSak
    | SetAktivUtbetaling
    | SetAktivtVilkar
    | SetAktivtDokumentasjonkrav
    | SetAktivtRammevedtak
    | NySaksStatus
    | SettNySaksStatus


export enum V2ActionTypeKeys {
    SET_FIKS_DIGISOS_ID = "v2/SET_DIGISOS_FIKS_ID",
    SET_FIKS_DIGISOS_SOKER_JSON = "v2/UPDATE_DIGISOS_SOKER_JSON",
    TURN_ON_LOADER = "v2/TURN_ON_LOADER",
    TURN_OFF_LOADER = "v2/TURN_OFF_LOADER",
    ENABLE_SET_FIKS_DIGISOS_ID = "v2/ENABLE_SET_FIKS_DIGISOS_ID",
    DISABLE_SET_FIKS_DIGISOS_ID = "v2/DISABLE_SET_FIKS_DIGISOS_ID",
    SET_BACKEND_URL_TYPE_TO_USE = "v2/SET_BACKEND_URL_TYPE_TO_USE",
    EDIT_BACKEND_URL_FOR_TYPE = "v2/EDIT_BACKEND_URL_FOR_TYPE",
    LEGG_TIL_NY_FIL_I_LAGER = "v2/LEGG_TIL_NY_TIL_I_LAGER",
    SWITCH_TO_DARK_MODE = "v2/SWITCH_TO_DARK_MODE",
    SWITCH_TO_LIGHT_MODE = "v2/SWITCH_TO_LIGHT_MODE",
    // Visnings ting
    VIS_NY_SAK_MODAL = "v2/VIS_NY_SAK_MODAL",
    SKJUL_NY_SAK_MODAL = "v2/SKJUL_NY_SAK_MODAL",
    VIS_NY_DOKUMENTASJON_ETTERSPURT_MODAL = "v2/VIS_NY_DOKUMENTASJON_ETTERSPURT_MODAL",
    SKJUL_NY_DOKUMENTASJON_ETTERSPURT_MODAL = "v2/SKJUL_NY_DOKUMENTASJON_ETTERSPURT_MODAL",
    VIS_NY_UTBETALING_MODAL = "v2/VIS_NY_UTBETALINGMODAL_MODAL",
    SKJUL_NY_UTBETALING_MODAL = "v2/SKJUL_NY_UTBETALINGMODAL_MODAL",
    VIS_NY_VILKAR_MODAL = "v2/VIS_NY_VILKAR_MODAL",
    SKJUL_NY_VILKAR_MODAL = "v2/SKJUL_NY_VILKAR_MODAL",
    VIS_NY_DOKUMENTASJONKRAV_MODAL = "v2/VIS_NY_DOKUMENTASJONKRAV_MODAL",
    SKJUL_NY_DOKUMENTASJONKRAV_MODAL = "v2/SKJUL_NY_DOKUMENTASJONKRAV_MODAL",
    VIS_NY_RAMMEVEDTAK_MODAL = "v2/VIS_NY_RAMMEVEDTAK_MODAL",
    SKJUL_NY_RAMMEVEDTAK_MODAL = "v2/SKJUL_NY_RAMMEVEDTAK_MODAL",
    SET_SOKNADS_STATUS = "v2/SET_SOKNADS_STATUS",
    VIS_ENDRE_NAV_KONTOR_MODAL = "v2/VIS_ENDRE_NAV_KONTOR_MODAL",
    SKJUL_ENDRE_NAV_KONTOR_MODAL = "v2/SKJUL_ENDRE_NAV_KONTOR_MODAL",
    VIS_SYSTEM_SETTINGS_MODAL = "v2/VIS_SYSTEM_SETTINGS_MODAL",
    SKJUL_SYSTEM_SETTINGS_MODAL = "v2/SKJUL_SYSTEM_SETTINGS_MODAL",
    VIS_SUCCESS_SNACKBAR = "v2/VIS_SUCCESS_SNACKBAR",
    VIS_ERROR_SNACKBAR = "v2/VIS_ERROR_SNACKBAR",
    SKJUL_SNACKBAR = "v2/SKJUL_SNACKBAR",
    // Aktive ting
    SET_AKTIV_SAK = "v2/SET_AKTIV_SAK",
    SET_AKTIV_SOKNAD = "v2/SET_AKTIV_SOKNAD",
    SET_AKTIV_UTBETALING = "v2/SET_AKTIV_UTBETALING",
    SET_AKTIVT_VILKAR = "v2/SET_AKTIVT_VILKAR",
    SET_AKTIVT_DOKUMENTASJONKRAV = "v2/SET_AKTIVT_DOKUMENTASJONKRAV",
    SET_AKTIVT_RAMMEVEDTAK = "v2/SET_AKTIVT_RAMMEVEDTAK",
    NY_SAKS_STATUS = "v2/NY_SAKS_STATUS",
    SETT_NY_SAKS_STATUS = "v2/SETT_NY_SAKS_STATUS"
}


export interface SetFiksDigisosId {
    type: V2ActionTypeKeys.SET_FIKS_DIGISOS_ID;
    fiksDigisosId: string;
}

export interface SetDigisosSokerJson {
    type: V2ActionTypeKeys.SET_FIKS_DIGISOS_SOKER_JSON;
    fiksDigisosSokerJson: any;
}

export interface TurnOnLoader {
    type: V2ActionTypeKeys.TURN_ON_LOADER;
}

export interface TurnOffLoader {
    type: V2ActionTypeKeys.TURN_OFF_LOADER;
}

export interface EnableSetFiksDigisosId {
    type: V2ActionTypeKeys.ENABLE_SET_FIKS_DIGISOS_ID;
}

export interface DisableSetFiksDigisosId {
    type: V2ActionTypeKeys.DISABLE_SET_FIKS_DIGISOS_ID;
}

export interface SetBackendUrlTypeToUse {
    type: V2ActionTypeKeys.SET_BACKEND_URL_TYPE_TO_USE;
    backendUrlTypeToUse: string
}

export interface EditBackendUrlForType {
    type: V2ActionTypeKeys.EDIT_BACKEND_URL_FOR_TYPE;
    backendUrlType: string;
    backendUrlUpdated: string;
}

export interface LeggTilNyFilILager {
    type: V2ActionTypeKeys.LEGG_TIL_NY_FIL_I_LAGER;
    nyFilreferanse: SvarutExtended | DokumentlagerExtended;
}

export interface SwitchToDarkMode {
    type: V2ActionTypeKeys.SWITCH_TO_DARK_MODE;
}

export interface SwitchToLightMode {
    type: V2ActionTypeKeys.SWITCH_TO_LIGHT_MODE;
}

// Vis ting
export interface VisNySakModal {
    type: V2ActionTypeKeys.VIS_NY_SAK_MODAL;
}

export interface SkjulNySakModal {
    type: V2ActionTypeKeys.SKJUL_NY_SAK_MODAL;
}

export interface VisNyDokumentasjonEtterspurtModal {
    type: V2ActionTypeKeys.VIS_NY_DOKUMENTASJON_ETTERSPURT_MODAL;
}

export interface VisNyUtbetalingModal {
    type: V2ActionTypeKeys.VIS_NY_UTBETALING_MODAL;
}

export interface SkjulNyUtbetalingModal {
    type: V2ActionTypeKeys.SKJUL_NY_UTBETALING_MODAL;
}

export interface VisNyVilkarModal {
    type: V2ActionTypeKeys.VIS_NY_VILKAR_MODAL;
}

export interface SkjulNyVilkarModal {
    type: V2ActionTypeKeys.SKJUL_NY_VILKAR_MODAL;
}

export interface VisNyDokumentasjonkravModal {
    type: V2ActionTypeKeys.VIS_NY_DOKUMENTASJONKRAV_MODAL;
}

export interface SkjulNyDokumentasjonkravModal {
    type: V2ActionTypeKeys.SKJUL_NY_DOKUMENTASJONKRAV_MODAL;
}

export interface VisNyRammevedtakModal {
    type: V2ActionTypeKeys.VIS_NY_RAMMEVEDTAK_MODAL;
}

export interface SkjulNyRammevedtakModal {
    type: V2ActionTypeKeys.SKJUL_NY_RAMMEVEDTAK_MODAL;
}

export interface SkjulNyDokumentasjonEtterspurtModal {
    type: V2ActionTypeKeys.SKJUL_NY_DOKUMENTASJON_ETTERSPURT_MODAL;
}

export interface SetSoknadsStatus {
    type: V2ActionTypeKeys.SET_SOKNADS_STATUS;
    soknadsStatus: SoknadsStatusType;
}

export interface VisEndreNavKontorModal {
    type: V2ActionTypeKeys.VIS_ENDRE_NAV_KONTOR_MODAL,
}

export interface SkjulEndreNavKontorModal {
    type: V2ActionTypeKeys.SKJUL_ENDRE_NAV_KONTOR_MODAL,
}

export interface VisSystemSettingsModal {
    type: V2ActionTypeKeys.VIS_SYSTEM_SETTINGS_MODAL,
}

export interface SkjulSystemSettingsModal {
    type: V2ActionTypeKeys.SKJUL_SYSTEM_SETTINGS_MODAL,
}

export interface VisSuccessSnackbar {
    type: V2ActionTypeKeys.VIS_SUCCESS_SNACKBAR,
}

export interface VisErrorSnackbar {
    type: V2ActionTypeKeys.VIS_ERROR_SNACKBAR,
}

export interface SkjulSnackbar {
    type: V2ActionTypeKeys.SKJUL_SNACKBAR,
}

// Aktive ting
export interface SetAktivSoknad {
    type: V2ActionTypeKeys.SET_AKTIV_SOKNAD;
    fiksDigisosId: string
}

export interface SetAktivSak {
    type: V2ActionTypeKeys.SET_AKTIV_SAK;
    saksIndex: number
}

export interface SetAktivUtbetaling {
    type: V2ActionTypeKeys.SET_AKTIV_UTBETALING;
    referanse: string | null
}

export interface SetAktivtVilkar {
    type: V2ActionTypeKeys.SET_AKTIVT_VILKAR;
    referanse: string | null
}

export interface SetAktivtDokumentasjonkrav {
    type: V2ActionTypeKeys.SET_AKTIVT_DOKUMENTASJONKRAV;
    referanse: string | null
}

export interface SetAktivtRammevedtak {
    type: V2ActionTypeKeys.SET_AKTIVT_RAMMEVEDTAK;
    referanse: string | null
}

// Nye ting
export interface NySaksStatus {
    type: V2ActionTypeKeys.NY_SAKS_STATUS;
    saksStatus: SaksStatus;
}

export interface SettNySaksStatus {
    type: V2ActionTypeKeys.SETT_NY_SAKS_STATUS;
    soknadFiksDigisosId: string;
    saksStatusReferanse: string;
    nySaksStatus: SaksStatusType;
}
