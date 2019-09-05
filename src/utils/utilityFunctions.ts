import HendelseBase, {FiksDigisosSokerJson, HendelseType, SoknadsStatus} from "../types/hendelseTypes";
import Hendelse from "../types/hendelseTypes";

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


export const getLastHendelseOfType = (fiksDigisosSokerJson: FiksDigisosSokerJson, hendelseType: HendelseType): Hendelse | undefined => {

    const hendelser: Hendelse[] = fiksDigisosSokerJson.sak.soker.hendelser;
    const hendelserCopied: Hendelse[] = hendelser.slice();
    return hendelserCopied.reverse().find((hendelse: Hendelse) => hendelse.type === hendelseType);
};

export function getNow(): string {
    const time = new Date().getTime();
    const date = new Date(time);

//    "2018-10-04T13:37:00.134Z"

    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDay() + 1;
    let hour = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    const millis = date.getMilliseconds();

    return `${year}-${month}-${day}T${hour}:${minutes}:${seconds}:${millis}Z`
}

export const isNDigits = (value: string, n_digits: number): boolean => {
    const a: RegExpMatchArray | null = value.match(`^[0-9]{${n_digits}}$`);
    return !!a
};