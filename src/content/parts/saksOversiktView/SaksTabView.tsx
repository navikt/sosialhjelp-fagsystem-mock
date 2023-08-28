import React, { useState } from "react";
import { AppState, DispatchProps } from "../../../redux/reduxTypes";
import { connect } from "react-redux";

import { HendelseType, SaksStatus } from "../../../types/hendelseTypes";

import { FsSaksStatus, FsSoknad, Model } from "../../../redux/types";

import {
  sendNyHendelseOgOppdaterModel,
  oppdaterFsSaksStatus,
} from "../../../redux/actions";
import { getNow } from "../../../utils/utilityFunctions";

import EndreSaksstatusComponent from "./EndreSaksstatusComponent";
import VedtakFattetView from "./VedtakFattetView";
import UtbetalingOversiktView from "../utbetaling/UtbetalingOversiktView";
import { Button, Label, TextField } from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";
import styles from "./saksoversikt.module.css";
interface OwnProps {
  sak: FsSaksStatus;
  soknad: FsSoknad;
}

interface StoreProps {
  model: Model;
}

type Props = DispatchProps & OwnProps & StoreProps;

const SaksTabView: React.FC<Props> = (props: Props) => {
  const [tittel, setTittel] = useState("");
  const { sak, dispatch, model, soknad } = props;

  return (
    <div className={styles.saker}>
      <div className={globals.flexRow}>
        <TextField
          size="small"
          label={"Ny tittel på sak"}
          value={tittel}
          onChange={(evt) => setTittel(evt.target.value)}
          autoComplete="off"
        />
        <Button
          size="small"
          onClick={() => {
            if (tittel.length > 0) {
              const nyHendelse: SaksStatus = {
                type: HendelseType.SaksStatus,
                hendelsestidspunkt: getNow(),
                referanse: sak.referanse,
                tittel: tittel,
                status: sak.status,
              };

              sendNyHendelseOgOppdaterModel(
                nyHendelse,
                model,
                dispatch,
                oppdaterFsSaksStatus(soknad.fiksDigisosId, nyHendelse),
              );
            }
          }}
          variant="secondary-neutral"
        >
          Oppdater tittel
        </Button>
      </div>

      <EndreSaksstatusComponent soknad={soknad} sak={sak} />
      <div>
        <Label as={"p"} spacing>
          Utbetalinger
        </Label>

        <UtbetalingOversiktView
          utbetalingListe={sak.utbetalinger}
          saksreferanse={sak.referanse}
        />
      </div>
      <VedtakFattetView soknad={soknad} sak={sak} />
    </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(SaksTabView);
