import React from "react";
import { RootState } from "../../../store";
import { shallowEqual, useSelector } from "react-redux";

import { getFsSoknadByFiksDigisosId } from "../../../utils/utilityFunctions";

import SoknadStatusView from "../soknadStatusView/SoknadStatusView";

import TildeldeltNavkontorView from "../navKontor/TildeltNavKontorView";
import {
  BodyShort,
  CopyButton,
  Heading,
  HStack,
  Link,
  Panel,
} from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";
import styles from "./toppPanel.module.css";

const ToppPanel = () => {
  const { soknad, fiksSak, innsynUrl } = useSelector(
    (state: RootState) => ({
      soknad: getFsSoknadByFiksDigisosId(
        state.model.soknader,
        state.model.aktivSoknad,
      ),
      fiksSak: state.model.fiksSaker.find(
        (sak) => sak.fiksDigisosId === state.model.aktivSoknad,
      ),
      innsynUrl: state.model.proxyInfo?.innsynUrl,
    }),
    shallowEqual,
  );
  if (soknad) {
    const frontendUrl = innsynUrl
      ? `${innsynUrl}/${soknad.fiksDigisosId}/status`
      : undefined;
    return (
      <div className={styles.toppPanel}>
        <Panel className={`${globals.panel} ${styles.toppPanel}`}>
          <Heading level="2" size="medium" spacing>
            Oversikt over søknaden
          </Heading>
          {fiksSak && (
            <HStack gap="space-8" align="center">
              <BodyShort>Fødselsnummer: {fiksSak.fnr ?? "ukjent"}</BodyShort>
              {fiksSak.fnr && (
                <CopyButton
                  copyText={fiksSak.fnr}
                  size="xsmall"
                  title="Kopier fødselsnummer"
                />
              )}
            </HStack>
          )}
          <BodyShort>FiksDigisosId: {soknad.fiksDigisosId}</BodyShort>
          {frontendUrl && (
            <Link href={frontendUrl} target="_blank" rel="noopener noreferrer">
              {frontendUrl}
            </Link>
          )}
          <TildeldeltNavkontorView soknad={soknad} />
        </Panel>
        <SoknadStatusView soknad={soknad} />
      </div>
    );
  }

  return <div />;
};

export default ToppPanel;
