import React from 'react';
import { generateFilreferanseId, getAllSaksStatuser, getLastHendelseOfType } from './utilityFunctions';
import Hendelse, {
    FiksDigisosSokerJson,
    HendelseType,
    SaksStatusType,
    SoknadsStatus,
    SoknadsStatusType,
    TildeltNavKontor
} from '../types/hendelseTypes';

it('returns the last occurence of a hendelse type', () => {

    const fiksDigisosSokerJson: FiksDigisosSokerJson = {
        "sak": {
            "soker": {
                "version": "1.0.0",
                "avsender": {
                    "systemnavn": "Testsystemet",
                    "systemversjon": "1.0.0"
                },
                "hendelser": [
                    {
                        "type": "soknadsStatus",
                        "hendelsestidspunkt": "2018-10-04T13:37:00.134Z",
                        "status": "MOTTATT"
                    } as SoknadsStatus,
                    {
                        "type": "tildeltNavKontor",
                        "hendelsestidspunkt": "2018-10-04T13:42:00.134Z",
                        "navKontor": "0314"
                    } as TildeltNavKontor,
                    {
                        "type": "soknadsStatus",
                        "hendelsestidspunkt": "2018-10-04T13:52:00.134Z",
                        "status": "UNDER_BEHANDLING"
                    } as SoknadsStatus
                ]
            }
        },
        "type": "no.nav.digisos.digisos.soker.v1"
    };

    expect(getLastHendelseOfType(fiksDigisosSokerJson, HendelseType.SoknadsStatus)).toEqual(
        {
            "type": "soknadsStatus",
            "hendelsestidspunkt": "2018-10-04T13:52:00.134Z",
            "status": "UNDER_BEHANDLING"
        }
    );

});

it('validated that the input is a string consisting of x digits', () => {

    const input: Hendelse[] = [
        {
            "type": HendelseType.SoknadsStatus,
            "hendelsestidspunkt": "2018-10-04T13:37:00.134Z",
            "status": SoknadsStatusType.MOTTATT
        },
        {
            "type":HendelseType.SoknadsStatus,
            "hendelsestidspunkt": "2019-9-2T12:19:51:771Z",
            "status": SoknadsStatusType.UNDER_BEHANDLING
        },
        {
            // @ts-ignore
            "type": "saksStatus",
            "hendelsestidspunkt": "2019-9-2T12:19:27:520Z",
            "status": SaksStatusType.UNDER_BEHANDLING,
            "referanse": "SAK1",
            "tittel": "Nødhjelp"
        },
        {
            // @ts-ignore
            "type":HendelseType.SoknadsStatus,
            "hendelsestidspunkt": "2019-9-2T12:19:57:635Z",
            "status": SoknadsStatusType.FERDIGBEHANDLET
        },
        {
            // @ts-ignore
            "type": "saksStatus",
            "hendelsestidspunkt": "2019-9-2T12:19:27:520Z",
            "status": SaksStatusType.IKKE_INNSYN,
            "referanse": "SAK1",
            "tittel": "Nødhjelp"
        },
        {
            // @ts-ignore
            "type":HendelseType.SoknadsStatus,
            "hendelsestidspunkt": "2019-9-2T12:20:2:248Z",
            "status": SoknadsStatusType.BEHANDLES_IKKE
        },
        {
            // @ts-ignore
            "type": "saksStatus",
            "hendelsestidspunkt": "2019-9-2T12:19:27:520Z",
            "status": SaksStatusType.BEHANDLES_IKKE,
            "referanse": "SAK1",
            "tittel": "Nødhjelp"
        }
    ];

    const expectedOutput = [
        {
            "type": "saksStatus",
            "hendelsestidspunkt": "2019-9-2T12:19:27:520Z",
            "status": "UNDER_BEHANDLING",
            "referanse": "SAK1",
            "tittel": "Nødhjelp"
        },
        {
            "type": "saksStatus",
            "hendelsestidspunkt": "2019-9-2T12:19:27:520Z",
            "status": "IKKE_INNSYN",
            "referanse": "SAK1",
            "tittel": "Nødhjelp"
        },
        {
            "type": "saksStatus",
            "hendelsestidspunkt": "2019-9-2T12:19:27:520Z",
            "status": "BEHANDLES_IKKE",
            "referanse": "SAK1",
            "tittel": "Nødhjelp"
        }
    ];

    expect(getAllSaksStatuser(input)).toEqual(expectedOutput)
});

it('doesnt fail' , () => {
    let s = generateFilreferanseId();
    expect(s).resolves;
});

