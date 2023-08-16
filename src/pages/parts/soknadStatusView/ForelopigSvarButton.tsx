import { Button } from "@navikt/ds-react";
import { ForelopigSvar, HendelseType } from "../../../types/hendelseTypes";
import { getNow } from "../../../utils/utilityFunctions";
import { defaultDokumentlagerRef } from "../../../redux/reducer";
import {
  oppdaterForelopigSvar,
  sendNyHendelseOgOppdaterModel,
} from "../../../redux/actions";
import React from "react";
import { AppState, DispatchProps } from "../../../redux/reduxTypes";
import { connect } from "react-redux";
import { FsSoknad, Model } from "../../../redux/types";

interface OwnProps {
  soknad: FsSoknad;
}

interface StoreProps {
  model: Model;
}

type Props = DispatchProps & OwnProps & StoreProps;

const ForelopigSvarButton = (props: Props) => {
  const { dispatch, soknad, model } = props;

  return (
    <Button
      size="small"
      onClick={() => {
        const nyHendelse: ForelopigSvar = {
          type: HendelseType.ForelopigSvar,
          hendelsestidspunkt: getNow(),
          forvaltningsbrev: {
            referanse: {
              type: defaultDokumentlagerRef.type,
              id: defaultDokumentlagerRef.id,
            },
          },
          vedlegg: [],
        };

        sendNyHendelseOgOppdaterModel(
          nyHendelse,
          model,
          dispatch,
          oppdaterForelopigSvar(soknad.fiksDigisosId, nyHendelse)
        );
      }}
    >
      {"Send foreløpig svar"}
    </Button>
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
  mapDispatchToProps
)(ForelopigSvarButton);
