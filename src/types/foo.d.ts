/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Feltet "type" angir hvilken type hendelse det er. Se egen definisjon per hendelse. Det som er dokumentert direkte under er kun det som er felles for alle hendelser.
 */
export type Hendelse =
  | NyttNAVKontorBehandlerSoknaden
  | NyStatusPaSoknaden
  | EtVedtakITilknytningTilSoknadenHarBlittFattet
  | VeilederBerOmMerDokumentasjonFraSoker
  | ForelopigSvar
  | EnSakITilknytningTilSoknadenHarBlittOpprettetOgHarStatus
  | Utbetaling
  | Vilkar
  | Rammevedtak;
export type NyttNAVKontorBehandlerSoknaden = {
  type?: "TildeltNavKontor";
  [k: string]: any;
};
export type NyStatusPaSoknaden = {
  type?: "SoknadsStatus";
  [k: string]: any;
};
/**
 * Det er kun vedtak som ligger inn under Sosialtjenesteloven som skal sendes.
 */
export type EtVedtakITilknytningTilSoknadenHarBlittFattet = {
  type?: "VedtakFattet";
  [k: string]: any;
};
export type VeilederBerOmMerDokumentasjonFraSoker = {
  type?: "DokumentasjonEtterspurt";
  [k: string]: any;
};
export type ForelopigSvar = {
  type?: "ForelopigSvar";
  [k: string]: any;
};
/**
 * Status på sak som vil resultere i et vedtak.
 */
export type EnSakITilknytningTilSoknadenHarBlittOpprettetOgHarStatus = {
  type?: "SaksStatus";
  [k: string]: any;
};
/**
 * Utbetalingsinformasjon
 */
export type Utbetaling = {
  type?: "Utbetaling";
  [k: string]: any;
};
/**
 * Vilkar
 */
export type Vilkar = {
  type?: "Vilkar";
  [k: string]: any;
};
/**
 * Rammevedtak
 */
export type Rammevedtak = {
  type?: "Rammevedtak";
  [k: string]: any;
};
