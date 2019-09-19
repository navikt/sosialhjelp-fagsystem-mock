import {HendelseType, SoknadsStatus, SoknadsStatusType} from "../types/hendelseTypes";

export const minimal = {
    "sak": {
        "soker": {
            "version": "1.0.0",
            "avsender": {
                "systemnavn": "Testsystemet",
                "systemversjon": "1.0.0"
            },
            "hendelser": [
                {
                    "type": HendelseType.SoknadsStatus,
                    "hendelsestidspunkt": "2018-10-04T13:37:00.134Z",
                    "status": SoknadsStatusType.MOTTATT
                } as SoknadsStatus
            ]
        }
    },
    "type": "no.nav.digisos.digisos.soker.v1"
}