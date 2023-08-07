import React, { useState } from "react";
import { DispatchProps } from "../../../redux/reduxTypes";
import { connect } from "react-redux";
import {
  setAktivUtbetaling,
  visNyUtbetalingModal,
} from "../../../redux/actions";
import UtbetalingTabView from "./UtbetalingTabView";
import { Utbetaling } from "../../../types/hendelseTypes";
import { Button, Tabs } from "@navikt/ds-react";
import globals from "../../../globals.module.css";

interface OwnProps {
  utbetalingListe: Utbetaling[];
  saksreferanse: string | null;
}

type Props = DispatchProps & OwnProps;

const UtbetalingOversiktView: React.FC<Props> = (props: Props) => {
  const { utbetalingListe, dispatch, saksreferanse } = props;
  const [aktivUtbetalingIdx, setAktivUtbetalingIdx] = useState(0);
  const [antallUtbetalinger, setAntallUtbetalinger] = useState(0);

  if (antallUtbetalinger !== utbetalingListe.length) {
    if (antallUtbetalinger < utbetalingListe.length) {
      setAktivUtbetalingIdx(utbetalingListe.length - 1);
    }
    setAntallUtbetalinger(utbetalingListe.length);
  }

  return (
    <>
      <Button
        size="small"
        className={`${globals.fitContent}`}
        onClick={() => {
          dispatch(setAktivUtbetaling(null));
          dispatch(visNyUtbetalingModal(saksreferanse));
        }}
      >
        Ny utbetaling
      </Button>

      {utbetalingListe.length > 0 && (
        <Tabs
          className={globals.mt}
          value={(aktivUtbetalingIdx < utbetalingListe.length
            ? aktivUtbetalingIdx
            : utbetalingListe.length - 1
          ).toString()}
          onChange={(newValue) => setAktivUtbetalingIdx(+newValue)}
        >
          <Tabs.List className={globals.tabsList}>
            {utbetalingListe.map((utbetaling: Utbetaling, idx) => {
              return (
                <Tabs.Tab
                  key={"tab: " + utbetaling.utbetalingsreferanse}
                  label={"Utbetaling " + (idx + 1)}
                  value={idx.toString()}
                />
              );
            })}
          </Tabs.List>

          {utbetalingListe.map((utbetaling: Utbetaling, idx) => {
            return (
              <Tabs.Panel
                key={"tabPanel: " + utbetaling.utbetalingsreferanse}
                value={idx.toString()}
                className={globals.tabsPanel}
              >
                <UtbetalingTabView utbetaling={utbetaling} />
              </Tabs.Panel>
            );
          })}
        </Tabs>
      )}
    </>
  );
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    dispatch,
  };
};

export default connect(mapDispatchToProps)(UtbetalingOversiktView);
