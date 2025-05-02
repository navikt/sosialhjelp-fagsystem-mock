import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { FsSoknad } from "../../../redux/types";
import DokumentasjonkravTabView from "./DokumentasjonkravTabView";
import { Dokumentasjonkrav } from "../../../types/hendelseTypes";
import { Button, Heading, Panel, Tabs } from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";
import { VIS_NY_DOKUMENTASJONKRAV_MODAL } from "../../../redux/reducer";

interface Props {
  soknad: FsSoknad;
}

const DokumentasjonkravOversiktView: React.FC<Props> = ({ soknad }: Props) => {
  const dispatch = useDispatch();
  const [aktivtDokumentasjonkravIdx, setAktivtDokumentasjonkravIdx] =
    useState(0);
  const [antallDokumentasjonkrav, setAntallDokumentasjonkrav] = useState(0);

  if (antallDokumentasjonkrav !== soknad.dokumentasjonkrav.length) {
    setAktivtDokumentasjonkravIdx(soknad.dokumentasjonkrav.length - 1);
    setAntallDokumentasjonkrav(soknad.dokumentasjonkrav.length);
  }

  return (
    <Panel className={globals.panel}>
      <Heading level="5" size="medium">
        Dokumentasjonkrav
      </Heading>

      <Button
        size="small"
        className={globals.fitContent}
        onClick={() => {
          dispatch(VIS_NY_DOKUMENTASJONKRAV_MODAL());
        }}
      >
        Nytt dokumentasjonkrav
      </Button>

      {soknad.dokumentasjonkrav.length > 0 && (
        <>
          <Tabs
            value={aktivtDokumentasjonkravIdx.toString()}
            onChange={(newValue: string) =>
              setAktivtDokumentasjonkravIdx(+newValue)
            }
          >
            <Tabs.List className={globals.tabsList}>
              {soknad.dokumentasjonkrav.map(
                (dokumentasjonkrav: Dokumentasjonkrav, idx) => {
                  return (
                    <Tabs.Tab
                      key={
                        "tab: " + dokumentasjonkrav.dokumentasjonkravreferanse
                      }
                      label={"Dokumentasjonkrav " + (idx + 1)}
                      value={idx.toString()}
                    />
                  );
                },
              )}
            </Tabs.List>
            {soknad.dokumentasjonkrav.map(
              (dokumentasjonkrav: Dokumentasjonkrav, idx) => {
                return (
                  <Tabs.Panel
                    key={
                      "tabPanel: " +
                      dokumentasjonkrav.dokumentasjonkravreferanse
                    }
                    value={idx.toString()}
                    className={globals.tabsPanel}
                  >
                    <DokumentasjonkravTabView
                      dokumentasjonkrav={dokumentasjonkrav}
                    />
                  </Tabs.Panel>
                );
              },
            )}
          </Tabs>
        </>
      )}
    </Panel>
  );
};

export default DokumentasjonkravOversiktView;
