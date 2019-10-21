import {NavKontor} from "../../types/additionalTypes";
import {
    DokumentasjonEtterspurt,
    Dokumentasjonkrav,
    FiksDigisosSokerJson, ForelopigSvar,
    Rammevedtak,
    SaksStatus, SoknadsStatus,
    TildeltNavKontor,
    Utbetaling,
    VedtakFattet,
    Vilkar
} from "../../types/hendelseTypes";




export interface FsSoknad {
    // brukes som queryparam
    fiksDigisosId: string;

    // Brukes kun i visningen i woldenatm
    fnr: string;
    navn: string;

    // FS Hendelser
    soknadsStatus: SoknadsStatus; // Default mottatt, se minimum hendelse.json
    navKontor: TildeltNavKontor | undefined; // If undefined => vis knapp for "send til annet Nav kontor"
    dokumentasjonEtterspurt: DokumentasjonEtterspurt | undefined; // If undefined => vis knapp for "Etterspør dokumentasjon"
    forelopigSvar: ForelopigSvar | undefined; // If undefined => vis knapp for "Opprett og send foreløpig svar"
    vilkar: Vilkar[];
    dokumentasjonkrav: Dokumentasjonkrav[];
    saker: FsSaksStatus[];

    // hendelseJson, den som skal shippes avgårde
    fiksDigisosSokerJson: FiksDigisosSokerJson; // Default inneholder minimum hendelse.json
}

export interface FsSaksStatus extends SaksStatus {
    utbetalinger: Utbetaling[];
    vedtakFattet: VedtakFattet | undefined;
    rammevedtak: Rammevedtak | undefined;
    vilkar: Vilkar[];
    dokumentasjonskrav: Dokumentasjonkrav[];
}


