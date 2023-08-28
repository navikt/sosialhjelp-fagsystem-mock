import React, { useState } from "react";
import { DispatchProps } from "../../../redux/reduxTypes";
import { connect } from "react-redux";
import { visNySakModal } from "../../../redux/actions";
import SaksTabView from "./SaksTabView";
import { FsSaksStatus, FsSoknad } from "../../../redux/types";
import { Button, Heading, Panel, Tabs } from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";
import styles from "./saksoversikt.module.css";

interface OwnProps {
  soknad: FsSoknad;
}

type Props = DispatchProps & OwnProps;

const SaksOversiktView: React.FC<Props> = (props: Props) => {
  const { soknad, dispatch } = props;
  const [aktivSakRef, setAktivSakRef] = useState("");
  const [antallSaker, setAntallSaker] = useState(0);

  if (antallSaker !== soknad.saker.length) {
    setAktivSakRef(soknad.saker[soknad.saker.length - 1]?.referanse ?? "");
    setAntallSaker(soknad.saker.length);
  }

  function handleChange(newValue: string) {
    setAktivSakRef(newValue);
  }

  return (
    <Panel className={`${globals.panel} ${globals.fullWidth}  `}>
      <Heading level="3" size={"medium"}>
        Saksoversikt:
      </Heading>
      <div className={globals.fitContent}>
        <Button onClick={() => dispatch(visNySakModal())} size="small">
          Opprett ny sak
        </Button>
      </div>

      {soknad.saker.length > 0 && (
        <>
          <Tabs value={aktivSakRef} onChange={handleChange}>
            <Tabs.List className={globals.tabsList}>
              {soknad.saker.map((sak: FsSaksStatus) => {
                return (
                  <Tabs.Tab
                    value={sak.referanse}
                    key={"tab:" + sak.referanse}
                    label={
                      <div
                        className={
                          sak.referanse === aktivSakRef
                            ? styles.selectedTabLabel
                            : ""
                        }
                      >
                        {sak.tittel ? sak.tittel : "Sak uten tittel"}
                      </div>
                    }
                    className={`${styles.tab} ${
                      sak.tittel ? "" : globals.italicLabel
                    }`}
                  />
                );
              })}
            </Tabs.List>
            {soknad.saker.map((sak: FsSaksStatus, idx) => {
              return (
                <Tabs.Panel
                  key={"tabPanel:" + sak.referanse}
                  value={sak.referanse}
                >
                  <SaksTabView sak={sak} soknad={soknad} />
                </Tabs.Panel>
              );
            })}
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

export default connect(mapDispatchToProps)(SaksOversiktView);
