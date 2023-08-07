import React from "react";
import { AppState, DispatchProps } from "../../../redux/reduxTypes";
import { connect } from "react-redux";
import SaksOversiktView from "../saksOversiktView/SaksOversiktView";
import { getFsSoknadByFiksDigisosId } from "../../../utils/utilityFunctions";
import { FsSoknad } from "../../../redux/types";
import VilkarOversiktView from "../vilkar/VilkarOversiktView";
import DokumentasjonkravOversiktView from "../dokumentasjonskrav/DokumentasjonkravOversiktView";
import DokumentasjonEtterspurtOversiktView from "../dokumentasjonEtterspurt/DokumentasjonEtterspurtOversiktView";
import UtbetalingOversiktView from "../utbetaling/UtbetalingOversiktView";
import NyUtbetalingModal from "../utbetaling/NyUtbetalingModal";
import NySakModal from "../nySak/NySak";
import NyttDokumentasjonkravModal from "../dokumentasjonskrav/NyttDokumentasjonkravModal";
import NyttVilkarModal from "../vilkar/NyttVilkarModal";
import NyDokumentasjonEtterspurt from "../dokumentasjonEtterspurt/NyDokumentasjonEtterspurtModal";
import { Heading, Ingress, Panel } from "@navikt/ds-react";
import globals from "../../../globals.module.css";

interface StoreProps {
  soknad: FsSoknad | undefined;
}

type Props = DispatchProps & StoreProps;

const BehandleSoknadPanel: React.FC<Props> = (props: Props) => {
  const { soknad } = props;

  if (soknad) {
    return (
      <div>
        <SaksOversiktView soknad={soknad} />
        <DokumentasjonEtterspurtOversiktView soknad={soknad} />

        <Heading size="medium" level="2" spacing>
          Ting som ikke er knyttet til en sak:
        </Heading>
        <Ingress spacing>
          Obs: Hvis du setter en saksreferanse på en utbetaling blir den flyttet
          inn under den valgte saken i saksoversikten over.
        </Ingress>

        <VilkarOversiktView soknad={soknad} />
        <DokumentasjonkravOversiktView soknad={soknad} />

        <Panel className={globals.panel}>
          <Heading level="3" size="medium">
            Utbetalinger uten saksreferanse
          </Heading>
          <UtbetalingOversiktView
            utbetalingListe={soknad.utbetalingerUtenSaksreferanse}
            saksreferanse={null}
          />
        </Panel>
        <NySakModal />
        <NyDokumentasjonEtterspurt soknad={soknad} />
        <NyttVilkarModal soknad={soknad} />
        <NyttDokumentasjonkravModal soknad={soknad} />
        <NyUtbetalingModal soknad={soknad} />
      </div>
    );
  }

  return (
    <Panel className={globals.panel}>
      Velg en søknad fra innboksen for å behandle den.
    </Panel>
  );
};

const mapStateToProps = (state: AppState) => {
  const { aktivSoknad } = state.model;
  const { soknader } = state.model;
  return {
    soknad: getFsSoknadByFiksDigisosId(soknader, aktivSoknad),
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    dispatch,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BehandleSoknadPanel);
