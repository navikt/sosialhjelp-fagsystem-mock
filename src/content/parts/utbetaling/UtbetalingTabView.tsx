import React from "react";
import { useDispatch } from "react-redux";
import { Utbetaling, UtbetalingStatus } from "../../../types/hendelseTypes";

import { Button, Table } from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";
import styles from "./utbetaling.module.css";
import {
  SET_AKTIV_UTBETALING,
  VIS_NY_UTBETALING_MODAL,
} from "../../../redux/reducer";

interface Props {
  utbetaling: Utbetaling;
}

const UtbetalingTabView: React.FC<Props> = ({ utbetaling }: Props) => {
  const dispatch = useDispatch();

  const makeTableRow = (
    type: string,
    value: boolean | string | number | null,
  ) => {
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
    value: UtbetalingStatus | null,
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
    <div>
      <Table className={globals.table} size="small">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell align="right">Verdi</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {makeTableRow(
            "Utbetalingsreferanse",
            utbetaling.utbetalingsreferanse,
          )}
          {makeTableRow("Saksreferanse", utbetaling.saksreferanse)}
          {makeTableRowOfStatus("Status", utbetaling.status)}
          {makeTableRow("Beløp", utbetaling.belop)}
          {makeTableRow("Beskrivelse", utbetaling.beskrivelse)}
          {makeTableRow("Forfallsdato", utbetaling.forfallsdato)}
          {makeTableRow("Utbetalingsdato", utbetaling.utbetalingsdato)}
          {makeTableRow("fom", utbetaling.fom)}
          {makeTableRow("tom", utbetaling.tom)}
          {makeTableRow("Annen mottaker", utbetaling.annenMottaker)}
          {makeTableRow("Mottaker", utbetaling.mottaker)}
          {makeTableRow("Kontonummer", utbetaling.kontonummer)}
          {makeTableRow("Utbetalingsmetode", utbetaling.utbetalingsmetode)}
        </Table.Body>
      </Table>
      <div className={styles.endreUtbetaling}>
        <Button
          size="small"
          variant={"secondary-neutral"}
          onClick={() => {
            dispatch(SET_AKTIV_UTBETALING(utbetaling.utbetalingsreferanse));
            dispatch(VIS_NY_UTBETALING_MODAL(utbetaling.saksreferanse));
          }}
        >
          Endre utbetaling
        </Button>
      </div>
    </div>
  );
};

export default UtbetalingTabView;
