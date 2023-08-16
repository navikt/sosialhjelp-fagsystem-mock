import React from "react";
import { AppState, DispatchProps } from "../../../redux/reduxTypes";
import { connect } from "react-redux";

import { getFsSoknadByFiksDigisosId } from "../../../utils/utilityFunctions";

import SoknadStatusView from "../soknadStatusView/SoknadStatusView";
import { FsSoknad } from "../../../redux/types";

import TildeldeltNavkontorView from "../navKontor/TildeltNavKontorView";
import { BackendUrls } from "../../../redux/types";
import { backendUrls } from "../../../redux/reducer";
import { BodyShort, Heading, Link, Panel } from "@navikt/ds-react";
import globals from "../../../globals.module.css";
import styles from "./toppPanel.module.css";

interface StoreProps {
  soknad: FsSoknad | undefined;
  backendUrlTypeToUse: keyof BackendUrls;
}

type Props = DispatchProps & StoreProps;

const ToppPanel: React.FC<Props> = (props: Props) => {
  const { soknad, backendUrlTypeToUse } = props;
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

const mapStateToProps = (state: AppState) => {
  const { aktivSoknad } = state.model;
  const { soknader } = state.model;
  return {
    soknad: getFsSoknadByFiksDigisosId(soknader, aktivSoknad),
    backendUrlTypeToUse: state.model.backendUrlTypeToUse,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ToppPanel);
