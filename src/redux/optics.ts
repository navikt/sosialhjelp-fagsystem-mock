import {fromTraversable, Lens, Prism} from "monocle-ts/es6";
import {Model} from "./types";
import {FsSaksStatus, FsSoknad} from "./types";
import Hendelse, {Dokumentasjonkrav, Utbetaling, Vilkar} from "../types/hendelseTypes";
import {array} from "fp-ts/lib/Array";


export const oFsSoknader = Lens.fromProp<Model>()('soknader');
export const oFsSoknaderTraversal = fromTraversable(array)<FsSoknad>();
export const oGetFsSoknadPrism = (fiksDigisosId: string): Prism<FsSoknad, FsSoknad> => Prism.fromPredicate(fsSoknad => fsSoknad.fiksDigisosId === fiksDigisosId);

export const oFiksDigisosId = Lens.fromPath<FsSoknad>()(['fiksDigisosId']);

export const oHendelser = Lens.fromPath<FsSoknad>()(['fiksDigisosSokerJson', 'sak', 'soker', 'hendelser']);
export const oHendelserTraversal = fromTraversable(array)<Hendelse>();

// Soknad
export const oGetSoknad = (forFiksDigisosId: string) => {
    return oFsSoknader
        .composeTraversal(oFsSoknaderTraversal)
        .composePrism(oGetFsSoknadPrism(forFiksDigisosId))
};

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

export const oFsUtbetalinger = Lens.fromProp<FsSoknad>()('utbetalingerUtenSaksreferanse');
export const oFsSaksStatusUtbetalinger = Lens.fromProp<FsSaksStatus>()('utbetalinger');
export const oFsUtbetalingerTraversal = fromTraversable(array)<Utbetaling>();
export const oFsUtbetalingPrism = (referanse: string): Prism<Utbetaling, Utbetaling> => Prism.fromPredicate(utbetaling => utbetaling.utbetalingsreferanse === referanse);

export const oGetFsSaksStatus = (forFsSaksStatusReferanse: string) => {
    return oFsSaker
        .composeTraversal(oFsSakerTraversal)
        .composePrism(oFsSaksStatusPrism(forFsSaksStatusReferanse))
};