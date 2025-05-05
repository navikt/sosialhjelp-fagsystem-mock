import React from "react";
import { RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import { InternalHeader } from "@navikt/ds-react";
import { MoonIcon, SunIcon, WrenchIcon } from "@navikt/aksel-icons";
import {
  SWITCH_TO_DARK_MODE,
  SWITCH_TO_LIGHT_MODE,
  VIS_SYSTEM_SETTINGS_MODAL,
} from "../../../redux/reducer";

const AppBarView = () => {
  const thememode = useSelector((state: RootState) => state.model.thememode);

  const dispatch = useDispatch();

  return (
    <InternalHeader>
      <InternalHeader.Title as="h1" style={{ fontSize: "1.5rem" }}>
        Fagsystem-mock
      </InternalHeader.Title>
      <InternalHeader.Button
        style={{ marginLeft: "auto", fontSize: "1.5rem" }}
        onClick={() => dispatch(VIS_SYSTEM_SETTINGS_MODAL())}
      >
        <WrenchIcon title="innstillinger" />
      </InternalHeader.Button>
      <InternalHeader.Button
        style={{ fontSize: "1.5rem" }}
        onClick={() => {
          if (thememode === "light") {
            dispatch(SWITCH_TO_DARK_MODE());
          } else {
            dispatch(SWITCH_TO_LIGHT_MODE());
          }
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
