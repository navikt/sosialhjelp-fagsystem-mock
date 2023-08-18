import React, { useState } from "react";
import { DispatchProps } from "../../../redux/reduxTypes";
import { connect } from "react-redux";
import { visNyDokumentasjonkravModal } from "../../../redux/actions";
import { FsSoknad } from "../../../redux/types";
import DokumentasjonkravTabView from "./DokumentasjonkravTabView";
import { Dokumentasjonkrav } from "../../../types/hendelseTypes";
import { Button, Heading, Panel, Tabs } from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";

interface OwnProps {
  soknad: FsSoknad;
}

type Props = DispatchProps & OwnProps;

const DokumentasjonkravOversiktView: React.FC<Props> = (props: Props) => {
  const { soknad, dispatch } = props;
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
          dispatch(visNyDokumentasjonkravModal());
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

const mapDispatchToProps = (dispatch: any) => {
  return {
    dispatch,
  };
};

export default connect(mapDispatchToProps)(DokumentasjonkravOversiktView);
