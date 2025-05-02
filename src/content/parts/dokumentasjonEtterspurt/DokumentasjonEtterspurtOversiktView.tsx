import React from "react";
import { AppState } from "../../../redux/reduxTypes";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { FsSoknad } from "../../../redux/types";
import {
  Dokument,
  DokumentasjonEtterspurt,
  HendelseType,
} from "../../../types/hendelseTypes";
import { Button, Table, Heading, Panel } from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";
import styles from "./dokEtterpurt.module.css";
import { getNow, getShortDateISOString } from "../../../utils/utilityFunctions";
import { OPPDATER_DOKUMENTASJON_ETTERSPURT, VIS_NY_DOKUMENTASJON_ETTERSPURT_MODAL } from "../../../redux/reducer";
import { sendNyHendelseOgOppdaterModel } from "../../../redux/actions";

interface Props {
  soknad: FsSoknad;
}

const DokumentasjonEtterspurtOversiktView: React.FC<Props> = ({soknad}: Props) => {
  const model = useSelector((state: AppState) => state.model);
  const dispatch = useDispatch()

  const dokumenterErAlleredeEtterspurt =
    soknad.dokumentasjonEtterspurt &&
    soknad.dokumentasjonEtterspurt.dokumenter.length > 0;

  const makeTableRow = (dokument: Dokument) => {
    return (
      <Table.Row
        key={dokument.dokumenttype + dokument.tilleggsinformasjon + uuidv4()}
      >
        <Table.HeaderCell scope="row">{dokument.dokumenttype}</Table.HeaderCell>
        {dokument.tilleggsinformasjon != null ? (
          <Table.DataCell>{dokument.tilleggsinformasjon}</Table.DataCell>
        ) : (
          <Table.DataCell>Ikke utfylt</Table.DataCell>
        )}
        {dokument.innsendelsesfrist != null ? (
          <Table.DataCell align="right">
            {getShortDateISOString(new Date(dokument.innsendelsesfrist))}
          </Table.DataCell>
        ) : (
          <Table.DataCell align="right">Ikke utfylt</Table.DataCell>
        )}
      </Table.Row>
    );
  };

  function dispatchNyHendelseMedTomDokumentasjonEtterspurt() {
    if (soknad.dokumentasjonEtterspurt) {
      const nyHendelse: DokumentasjonEtterspurt = {
        type: HendelseType.DokumentasjonEtterspurt,
        hendelsestidspunkt: getNow(),
        forvaltningsbrev: soknad.dokumentasjonEtterspurt.forvaltningsbrev,
        vedlegg: [],
        dokumenter: [],
      };

      sendNyHendelseOgOppdaterModel(
        nyHendelse,
        model,
        dispatch,
        OPPDATER_DOKUMENTASJON_ETTERSPURT({forFiksDigisosId: soknad.fiksDigisosId, nyDokumentasjonEtterspurt: nyHendelse}),
      );
    }
  }

  return (
    <Panel className={`${styles.dokEtterspurt} ${globals.panel}`}>
      <Heading level="3" size="medium">
        Dokumentasjon som er etterspurt
      </Heading>
      <Button
        size="small"
        className={globals.fitContent}
        variant={!dokumenterErAlleredeEtterspurt ? "primary" : "secondary"}
        onClick={() => {
          if (dokumenterErAlleredeEtterspurt) {
            dispatchNyHendelseMedTomDokumentasjonEtterspurt();
          } else {
            dispatch(VIS_NY_DOKUMENTASJON_ETTERSPURT_MODAL);
          }
        }}
      >
        {soknad.dokumentasjonEtterspurt &&
        soknad.dokumentasjonEtterspurt.dokumenter.length > 0
          ? "Slett etterspurt dokumentasjon"
          : "Etterspør mer dokumentasjon"}
      </Button>

      {soknad.dokumentasjonEtterspurt &&
        soknad.dokumentasjonEtterspurt.dokumenter.length > 0 && (
          <div>
            <Table className={globals.table} size="small">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Type</Table.HeaderCell>
                  <Table.HeaderCell>Tilleggsinformasjon</Table.HeaderCell>
                  <Table.HeaderCell align="right">
                    Innsendelsesfrist
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {soknad.dokumentasjonEtterspurt &&
                  soknad.dokumentasjonEtterspurt.dokumenter.map((dokument) =>
                    makeTableRow(dokument),
                  )}
              </Table.Body>
            </Table>
            <div className={globals.endreKnapp}>
              <Button
                size="small"
                variant="secondary-neutral"
                onClick={() => {
                  dispatch(VIS_NY_DOKUMENTASJON_ETTERSPURT_MODAL);
                }}
              >
                Endre etterspurt dokumentasjon
              </Button>
            </div>
          </div>
        )}
    </Panel>
  );
};

export default DokumentasjonEtterspurtOversiktView;
