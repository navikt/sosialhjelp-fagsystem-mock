import React from "react";
import { AppState } from "../../../redux/reduxTypes";
import { useDispatch, useSelector } from "react-redux";
import { switchToDarkMode, switchToLightMode } from "../../../redux/actions";
import { InternalHeader } from "@navikt/ds-react";
import { MoonIcon, SunIcon, WrenchIcon } from "@navikt/aksel-icons";
import { VIS_SYSTEM_SETTINGS_MODAL } from "../../../redux/reducer";

const AppBarView = () => {
  const thememode = useSelector((state: AppState) => state.model.thememode);

  const dispatch = useDispatch();

  return (
    <InternalHeader>
      <InternalHeader.Title as="h1" style={{ fontSize: "1.5rem" }}>
        Fagsystem-mock
      </InternalHeader.Title>
      <InternalHeader.Button
        style={{ marginLeft: "auto", fontSize: "1.5rem" }}
        onClick={() => dispatch(VIS_SYSTEM_SETTINGS_MODAL)}
      >
        <WrenchIcon title="innstillinger" />
      </InternalHeader.Button>
      <InternalHeader.Button
        style={{ fontSize: "1.5rem" }}
        onClick={() => {
          thememode === "light"
            ? dispatch(switchToDarkMode())
            : dispatch(switchToLightMode());
        }}
      >
        {thememode === "light" ? (
          <SunIcon title="a11y-title" />
        ) : (
          <MoonIcon title="a11y-title" />
        )}
      </InternalHeader.Button>
    </InternalHeader>
  );
};

export default AppBarView;
