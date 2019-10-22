import {FsSoknad} from "./v3FsTypes";
import {FiksDigisosSokerJson, HendelseType, SoknadsStatus, SoknadsStatusType} from "../../types/hendelseTypes";
import {getNow} from "../../utils/utilityFunctions";

export const getInitialFsSoknad = (
    fiksDigisosId: string,
    fnr: string,
    navn: string
): FsSoknad => {

    const initialSoknadsStatusHendelse: SoknadsStatus = {
        type: HendelseType.SoknadsStatus,
        hendelsestidspunkt: getNow(),
        status: SoknadsStatusType.MOTTATT
    };

    return {
        fiksDigisosId,
        fnr,
        navn,
        soknadsStatus: initialSoknadsStatusHendelse,
        navKontor: undefined,
        dokumentasjonEtterspurt: undefined,
        forelopigSvar: undefined,
        vilkar: [],
        dokumentasjonkrav: [],
        rammevedtak: [],
        saker: [],
        fiksDigisosSokerJson: {
            sak: {
                soker: {
                    version: "1.0.0",
                    avsender: {
                        systemnavn: "Testsystemet",
                        systemversjon: "1.0.0"
                    },
                    hendelser: [
                        initialSoknadsStatusHendelse
                    ]
                }
            },
            type: "no.nav.digisos.digisos.soker.v1"
        } as FiksDigisosSokerJson,
    }
};

