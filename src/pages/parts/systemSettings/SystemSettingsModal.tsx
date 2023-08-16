import React, { useEffect } from "react";
import { AppState, DispatchProps } from "../../../redux/reduxTypes";
import { connect } from "react-redux";

import {
  opprettDigisosSakHvisDenIkkeFinnes,
  setBackendUrlTypeToUse,
  skjulSystemSettingsModal,
} from "../../../redux/actions";

import { BackendUrls, FsSoknad, Model } from "../../../redux/types";

import { Modal, RadioGroup, Radio } from "@navikt/ds-react";
import globals from "../../../globals.module.css";

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
      case "lokalt":
        return "innsyn-api lokalt (port 8080)";
      case "mock":
        return "digisos ekstern (dev-gcp)";
      case "mockalt":
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

  useEffect(() => {
    Modal.setAppElement("#root");
  }, []);

  return (
    <Modal
      open={visSystemSettingsModal}
      onClose={() => dispatch(skjulSystemSettingsModal())}
      className={globals.modal}
    >
      <Modal.Content>
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
      </Modal.Content>
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
