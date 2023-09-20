import React, { useEffect } from "react";
import { AppState, DispatchProps } from "../../../redux/reduxTypes";
import { connect } from "react-redux";

import {
  opprettDigisosSakHvisDenIkkeFinnes,
  setBackendUrlTypeToUse,
  skjulSystemSettingsModal,
} from "../../../redux/actions";

import { BackendUrls, FsSoknad, Model } from "../../../redux/types";

import { Modal, RadioGroup, Radio, Button } from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";

import { backendUrls } from "../../../redux/reducer";

interface OwnProps {
  soknad: FsSoknad | undefined;
}

interface StoreProps {
  visSystemSettingsModal: boolean;
  model: Model;
}

type Props = DispatchProps & OwnProps & StoreProps;

const SystemSettingsModal: React.FC<Props> = (props: Props) => {
  const { visSystemSettingsModal, dispatch, soknad, model } = props;

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
    // @ts-ignore
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
      onClose={() => dispatch(skjulSystemSettingsModal())}
      className={globals.modal}
    >
      <Modal.Body>
        <RadioGroup
          legend="Miljø"
          name="miljo"
          value={model.backendUrlTypeToUse}
          onChange={(value) => {
            dispatch(setBackendUrlTypeToUse(value as keyof BackendUrls));
            if (soknad) {
              opprettDigisosSakHvisDenIkkeFinnes(
                soknad,
                value as keyof BackendUrls,
                dispatch,
                soknad.fiksDigisosId,
              );
            }
            dispatch(skjulSystemSettingsModal());
          }}
        >
          {radios}
        </RadioGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button
          size="small"
          onClick={() => dispatch(skjulSystemSettingsModal())}
        >
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const mapStateToProps = (state: AppState) => ({
  visSystemSettingsModal: state.model.visSystemSettingsModal,
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
)(SystemSettingsModal);
