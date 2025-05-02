import React, { useState } from "react";
import { useDispatch } from "react-redux";
import UtbetalingTabView from "./UtbetalingTabView";
import { Utbetaling } from "../../../types/hendelseTypes";
import { Button, Tabs } from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";
import { SET_AKTIV_UTBETALING, VIS_NY_UTBETALING_MODAL } from "../../../redux/reducer";

interface Props {
  utbetalingListe: Utbetaling[];
  saksreferanse: string | null;
}

const UtbetalingOversiktView: React.FC<Props> = ({ utbetalingListe, saksreferanse }: Props) => {
  const dispatch = useDispatch();
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
          dispatch(SET_AKTIV_UTBETALING(null));
          dispatch(VIS_NY_UTBETALING_MODAL(saksreferanse));
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


export default UtbetalingOversiktView;
