import React, { useEffect, useState } from "react";
import { AppState, DispatchProps } from "../../../redux/reduxTypes";
import { connect } from "react-redux";
import { Button, Modal, TextField } from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";
import {
  nyFsSaksStatus,
  sendNyHendelseOgOppdaterModel,
  skjulNySakModal,
} from "../../../redux/actions";

import { FsSoknad, Model } from "../../../redux/types";
import {
  fsSaksStatusToSaksStatus,
  generateNyFsSaksStatus,
  getFsSoknadByFiksDigisosId,
} from "../../../utils/utilityFunctions";

interface OwnProps {}

interface StoreProps {
  visNySakModal: boolean;
  model: Model;
}

type Props = DispatchProps & OwnProps & StoreProps;

const NySakModal: React.FC<Props> = (props: Props) => {
  const [tittel, setTittel] = useState("");

  const { visNySakModal, dispatch, model } = props;

  const onOpprettSak = () => {
    const fsSoknader = model.soknader;
    if (fsSoknader) {
      const fsSoknad: FsSoknad | undefined = getFsSoknadByFiksDigisosId(
        fsSoknader,
        model.aktivSoknad,
      );
      if (fsSoknad) {
        const fsSaksStatus = generateNyFsSaksStatus(
          tittel.length !== 0 ? tittel : null,
        );
        const nyHendelse = fsSaksStatusToSaksStatus(fsSaksStatus);

        sendNyHendelseOgOppdaterModel(
          nyHendelse,
          model,
          dispatch,
          nyFsSaksStatus(model.aktivSoknad, fsSaksStatus),
        );

        setTittel("");
      }
    }
    dispatch(skjulNySakModal());
  };
  return (
    <Modal
      className={globals.modal}
      open={visNySakModal}
      onClose={() => props.dispatch(skjulNySakModal())}
      header={{ heading: "Ny sak" }}
    >
      <Modal.Body className={globals.flexRow}>
        <TextField
          label="Tittel"
          value={tittel}
          onChange={(evt) => setTittel(evt.target.value)}
          autoComplete="off"
          size="small"
        />
        <Button onClick={onOpprettSak} size="small">
          Opprett
        </Button>
      </Modal.Body>
    </Modal>
  );
};

const mapStateToProps = (state: AppState) => ({
  visNySakModal: state.model.visNySakModal,
  model: state.model,
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NySakModal);
