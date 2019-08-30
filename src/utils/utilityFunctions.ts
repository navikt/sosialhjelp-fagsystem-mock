import {HendelseType} from "../types/hendelseTypes";

const tildeltNavKontorSchema = require('../digisos/hendelse/tildeltNavKontor');
const soknadsStatusSchema = require('../digisos/hendelse/soknadsStatus');
const vedtakFattetSchema = require('../digisos/hendelse/vedtakFattet');
const dokumentasjonEtterspurtSchema = require('../digisos/hendelse/dokumentasjonEtterspurt');
const forelopigSvarSchema = require('../digisos/hendelse/forelopigSvar');
const saksStatusSchema = require('../digisos/hendelse/saksStatus');
const utbetalingSchema = require('../digisos/hendelse/utbetaling');
const vilkarSchema = require('../digisos/hendelse/vilkar');
const rammevedtakSchema = require('../digisos/hendelse/rammevedtak');


export function mergeListsToLengthN<T> (
    inputList: T[],
    maximumList: T[],
    n: number
): T[] {

    const m: number = inputList.length;
    let outputList: T[];

    if (n < m){
        // Fjern overflødige elementer i lista. Siden det spoles tilbake i tid.
        outputList = inputList.slice(0, n);
    } else {
        // Legg til nye elementer i lista fra komplett liste, men ikke endre de som allerede er der
        const listOfElementsToAdd: T[] = maximumList.slice(m, n);
        outputList = inputList.concat(listOfElementsToAdd);
    }

    return outputList
}


export function getSchemaByHendelseType(type: any) {
    switch (type){
        case HendelseType.tildeltNavKontor: return tildeltNavKontorSchema;
        case HendelseType.soknadsStatus: return soknadsStatusSchema;
        case HendelseType.vedtakFattet: return vedtakFattetSchema;
        case HendelseType.dokumentasjonEtterspurt: return dokumentasjonEtterspurtSchema;
        case HendelseType.forelopigSvar: return forelopigSvarSchema;
        case HendelseType.saksStatus: return saksStatusSchema;
        case HendelseType.utbetaling: return utbetalingSchema;
        case HendelseType.vilkar: return vilkarSchema;
        case HendelseType.rammevedtak: return rammevedtakSchema;
        default: return soknadsStatusSchema;
    }
}


