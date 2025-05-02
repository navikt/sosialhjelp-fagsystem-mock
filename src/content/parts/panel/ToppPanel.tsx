import React from "react";
import { AppState } from "../../../redux/reduxTypes";
import { useSelector } from "react-redux";

import { getFsSoknadByFiksDigisosId } from "../../../utils/utilityFunctions";

import SoknadStatusView from "../soknadStatusView/SoknadStatusView";

import TildeldeltNavkontorView from "../navKontor/TildeltNavKontorView";
import { backendUrls } from "../../../redux/reducer";
import { BodyShort, Heading, Link, Panel } from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";
import styles from "./toppPanel.module.css";

const ToppPanel = () => {
  const { soknad, backendUrlTypeToUse } = useSelector((state: AppState) => ({
    soknad: getFsSoknadByFiksDigisosId(
      state.model.soknader,
      state.model.aktivSoknad,
    ),
    backendUrlTypeToUse: state.model.backendUrlTypeToUse,
  }));
  const backendUrl = backendUrls[backendUrlTypeToUse];
  if (soknad) {
    let frontendUrl =
      backendUrl.substring(0, backendUrl.search("/sosialhjelp/")) +
      "/sosialhjelp/innsyn/" +
      soknad.fiksDigisosId +
      "/status";
    if (frontendUrl.includes("localhost:8080")) {
      frontendUrl = frontendUrl.replace("localhost:8080", "localhost:3000");
    }
    if (frontendUrl.includes("localhost:8989")) {
      frontendUrl = frontendUrl.replace("localhost:8989", "localhost:3000");
    }
    return (
      <div className={styles.toppPanel}>
        <Panel className={`${globals.panel} ${styles.toppPanel}`}>
          <Heading level="2" size="medium" spacing>
            Oversikt over søknaden
          </Heading>
          <BodyShort>FiksDigisosId: {soknad.fiksDigisosId}</BodyShort>
          <Link href={frontendUrl} target="_blank" rel="noopener noreferrer">
            {frontendUrl}
          </Link>
          <TildeldeltNavkontorView soknad={soknad} />
        </Panel>
        <SoknadStatusView soknad={soknad} />
      </div>
    );
  }

  return <div />;
};

export default ToppPanel;
