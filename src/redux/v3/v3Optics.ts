import {array} from "fp-ts/es6/Array";
import {fromTraversable, Lens, Prism} from "monocle-ts/es6";

import {V3State} from "./v3Types";
import {FsSaksStatus, FsSoknad} from "./v3FsTypes";
import Hendelse, {Dokumentasjonkrav, Rammevedtak, Utbetaling, Vilkar} from "../../types/hendelseTypes";


export const oFsSoknader = Lens.fromProp<V3State>()('soknader');
export const oFsSoknaderTraversal = fromTraversable(array)<FsSoknad>();
export const oGetFsSoknadPrism = (fiksDigisosId: string): Prism<FsSoknad, FsSoknad> => Prism.fromPredicate(fsSoknad => fsSoknad.fiksDigisosId === fiksDigisosId);

export const oHendelser = Lens.fromPath<FsSoknad>()(['fiksDigisosSokerJson', 'sak', 'soker', 'hendelser']);
export const oHendelserTraversal = fromTraversable(array)<Hendelse>();

// Soknad
export const oGetSoknad = (forFiksDigisosId: string) => {
    return oFsSoknader
        .composeTraversal(oFsSoknaderTraversal)
        .composePrism(oGetFsSoknadPrism(forFiksDigisosId))
};

// Hendelser
export const oGetHendelser = () => {
    return
}

// TildelNavKontor
export const oNavKontor = Lens.fromProp<FsSoknad>()('navKontor');

// DokumentasjonEtterspurt
export const oDokumentasjonEtterspurt = Lens.fromProp<FsSoknad>()('dokumentasjonEtterspurt');

// ForelopigSvar
export const oForelopigSvar = Lens.fromProp<FsSoknad>()('forelopigSvar');

// sak
export const oFsSaker = Lens.fromProp<FsSoknad>()('saker');
export const oFsSakerTraversal = fromTraversable(array)<FsSaksStatus>();
export const oFsSaksStatusPrism = (referanse: string): Prism<FsSaksStatus, FsSaksStatus> => Prism.fromPredicate(fsSaksStatus => fsSaksStatus.referanse === referanse);
export const oFsSaksStatusStatus = Lens.fromProp<FsSaksStatus>()('status');

// Vilkår
export const oFsVilkar = Lens.fromProp<FsSoknad>()('vilkar');
export const oFsVilkarTraversal = fromTraversable(array)<Vilkar>();
export const oFsVilkarPrism = (referanse: string): Prism<Vilkar, Vilkar> => Prism.fromPredicate(vilkar => vilkar.vilkarreferanse === referanse);

// Dokumentasjonkrav
export const oFsDokumentasjonkrav = Lens.fromProp<FsSoknad>()('dokumentasjonkrav');
export const oFsDokumentasjonkravTraversal = fromTraversable(array)<Dokumentasjonkrav>();
export const oFsDokumentasjonkravPrism = (referanse: string): Prism<Dokumentasjonkrav, Dokumentasjonkrav> => Prism.fromPredicate(dokumentasjonkrav => dokumentasjonkrav.dokumentasjonkravreferanse === referanse);

// Rammevedtak
export const oFsRammevedtak = Lens.fromProp<FsSoknad>()('rammevedtak');
export const oFsRammevedtakTraversal = fromTraversable(array)<Rammevedtak>();
export const oFsRammevedtakPrism = (referanse: string): Prism<Rammevedtak, Rammevedtak> => Prism.fromPredicate(rammevedtak => rammevedtak.rammevedtaksreferanse === referanse);

export const oFsSaksStatusUtbetalinger = Lens.fromProp<FsSaksStatus>()('utbetalinger');
export const oFsSaksStatusUtbetalingerTraversal = fromTraversable(array)<Utbetaling>();
export const oFsUtbetalingPrism = (referanse: string): Prism<Utbetaling, Utbetaling> => Prism.fromPredicate(utbetaling => utbetaling.utbetalingsreferanse === referanse);

export const oFsSaksStatusRammevedtak = Lens.fromProp<FsSaksStatus>()('rammevedtak');

export const oGetFsSaksStatus = (forFsSaksStatusReferanse: string) => {
    return oFsSaker
        .composeTraversal(oFsSakerTraversal)
        .composePrism(oFsSaksStatusPrism(forFsSaksStatusReferanse))
};