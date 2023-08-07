import React from "react";
import { DispatchProps } from "../../../redux/reduxTypes";
import { connect } from "react-redux";
import {
  Dokumentasjonkrav,
  DokumentasjonkravStatus,
} from "../../../types/hendelseTypes";

import {
  setAktivtDokumentasjonkrav,
  visNyDokumentasjonkravModal,
} from "../../../redux/actions";
import { formatDateString } from "../../../utils/utilityFunctions";
import { Button, Table } from "@navikt/ds-react";
import globals from "../../../globals.module.css";

interface OwnProps {
  dokumentasjonkrav: Dokumentasjonkrav;
}

type Props = DispatchProps & OwnProps;

const DokumentasjonkravTabView: React.FC<Props> = (props: Props) => {
  const { dokumentasjonkrav, dispatch } = props;

  const makeTableRow = (type: string, value: any) => {
    if (typeof value === "boolean") {
      value = value ? "Ja" : "Nei";
    }
    return (
      <Table.Row key={type}>
        <Table.HeaderCell scope="row">{type}</Table.HeaderCell>
        {value != null ? (
          <Table.DataCell align="right">{value.toString()}</Table.DataCell>
        ) : (
          <Table.DataCell align="right">Ikke utfylt</Table.DataCell>
        )}
      </Table.Row>
    );
  };

  const makeTableRowOfStatus = (
    type: string,
    value: DokumentasjonkravStatus | null
  ) => {
    let status = "";
    if (value != null) {
      status = value.toString();
      status = status.toLowerCase();
      status = status[0].toUpperCase() + status.slice(1);
      status = status.replace("_", " ");
    }
    return (
      <Table.Row key={type}>
        <Table.HeaderCell scope="row">{type}</Table.HeaderCell>
        {value != null ? (
          <Table.DataCell align="right">{status.toString()}</Table.DataCell>
        ) : (
          <Table.DataCell align="right">Ikke utfylt</Table.DataCell>
        )}
      </Table.Row>
    );
  };

  return (
    <>
      <Table className={globals.table} size="small">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell align="right">Verdi</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        {dokumentasjonkrav.utbetalingsreferanse != null &&
          dokumentasjonkrav.utbetalingsreferanse.length > 1 && (
            <Table.Body>
              {makeTableRow(
                "Dokumentasjonkravreferanse",
                dokumentasjonkrav.dokumentasjonkravreferanse
              )}

              {dokumentasjonkrav.utbetalingsreferanse.map((value, idx) => {
                if (idx === 0) {
                  return (
                    <Table.Row key={"Utbetalingsreferanse"}>
                      <Table.HeaderCell
                        rowSpan={
                          dokumentasjonkrav.utbetalingsreferanse
                            ? dokumentasjonkrav.utbetalingsreferanse.length
                            : 1
                        }
                        scope="row"
                      >
                        {"Utbetalingsreferanser"}
                      </Table.HeaderCell>
                      <Table.DataCell align="right">{value}</Table.DataCell>
                    </Table.Row>
                  );
                } else {
                  return (
                    <Table.Row key={"Utbetalingsreferanse" + idx}>
                      <Table.DataCell align="right">{value}</Table.DataCell>
                    </Table.Row>
                  );
                }
              })}
              {makeTableRow("Beskrivelse", dokumentasjonkrav.beskrivelse)}
              {makeTableRowOfStatus("Status", dokumentasjonkrav.status)}
            </Table.Body>
          )}
        {(dokumentasjonkrav.utbetalingsreferanse == null ||
          dokumentasjonkrav.utbetalingsreferanse.length <= 1) && (
          <Table.Body>
            {makeTableRow(
              "Dokumentasjonkravreferanse",
              dokumentasjonkrav.dokumentasjonkravreferanse
            )}
            {makeTableRow("Tittel", dokumentasjonkrav.tittel)}
            {makeTableRow("Beskrivelse", dokumentasjonkrav.beskrivelse)}
            {makeTableRow("Frist", formatDateString(dokumentasjonkrav.frist))}
            {makeTableRowOfStatus("Status", dokumentasjonkrav.status)}
            {makeTableRow(
              "Saksreferanse",
              dokumentasjonkrav.saksreferanse == null ||
                dokumentasjonkrav.saksreferanse.length === 0
                ? null
                : dokumentasjonkrav.saksreferanse
            )}
            {makeTableRow(
              "Utbetalingsreferanse",
              dokumentasjonkrav.utbetalingsreferanse == null ||
                dokumentasjonkrav.utbetalingsreferanse.length === 0
                ? null
                : dokumentasjonkrav.utbetalingsreferanse
            )}
          </Table.Body>
        )}
      </Table>
      <div className={globals.endreKnapp}>
        <Button
          size="small"
          variant="secondary-neutral"
          onClick={() => {
            dispatch(
              setAktivtDokumentasjonkrav(
                dokumentasjonkrav.dokumentasjonkravreferanse
              )
            );
            dispatch(visNyDokumentasjonkravModal());
          }}
        >
          Endre dokumentasjonkrav
        </Button>
      </div>
    </>
  );
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    dispatch,
  };
};

export default connect(mapDispatchToProps)(DokumentasjonkravTabView);
