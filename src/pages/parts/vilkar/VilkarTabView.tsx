import React from "react";
import { DispatchProps } from "../../../redux/reduxTypes";
import { connect } from "react-redux";
import { Vilkar, VilkarStatus } from "../../../types/hendelseTypes";
import { setAktivtVilkar, visNyVilkarModal } from "../../../redux/actions";
import { Button, Table } from "@navikt/ds-react";
import globals from "../../../globals.module.css";

interface OwnProps {
  vilkar: Vilkar;
}

interface StoreProps {}

type Props = DispatchProps & OwnProps & StoreProps;

const VilkarTabView: React.FC<Props> = (props: Props) => {
  const { vilkar, dispatch } = props;

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

  const makeTableRowOfStatus = (type: string, value: VilkarStatus | null) => {
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
        {vilkar.utbetalingsreferanse != null &&
          vilkar.utbetalingsreferanse.length > 1 && (
            <Table.Body>
              {makeTableRow("Vilkårreferanse *", vilkar.vilkarreferanse)}

              {vilkar.utbetalingsreferanse.map((value, idx) => {
                if (idx === 0) {
                  return (
                    <Table.Row key={"Utbetalingsreferanse"}>
                      <Table.HeaderCell
                        rowSpan={
                          vilkar.utbetalingsreferanse
                            ? vilkar.utbetalingsreferanse.length
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
              {makeTableRow("Beskrivelse", vilkar.beskrivelse)}
              {makeTableRowOfStatus("Status", vilkar.status)}
            </Table.Body>
          )}
        {(vilkar.utbetalingsreferanse == null ||
          vilkar.utbetalingsreferanse.length <= 1) && (
          <Table.Body>
            {makeTableRow("Vilkårreferanse", vilkar.vilkarreferanse)}
            {makeTableRow("Tittel", vilkar.tittel)}
            {makeTableRow("Beskrivelse", vilkar.beskrivelse)}
            {makeTableRowOfStatus("Status", vilkar.status)}
            {makeTableRow(
              "Saksreferanse",
              vilkar.saksreferanse == null || vilkar.saksreferanse.length === 0
                ? null
                : vilkar.saksreferanse
            )}
            {makeTableRow(
              "Utbetalingsreferanse",
              vilkar.utbetalingsreferanse == null ||
                vilkar.utbetalingsreferanse.length === 0
                ? null
                : vilkar.utbetalingsreferanse
            )}
          </Table.Body>
        )}
      </Table>
      <div className={globals.endreKnapp}>
        <Button
          size="small"
          variant="secondary-neutral"
          onClick={() => {
            dispatch(setAktivtVilkar(vilkar.vilkarreferanse));
            dispatch(visNyVilkarModal());
          }}
        >
          Endre vilkår
        </Button>
      </div>
    </>
  );
};

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch: any) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(VilkarTabView);
