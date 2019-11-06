import React from 'react';
import {
    addZeroInFrontAndToString,
    generateFilreferanseId,
    getAllSaksStatuser,
    getLastHendelseOfType,
    isNDigits
} from "./utilityFunctions";
import Hendelse, {FiksDigisosSokerJson, HendelseType, SoknadsStatus, TildeltNavKontor} from "../types/hendelseTypes";

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
    expect(isNDigits("1234", 4)).toEqual(true);
    expect(isNDigits("1234", 5)).toEqual(false);
    expect(isNDigits("12345", 5)).toEqual(true);
});


it('validated that the input is a string consisting of x digits', () => {

    const input: Hendelse[] = [
        {
            // @ts-ignore
            "type": "soknadsStatus",
            "hendelsestidspunkt": "2018-10-04T13:37:00.134Z",
            "status": "MOTTATT"
        },
        {
            // @ts-ignore
            "type": "soknadsStatus",
            "hendelsestidspunkt": "2019-9-2T12:19:51:771Z",
            "status": "UNDER_BEHANDLING"
        },
        {
            // @ts-ignore
            "type": "saksStatus",
            "hendelsestidspunkt": "2019-9-2T12:19:27:520Z",
            "status": "UNDER_BEHANDLING",
            "referanse": "SAK1",
            "tittel": "Nødhjelp"
        },
        {
            // @ts-ignore
            "type": "soknadsStatus",
            "hendelsestidspunkt": "2019-9-2T12:19:57:635Z",
            "status": "FERDIGBEHANDLET"
        },
        {
            // @ts-ignore
            "type": "saksStatus",
            "hendelsestidspunkt": "2019-9-2T12:19:27:520Z",
            "status": "IKKE_INNSYN",
            "referanse": "SAK1",
            "tittel": "Nødhjelp"
        },
        {
            // @ts-ignore
            "type": "soknadsStatus",
            "hendelsestidspunkt": "2019-9-2T12:20:2:248Z",
            "status": "BEHANDLES_IKKE"
        },
        {
            // @ts-ignore
            "type": "saksStatus",
            "hendelsestidspunkt": "2019-9-2T12:19:27:520Z",
            "status": "BEHANDLES_IKKE",
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



it('doesnt fail' , () => {
    expect(addZeroInFrontAndToString(1)).toEqual("01");
    expect(addZeroInFrontAndToString(10)).toEqual("10");
    expect(addZeroInFrontAndToString(3)).toEqual("03");
    expect(addZeroInFrontAndToString(13)).toEqual("13");

});


