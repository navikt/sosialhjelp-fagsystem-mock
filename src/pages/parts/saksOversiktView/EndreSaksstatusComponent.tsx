import React from "react";
import { AppState, DispatchProps } from "../../../redux/reduxTypes";
import { connect } from "react-redux";

import {
  sendNyHendelseOgOppdaterModel,
  oppdaterFsSaksStatus,
} from "../../../redux/actions";
import {
  HendelseType,
  SaksStatus,
  SaksStatusType,
} from "../../../types/hendelseTypes";
import { getNow } from "../../../utils/utilityFunctions";
import { FsSaksStatus, FsSoknad, Model } from "../../../redux/types";

import { Select } from "@navikt/ds-react";
import globals from "../../../globals.module.css";
interface OwnProps {
  soknad: FsSoknad;
  sak: FsSaksStatus;
}

interface StoreProps {
  model: Model;
}

type Props = DispatchProps & OwnProps & StoreProps;

const EndreSaksstatusComponent: React.FC<Props> = (props: Props) => {
  const { dispatch, soknad, model, sak } = props;

  return (
    <Select
      className={globals.fitContent}
      size="small"
      label="Endre saksstatus"
      value={sak.status ? sak.status : ""}
      onChange={(evt) => {
        let value = evt.target.value;
        if (
          value === SaksStatusType.UNDER_BEHANDLING ||
          value === SaksStatusType.BEHANDLES_IKKE ||
          value === SaksStatusType.FEILREGISTRERT ||
          value === SaksStatusType.IKKE_INNSYN
        ) {
          const nyHendelse: SaksStatus = {
            type: HendelseType.SaksStatus,
            hendelsestidspunkt: getNow(),
            referanse: sak.referanse,
            tittel: sak.tittel,
            status: value,
          };

          sendNyHendelseOgOppdaterModel(
            nyHendelse,
            model,
            dispatch,
            oppdaterFsSaksStatus(soknad.fiksDigisosId, nyHendelse),
          );
        }
      }}
    >
      <option hidden disabled value=""></option>
      <option
        key={"saksstatusSelect: 0"}
        value={SaksStatusType.UNDER_BEHANDLING}
      >
        Under behandling
      </option>
      <option key={"saksstatusSelect: 1"} value={SaksStatusType.IKKE_INNSYN}>
        Ikke innsyn
      </option>
      <option key={"saksstatusSelect: 2"} value={SaksStatusType.FEILREGISTRERT}>
        Feilregistrert
      </option>
      <option key={"saksstatusSelect: 3"} value={SaksStatusType.BEHANDLES_IKKE}>
        Behandles ikke
      </option>
    </Select>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EndreSaksstatusComponent);
