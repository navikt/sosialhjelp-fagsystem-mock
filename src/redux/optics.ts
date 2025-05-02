import { Lens } from "monocle-ts/es6";
import { FsSoknad } from "./types";

export const oHendelser = Lens.fromPath<FsSoknad>()([
  "fiksDigisosSokerJson",
  "sak",
  "soker",
  "hendelser",
]);

