import React, { useEffect } from "react";
import { AppState, DispatchProps } from "../redux/reduxTypes";
import { connect } from "react-redux";
import SoknadsOversiktPanel from "./parts/soknadsOversiktPanel/SoknadsOversiktPanel";
import BehandleSoknadPanel from "./parts/behandleSoknadPanel/BehandleSoknadPanel";
import AppBarView from "./parts/appBarView/AppBarView";
import SystemSettingsModal from "./parts/systemSettings/SystemSettingsModal";
import StatusSnackBarView from "./parts/statusSnackBar/StatusSnackBarView";
import {
  getFsSoknadByFiksDigisosId,
  removeNullFieldsFromHendelser,
} from "../utils/utilityFunctions";
import ToppPanel from "./parts/panel/ToppPanel";
import { hentFsSoknadFraFiksEllerOpprettNy } from "../redux/actions";
import { Model } from "../redux/types";
import SplashScreen from "../components/splashScreen";
import { Button, Loader } from "@navikt/ds-react";
import { FileJsonIcon } from "@navikt/aksel-icons";
import globals from "../app/globals.module.css";
import styles from "./forside.module.css";

interface StoreProps {
  model: Model;
}

type Props = DispatchProps & StoreProps;

const Forside: React.FC<Props> = (props: Props) => {
  useEffect(() => {
    hentFsSoknadFraFiksEllerOpprettNy(
      props.model.aktivSoknad,
      props.model.backendUrlTypeToUse,
      props.dispatch,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loaderOn = props.model.loaderOn;

  const onVisJSON = () => {
    const fiksDigisosSokerJson = getFsSoknadByFiksDigisosId(
      props.model.soknader,
      props.model.aktivSoknad,
    )!.fiksDigisosSokerJson;
    const fiksDigisosSokerJsonUtenNull =
      removeNullFieldsFromHendelser(fiksDigisosSokerJson);
    const jsonString = JSON.stringify(fiksDigisosSokerJsonUtenNull, null, 2);
    const x = window.open("data:text/json, _blank");
    x!.document.open();
    x!.document.write(
      "<html><body><pre>" + jsonString + "</pre></body></html>",
    );
    x!.document.close();
  };

  return (
    <SplashScreen>
      <AppBarView />
      <main className={globals.main}>
        <div className={globals.flex}>
          <SoknadsOversiktPanel />
          <ToppPanel />
        </div>
        <BehandleSoknadPanel />

        <SystemSettingsModal
          soknad={getFsSoknadByFiksDigisosId(
            props.model.soknader,
            props.model.aktivSoknad,
          )}
        />

        <StatusSnackBarView />

        <div hidden={!loaderOn} className={styles.progressBar}>
          <Loader size="3xlarge" />
        </div>

        <div className={styles.json_knapp}>
          <Button
            aria-label="Vis søknad-data som JSON"
            onClick={onVisJSON}
            icon={
              <FileJsonIcon
                title="Vis søknad-data som JSON"
                style={{ fontSize: "2rem" }}
              />
            }
          ></Button>
        </div>
      </main>
    </SplashScreen>
  );
};

const mapStateToProps = (state: AppState) => ({
  model: state.model,
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Forside);
