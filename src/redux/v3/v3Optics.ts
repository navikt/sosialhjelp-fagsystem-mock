import {array} from "fp-ts/es6/Array";
import {Lens, fromTraversable, Prism, Traversal} from "monocle-ts/es6";

import {V3State} from "./v3Types";
import {FsSaksStatus, FsSoknad} from "./v3FsTypes";
import Hendelse, {SaksStatusType} from "../../types/hendelseTypes";








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

// sak
export const fsSaker: Lens<FsSoknad, FsSaksStatus[]> = Lens.fromProp<FsSoknad>()('saker');
export const fsSakerTraversal: Traversal<FsSaksStatus[], FsSaksStatus> = fromTraversable(array)<FsSaksStatus>();
export const getFsSaksStatus = (referanse: string): Prism<FsSaksStatus, FsSaksStatus> => Prism.fromPredicate(fsSaksStatus => fsSaksStatus.referanse === referanse);
export const fsSaksStatusStatus: Lens<FsSaksStatus, SaksStatusType> = Lens.fromProp<FsSaksStatus>()('status');
