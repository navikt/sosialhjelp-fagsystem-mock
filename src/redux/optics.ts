import { fromTraversable, Lens, Prism } from "monocle-ts/es6";
import { Model } from "./types";
import { FsSaksStatus, FsSoknad } from "./types";
import  {
  Dokumentasjonkrav,
  Utbetaling,
  Vilkar,
} from "../types/hendelseTypes";
import * as Array from "fp-ts/Array";

export const oFsSoknader = Lens.fromProp<Model>()("soknader");
export const oFsSoknaderTraversal = fromTraversable(Array.Traversable)<FsSoknad>();
export const oGetFsSoknadPrism = (
  fiksDigisosId: string
): Prism<FsSoknad, FsSoknad> =>
  Prism.fromPredicate((fsSoknad) => fsSoknad.fiksDigisosId === fiksDigisosId);



export const oHendelser = Lens.fromPath<FsSoknad>()([
  "fiksDigisosSokerJson",
  "sak",
  "soker",
  "hendelser",
]);


// Soknad
export const oGetSoknad = (forFiksDigisosId: string) => {
  return oFsSoknader
    .composeTraversal(oFsSoknaderTraversal)
    .composePrism(oGetFsSoknadPrism(forFiksDigisosId));
};

// TildelNavKontor
export const oNavKontor = Lens.fromProp<FsSoknad>()("navKontor");

// DokumentasjonEtterspurt
export const oDokumentasjonEtterspurt = Lens.fromProp<FsSoknad>()(
  "dokumentasjonEtterspurt"
);

// ForelopigSvar
export const oForelopigSvar = Lens.fromProp<FsSoknad>()("forelopigSvar");

// sak
export const oFsSaker = Lens.fromProp<FsSoknad>()("saker");
export const oFsSakerTraversal = fromTraversable(Array.Traversable)<FsSaksStatus>();
export const oFsSaksStatusPrism = (
  referanse: string
): Prism<FsSaksStatus, FsSaksStatus> =>
  Prism.fromPredicate((fsSaksStatus) => fsSaksStatus.referanse === referanse);
export const oFsSaksStatusStatus = Lens.fromProp<FsSaksStatus>()("status");

// Vilkår
export const oFsVilkar = Lens.fromProp<FsSoknad>()("vilkar");
export const oFsVilkarTraversal = fromTraversable(Array.Traversable)<Vilkar>();
export const oFsVilkarPrism = (referanse: string): Prism<Vilkar, Vilkar> =>
  Prism.fromPredicate((vilkar) => vilkar.vilkarreferanse === referanse);

// Dokumentasjonkrav
export const oFsDokumentasjonkrav =
  Lens.fromProp<FsSoknad>()("dokumentasjonkrav");
export const oFsDokumentasjonkravTraversal =
  fromTraversable(Array.Traversable)<Dokumentasjonkrav>();
export const oFsDokumentasjonkravPrism = (
  referanse: string
): Prism<Dokumentasjonkrav, Dokumentasjonkrav> =>
  Prism.fromPredicate(
    (dokumentasjonkrav) =>
      dokumentasjonkrav.dokumentasjonkravreferanse === referanse
  );

export const oFsUtbetalinger = Lens.fromProp<FsSoknad>()(
  "utbetalingerUtenSaksreferanse"
);
export const oFsSaksStatusUtbetalinger =
  Lens.fromProp<FsSaksStatus>()("utbetalinger");
export const oFsUtbetalingerTraversal = fromTraversable(Array.Traversable)<Utbetaling>();
export const oFsUtbetalingPrism = (
  referanse: string
): Prism<Utbetaling, Utbetaling> =>
  Prism.fromPredicate(
    (utbetaling) => utbetaling.utbetalingsreferanse === referanse
  );


