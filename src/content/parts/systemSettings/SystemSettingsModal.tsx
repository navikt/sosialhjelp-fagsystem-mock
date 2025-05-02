import { RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";

import { opprettDigisosSakHvisDenIkkeFinnes } from "../../../redux/actions";

import { BackendUrls, FsSoknad } from "../../../redux/types";

import { Modal, RadioGroup, Radio, Button } from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";

import {
  backendUrls,
  SET_BACKEND_URL_TYPE_TO_USE,
  SKJUL_SYSTEM_SETTINGS_MODAL,
} from "../../../redux/reducer";

interface Props {
  soknad: FsSoknad | undefined;
}

const SystemSettingsModal = ({ soknad }: Props) => {
  const { visSystemSettingsModal, model } = useSelector((state: RootState) => ({
    visSystemSettingsModal: state.model.visSystemSettingsModal,
    model: state.model,
  }));
  const dispatch = useDispatch();

  const toRadioLabel = (backendUrlType: string) => {
    switch (backendUrlType) {
      case "lokalInnsyn":
        return "innsyn-api lokalt (port 8080)";
      case "mock":
        return "digisos ekstern (dev-gcp)";
      case "lokalMockalt":
        return "lokal mock-alt-api (port 8989)";
      default:
        return backendUrlType;
    }
  };
  const radios = Object.keys(backendUrls).map((backendUrlType: string) => {
    return (
      <Radio
        id={"system_settings_backend_url_radio_" + backendUrlType}
        key={"urlLabel: " + backendUrlType}
        value={backendUrlType}
      >
        {toRadioLabel(backendUrlType)}
      </Radio>
    );
  });

  return (
    <Modal
      open={visSystemSettingsModal}
      onClose={() => dispatch(SKJUL_SYSTEM_SETTINGS_MODAL())}
      className={globals.modal}
      aria-label={"Systeminnstillinger"}
    >
      <Modal.Body>
        <RadioGroup
          legend="Miljø"
          name="miljo"
          value={model.backendUrlTypeToUse}
          onChange={async (value) => {
            dispatch(SET_BACKEND_URL_TYPE_TO_USE(value as keyof BackendUrls));
            if (soknad) {
              opprettDigisosSakHvisDenIkkeFinnes(
                soknad,
                value as keyof BackendUrls,
                dispatch,
                soknad.fiksDigisosId,
              );
            }
            dispatch(SKJUL_SYSTEM_SETTINGS_MODAL());
          }}
        >
          {radios}
        </RadioGroup>
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
