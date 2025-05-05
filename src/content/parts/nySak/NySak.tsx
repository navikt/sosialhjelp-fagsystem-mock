import React, { useState } from "react";
import { RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, TextField } from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";
import { sendNyHendelseOgOppdaterModel } from "../../../redux/actions";

import { FsSoknad } from "../../../redux/types";
import {
  fsSaksStatusToSaksStatus,
  generateNyFsSaksStatus,
  getFsSoknadByFiksDigisosId,
} from "../../../utils/utilityFunctions";
import { NY_FS_SAKS_STATUS, SKJUL_NY_SAK_MODAL } from "../../../redux/reducer";

const NySakModal = () => {
  const [tittel, setTittel] = useState("");

  const { visNySakModal, model } = useSelector((state: RootState) => ({
    visNySakModal: state.model.visNySakModal,
    model: state.model,
  }));
  const dispatch = useDispatch();

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
          NY_FS_SAKS_STATUS({
            forFiksDigisosId: model.aktivSoknad,
            nyFsSaksStatus: fsSaksStatus,
          }),
        );

        setTittel("");
      }
    }
    dispatch(SKJUL_NY_SAK_MODAL());
  };
  return (
    <Modal
      className={globals.modal}
      open={visNySakModal}
      onClose={() => dispatch(SKJUL_NY_SAK_MODAL())}
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

export default NySakModal;
