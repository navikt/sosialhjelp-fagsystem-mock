import Hendelse, {
    Dokumentasjonkrav,
    Dokumentlager,
    DokumentlagerExtended,
    FiksDigisosSokerJson, FilreferanseType,
    HendelseType,
    SaksStatus, SaksStatusType, Svarut,
    SvarutExtended, Utbetaling, Vedlegg,
    VedtakFattet, Vilkar
} from "../types/hendelseTypes";
import {Filreferanselager, V2Model} from "../redux/v2/v2Types";
import {Soknad} from "../types/additionalTypes";
import {FsSaksStatus, FsSoknad} from "../redux/v3/v3FsTypes";
import {generateNyFsSaksStatus} from "../redux/v3/v3UtilityFunctions";
import {instanceOf} from "prop-types";

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
        case HendelseType.TildeltNavKontor: return tildeltNavKontorSchema;
        case HendelseType.SoknadsStatus: return soknadsStatusSchema;
        case HendelseType.VedtakFattet: return vedtakFattetSchema;
        case HendelseType.DokumentasjonEtterspurt: return dokumentasjonEtterspurtSchema;
        case HendelseType.ForelopigSvar: return forelopigSvarSchema;
        case HendelseType.SaksStatus: return saksStatusSchema;
        case HendelseType.Utbetaling: return utbetalingSchema;
        case HendelseType.Vilkar: return vilkarSchema;
        case HendelseType.Rammevedtak: return rammevedtakSchema;
        default: return soknadsStatusSchema;
    }
}


export const getLastHendelseOfType = (fiksDigisosSokerJson: FiksDigisosSokerJson, hendelseType: HendelseType): Hendelse | undefined => {

    const hendelser: Hendelse[] = fiksDigisosSokerJson.sak.soker.hendelser;
    const hendelserCopied: Hendelse[] = hendelser.slice();
    return hendelserCopied.reverse().find((hendelse: Hendelse) => hendelse.type === hendelseType);
};

export function getNow(): string {
    return new Date().toISOString();
}

export function formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = addZeroInFrontAndToString(date.getMonth() + 1);
        const day = addZeroInFrontAndToString(date.getDate());
        const hour = addZeroInFrontAndToString(date.getHours());
        const minutes = addZeroInFrontAndToString(date.getMinutes());
        const seconds = addZeroInFrontAndToString(date.getSeconds());
        const millis = fixMillisecondsThreeDigits(date.getMilliseconds());

        if (millis.toString().length === 3 ){
            return `${year}-${month}-${day}T${hour}:${minutes}:${seconds}:${millis}Z`
        } else {
            throw Error("Length of millis is not 3. Fix the getNow() function!")
        }
}

export const addZeroInFrontAndToString = (number: number): string => {
    return number < 10 ? `0${number}` : `${number}`;
};

export const fixMillisecondsThreeDigits = (milliseconds: number): string => {
    if (milliseconds < 10){
        return `00${milliseconds}`
    }
    if (milliseconds < 100){
        return `0${milliseconds}`
    }
    return `${milliseconds}`
};

export const isNDigits = (value: string, n_digits: number): boolean => {
    const a: RegExpMatchArray | null = value.match(`^[0-9]{${n_digits}}$`);
    return !!a
};

export const getAllSaksStatuser = (hendelser: Hendelse[]): SaksStatus[] => {
    return hendelser
        .filter((hendelse: Hendelse) => {
            switch (hendelse.type) {
                case HendelseType.SaksStatus: {
                    return true;
                }
                default: {
                    return false;
                }
            }
        })
        .map((saksStatusHendelse: Hendelse) => {
            return saksStatusHendelse as SaksStatus;
        });
};

export const sakEksistererOgEtVedtakErIkkeFattet = (hendelser: Hendelse[], saksReferanse: string): boolean => {
    const saksStatus: Hendelse | undefined = hendelser.find((hendelse) => hendelse.type === HendelseType.SaksStatus && (hendelse as SaksStatus).referanse === saksReferanse);
    const vedtakForSaksStatus: Hendelse | undefined = hendelser.find((hendelse) => {
        return hendelse.type === HendelseType.VedtakFattet && (hendelse as VedtakFattet).saksreferanse === saksReferanse;
    });

    return !!(saksStatus && !vedtakForSaksStatus);
};

export const generateFilreferanseId = (): string => {

    const listOfCharacters: string[] = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
    const n = listOfCharacters.length;

    const r: string[] = [];
    for (let i = 0; i < 32; i++){
        const idx = Math.floor(Math.random() * n);
        const randomCharacter = listOfCharacters[idx];
        r.push(randomCharacter);
    }
    const jp = "";
    return `${r.slice(0, 8).join(jp)}-${r.slice(8, 12).join(jp)}-${r.slice(12, 16).join(jp)}-${r.slice(16, 20).join(jp)}-${r.slice(20).join(jp)}`;
};

export const convertToFilreferanse = (extended: SvarutExtended | DokumentlagerExtended): Svarut | Dokumentlager => {
    switch (extended.type) {
        case FilreferanseType.svarut: {
            return {
                type: FilreferanseType.svarut,
                id: extended.id,
                nr: extended.nr
            } as Svarut;
        }
        default: {
            return {
                type: FilreferanseType.dokumentlager,
                id: extended.id
            } as Dokumentlager
        }
    }
};

export const convertToListOfVedlegg = (vedleggsliste: (SvarutExtended | DokumentlagerExtended)[]): Vedlegg[] => {
    return vedleggsliste.map((vedlegg: (SvarutExtended | DokumentlagerExtended)) => {
        return {
            tittel: vedlegg.tittel,
            referanse: convertToFilreferanse(vedlegg)

        } as Vedlegg
    }) as Vedlegg[];
};

export const getFilreferanseExtended = (id: string, filreferanselager: Filreferanselager) => {
    let filreferanse: SvarutExtended | DokumentlagerExtended | undefined = filreferanselager.dokumentlager.find((d) => {
        return d.id === id;
    });
    if (filreferanse === undefined){
        filreferanse = filreferanselager.svarutlager.find((d) => {
            return d.id === id;
        });
    }
    return filreferanse;
};

export const getSoknadByFiksDigisosId = (soknader: Soknad[], fiksDigisosId: string) => {
    return soknader.find(s => {
        return s.fiksDigisosId === fiksDigisosId
    })
};

export const getFsSoknadByFiksDigisosId = (soknader: FsSoknad[], fiksDigisosId: string): FsSoknad | undefined => {
    return soknader.find(s => {
        return s.fiksDigisosId === fiksDigisosId
    })
};

export const getFsSaksStatusByReferanse = (saker: FsSaksStatus[], saksreferanse: string): FsSaksStatus | undefined => {
    return saker.find(s => {
        return s.referanse === saksreferanse
    })
};

export const getFsSaksStatusByIdx = (saker: FsSaksStatus[], idx: number|undefined): FsSaksStatus => {
    if (typeof idx == 'undefined' || saker.length == 0) {
        return generateNyFsSaksStatus("");
    }
    return saker[idx];
};

export const getUtbetalingByUtbetalingsreferanse = (utbetalinger: Utbetaling[], referanse: string): Utbetaling | undefined => {
    return utbetalinger.find(s => {
        return s.utbetalingsreferanse === referanse
    })
};

export const getVilkarByVilkarreferanse = (vilkar: Vilkar[], referanse: string): Vilkar | undefined => {
    return vilkar.find(s => {
        return s.vilkarreferanse === referanse
    })
};

export const getDokumentasjonkravByDokumentasjonkravreferanse = (dokumentasjonkrav: Dokumentasjonkrav[], referanse: string): Dokumentasjonkrav | undefined => {
    return dokumentasjonkrav.find(s => {
        return s.dokumentasjonkravreferanse === referanse
    })
};

export const getSaksStatusByReferanse = (soknad: Soknad, referanse: string) => {
    return soknad.saker.find((sak: SaksStatus) => {
        return sak.referanse === referanse;
    })
};

export const updateSoknadInSoknader = (soknad: Soknad, soknader: Soknad[]) => {
    return soknader.map((s) => {
        if (s.fiksDigisosId === soknad.fiksDigisosId){
            return soknad;
        } else {
            return s;
        }
    })
};

// export const asdf = (): V2Model => {
//     const hendelserUpdated = soknadUpdated.fiksDigisosSokerJson.sak.soker.hendelser.map(h => h);
//     hendelserUpdated.push(nySaksStatus);
//     const soknaderUpdated = state.soknader.map((soknad: Soknad) => {
//         if (soknad.fnr === soknadUpdated.fnr){
//             return soknadUpdated
//         }
//         return soknad
//     });
//
// };


