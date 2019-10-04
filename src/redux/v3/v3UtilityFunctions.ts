import {
    HendelseType,
    SaksStatus, SaksStatusType,
} from "../../types/hendelseTypes";
import {FsSaksStatus} from "./v3FsTypes";
import {generateFilreferanseId, getNow} from "../../utils/utilityFunctions";

export const fsSaksStatusToSaksStatus = (fsSaksStatus: FsSaksStatus): SaksStatus => {
    return {
        type: HendelseType.SaksStatus,
        hendelsestidspunkt: fsSaksStatus.hendelsestidspunkt,
        referanse: fsSaksStatus.referanse,
        tittel: fsSaksStatus.tittel,
        status: fsSaksStatus.status
    } as SaksStatus;
};

export const generateNyFsSaksStatus = (tittel: string): FsSaksStatus => {
    return {
        type: HendelseType.SaksStatus,
        hendelsestidspunkt: getNow(),
        referanse: generateFilreferanseId(),
        tittel,
        status: SaksStatusType.UNDER_BEHANDLING,
        utbetalinger: [],
        vedtakFattet: undefined,
        rammevedtak: undefined,
        vilkar: [],
        dokumentasjonskrav: [],
    } as FsSaksStatus;
};