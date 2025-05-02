import React, { useState } from "react";
import { AppState, Dispatch } from "../../../redux/reduxTypes";
import { useDispatch, useSelector } from "react-redux";
import { FsSoknad } from "../../../redux/types";
import { hentFsSoknadFraFiksEllerOpprettNy } from "../../../redux/actions";
import {
  FIKSDIGISOSID_URL_PARAM,
  SET_AKTIV_SOKNAD,
} from "../../../redux/reducer";
import { Button, Checkbox, Heading, Panel, TextField } from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";
import styles from "./soknadsOversikt.module.css";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SoknadsOversiktPanel = () => {
  const { model, soknader, aktivSoknad } = useSelector((state: AppState) => ({
    soknader: state.model.soknader,
    aktivSoknad: state.model.aktivSoknad,
    model: state.model,
  }));
  const dispatch = useDispatch();
  const [fiksDigisosId, setFiksDigisosId] = useState("");
  const [papirSoknad, setPapirSoknad] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const onSoknadClick = (dispatch: Dispatch, fiksDigisosId: string) => {
    const urlParams = new URLSearchParams(Array.from(searchParams.entries()));
    urlParams.set(FIKSDIGISOSID_URL_PARAM, fiksDigisosId.trim());

    const search = urlParams.toString();
    const query = search ? `?${search}` : "";

    router.push(`${pathname}${query}`);
    dispatch(SET_AKTIV_SOKNAD(fiksDigisosId.trim()));
  };

  const onHentSoknadClick = () => {
    if (
      fiksDigisosId.length !== 0 &&
      !model.soknader.find((soknad) => soknad.fiksDigisosId === fiksDigisosId)
    ) {
      hentFsSoknadFraFiksEllerOpprettNy(
        fiksDigisosId,
        model.backendUrlTypeToUse,
        dispatch,
      );
    } else if (
      fiksDigisosId.length !== 0 &&
      model.soknader.find((soknad) => soknad.fiksDigisosId === fiksDigisosId)
    ) {
      dispatch(SET_AKTIV_SOKNAD(fiksDigisosId));
    } else {
      hentFsSoknadFraFiksEllerOpprettNy(
        "001",
        model.backendUrlTypeToUse,
        dispatch,
        papirSoknad,
      );
    }
    setFiksDigisosId("");
  };

  return (
    <Panel className={`${globals.panel} ${styles.soknad_oversikt}`}>
      <Heading level="3" size="medium">
        Søknadvelger
      </Heading>
      <ul className={styles.soknadliste}>
        {soknader.map((soknad: FsSoknad, index: number) => {
          return (
            <li
              id={"soknad_" + index}
              key={"SoknadItem: " + soknad.fiksDigisosId}
              className={
                soknad.fiksDigisosId === aktivSoknad ? styles.valgtSoknad : ""
              }
            >
              <Button
                size="small"
                variant="tertiary-neutral"
                className={styles.soknad_button}
                onClick={() =>
                  onSoknadClick(dispatch, soknad.fiksDigisosId)
                }
              >
                <>{soknad.fiksDigisosId}</>
              </Button>
            </li>
          );
        })}
      </ul>
      <TextField
        id="ny_soknad_input"
        label="FiksDigisosId"
        value={fiksDigisosId}
        onChange={(evt) => setFiksDigisosId(evt.target.value.trim())}
        autoComplete="off"
      />
      <Checkbox
        onChange={() => setPapirSoknad((prev) => !prev)}
        value={papirSoknad}
      >
        Opprett som papirsøknad
      </Checkbox>
      <Button
        variant="secondary-neutral"
        onClick={onHentSoknadClick}
        size="small"
      >
        Hent / Opprett
      </Button>
    </Panel>
  );
};

export default SoknadsOversiktPanel;
