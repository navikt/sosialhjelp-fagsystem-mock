import React from "react";
import { AppState, DispatchProps } from "../../../redux/reduxTypes";
import { connect } from "react-redux";
import { Model } from "../../../redux/types";
import {
  switchToDarkMode,
  switchToLightMode,
  visSystemSettingsModal,
} from "../../../redux/actions";
import { InternalHeader } from "@navikt/ds-react";
import { MoonIcon, SunIcon, WrenchIcon } from "@navikt/aksel-icons";
interface OwnProps {}

interface StoreProps {
  model: Model;
}

type Props = OwnProps & StoreProps & DispatchProps;

const AppBarView: React.FC<Props> = (props: Props) => {
  const { dispatch } = props;

  return (
    <InternalHeader>
      <InternalHeader.Title as="h1" style={{ fontSize: "1.5rem" }}>
        Fagsystem-mock
      </InternalHeader.Title>
      <InternalHeader.Button
        style={{ marginLeft: "auto", fontSize: "1.5rem" }}
        onClick={() => dispatch(visSystemSettingsModal())}
      >
        <WrenchIcon title="innstillinger" />
      </InternalHeader.Button>
      <InternalHeader.Button
        style={{ fontSize: "1.5rem" }}
        onClick={() => {
          props.model.thememode === "light"
            ? props.dispatch(switchToDarkMode())
            : props.dispatch(switchToLightMode());
        }}
      >
        {props.model.thememode === "light" ? (
          <SunIcon title="a11y-title" />
        ) : (
          <MoonIcon title="a11y-title" />
        )}
      </InternalHeader.Button>
    </InternalHeader>
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

export default connect(mapStateToProps, mapDispatchToProps)(AppBarView);
