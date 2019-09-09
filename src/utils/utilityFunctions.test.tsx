import React from 'react';
import {getAllSaksStatuser, getLastHendelseOfType, isNDigits, mergeListsToLengthN} from "./utilityFunctions";
import Hendelse, {FiksDigisosSokerJson, HendelseType, soknadsStatus, tildeltNavKontor} from "../types/hendelseTypes";

it('returnerer en liste med riktig komponenter', () => {

    const komplett = ["a", "b", "c", "d", "e", "f"];

    const current1 = ["a", "b"];
    const n1 = 3;
    expect(mergeListsToLengthN(current1, komplett, n1)).toEqual(
        ["a", "b", "c"]
    );

    const current2 = ["a", "b"];
    const n2 = 1;
    expect(mergeListsToLengthN(current2, komplett, n2)).toEqual(
        ["a"]
    );

    const current3 = ["a"];
    const n3 = 6;
    expect(mergeListsToLengthN(current3, komplett, n3)).toEqual(
        ["a", "b", "c", "d", "e", "f"]
    );

    const current4 = ["x", "y", "z"];
    const n4 = 6;
    expect(mergeListsToLengthN(current4, komplett, n4)).toEqual(
        ["x", "y", "z", "d", "e", "f"]
    );
});

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
                    } as soknadsStatus,
                    {
                        "type": "tildeltNavKontor",
                        "hendelsestidspunkt": "2018-10-04T13:42:00.134Z",
                        "navKontor": "0314"
                    } as tildeltNavKontor,
                    {
                        "type": "soknadsStatus",
                        "hendelsestidspunkt": "2018-10-04T13:52:00.134Z",
                        "status": "UNDER_BEHANDLING"
                    } as soknadsStatus
                ]
            }
        },
        "type": "no.nav.digisos.digisos.soker.v1"
    };

    expect(getLastHendelseOfType(fiksDigisosSokerJson, HendelseType.soknadsStatus)).toEqual(
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


