import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { FsSoknad } from "../../../redux/types";
import VilkarTabView from "./VilkarTabView";
import { Vilkar } from "../../../types/hendelseTypes";
import { Button, Heading, Panel, Tabs } from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";
import { VIS_NY_VILKAR_MODAL } from "../../../redux/reducer";

interface Props {
  soknad: FsSoknad;
}

const VilkarOversiktView: React.FC<Props> = ({ soknad }: Props) => {
  const dispatch = useDispatch();
  const [aktivtVilkarIdx, setAktivtVilkarIdx] = useState(0);
  const [antallVilkar, setAntallVilkar] = useState(0);

  if (antallVilkar !== soknad.vilkar.length) {
    setAktivtVilkarIdx(soknad.vilkar.length - 1);
    setAntallVilkar(soknad.vilkar.length);
  }

  return (
    <Panel className={globals.panel}>
      <Heading level={"3"} size="medium">
        Vilkår
      </Heading>
      <Button
        size="small"
        className={globals.fitContent}
        onClick={() => {
          dispatch(VIS_NY_VILKAR_MODAL());
        }}
      >
        Nytt vilkår
      </Button>

      {soknad.vilkar.length > 0 && (
        <>
          <Tabs
            value={aktivtVilkarIdx.toString()}
            onChange={(newValue: string) => setAktivtVilkarIdx(+newValue)}
          >
            <Tabs.List className={globals.tabsList}>
              {soknad.vilkar.map((vilkar: Vilkar, idx) => {
                return (
                  <Tabs.Tab
                    key={"tab: " + vilkar.vilkarreferanse}
                    label={"Vilkår " + (idx + 1)}
                    value={idx.toString()}
                  />
                );
              })}
            </Tabs.List>
            {soknad.vilkar.map((vilkar: Vilkar, idx) => {
              return (
                <Tabs.Panel
                  key={"tabPanel: " + vilkar.vilkarreferanse}
                  value={idx.toString()}
                  className={globals.tabsPanel}
                >
                  <VilkarTabView vilkar={vilkar} />
                </Tabs.Panel>
              );
            })}
          </Tabs>
        </>
      )}
    </Panel>
  );
};

export default VilkarOversiktView;
