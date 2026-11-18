import { RootState } from "../../../store";
import { useDispatch, shallowEqual, useSelector } from "react-redux";


import {
  Button,
  ErrorMessage,
  BodyShort,
  Label,
  Modal,
  Select,
} from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";

import {
  SET_FNR,
  SKJUL_SYSTEM_SETTINGS_MODAL,
} from "../../../redux/reducer";

const targetLabel = (target: string | undefined) => {
  switch (target) {
    case "mock-alt":
      return "mock-alt-api";
    case "fiks":
      return "Fiks Digisos (via sosialhjelp-fagsystem-backend)";
    default:
      return "Ukjent";
  }
};

const SystemSettingsModal = () => {
  const { visSystemSettingsModal, model } = useSelector(
    (state: RootState) => ({
      visSystemSettingsModal: state.model.visSystemSettingsModal,
      model: state.model,
    }),
    shallowEqual,
  );
  const dispatch = useDispatch();

  return (
    <Modal
      open={visSystemSettingsModal}
      onClose={() => dispatch(SKJUL_SYSTEM_SETTINGS_MODAL())}
      className={globals.modal}
      aria-label={"Systeminnstillinger"}
    >
      <Modal.Body>
        <Label as="p">Mål for oppdateringer</Label>
        <BodyShort spacing>{targetLabel(model.proxyInfo?.target)}</BodyShort>
        <Select
          label="Søker for nye søknader"
          value={model.fnr}
          onChange={(event) => {
            const fnr = event.target.value;
            window.localStorage.setItem("fnr", fnr);
            dispatch(SET_FNR(fnr));
          }}
        >
          {!model.brukere.some((bruker) => bruker.fnr === model.fnr) && (
            <option value={model.fnr}>{model.fnr}</option>
          )}
          {model.brukere.map((bruker) => (
            <option key={bruker.fnr} value={bruker.fnr}>
              {[
                bruker.navn.fornavn,
                bruker.navn.mellomnavn,
                bruker.navn.etternavn,
              ]
                .filter(Boolean)
                .join(" ")}{" "}
              ({bruker.fnr})
            </option>
          ))}
        </Select>
        {model.brukereFeil && (
          <ErrorMessage>Kunne ikke hente listen over søkere.</ErrorMessage>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          size="small"
          onClick={() => dispatch(SKJUL_SYSTEM_SETTINGS_MODAL())}
        >
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SystemSettingsModal;
