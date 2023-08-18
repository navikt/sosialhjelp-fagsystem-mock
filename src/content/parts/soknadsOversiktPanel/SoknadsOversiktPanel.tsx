import React, { useState } from "react";
import { AppState, Dispatch, DispatchProps } from "../../../redux/reduxTypes";
import { connect } from "react-redux";
import { FsSoknad, Model } from "../../../redux/types";
import {
  hentFsSoknadFraFiksEllerOpprettNy,
  setAktivSoknad,
} from "../../../redux/actions";
import { FIKSDIGISOSID_URL_PARAM } from "../../../redux/reducer";
import { Button, Checkbox, Heading, Panel, TextField } from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";
import styles from "./soknadsOversikt.module.css";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface StoreProps {
  soknader: FsSoknad[];
  aktivSoknad: string;
  model: Model;
}

type Props = DispatchProps & StoreProps;

const SoknadsOversiktPanel: React.FC<Props> = (props: Props) => {
  const { soknader, aktivSoknad, model } = props;

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
    dispatch(setAktivSoknad(fiksDigisosId.trim()));
  };

  const onHentSoknadClick = () => {
    if (
      fiksDigisosId.length !== 0 &&
      !model.soknader.find((soknad) => soknad.fiksDigisosId === fiksDigisosId)
    ) {
      hentFsSoknadFraFiksEllerOpprettNy(
        fiksDigisosId,
        model.backendUrlTypeToUse,
        props.dispatch,
      );
    } else if (
      fiksDigisosId.length !== 0 &&
      model.soknader.find((soknad) => soknad.fiksDigisosId === fiksDigisosId)
    ) {
      props.dispatch(setAktivSoknad(fiksDigisosId));
    } else {
      hentFsSoknadFraFiksEllerOpprettNy(
        "001",
        model.backendUrlTypeToUse,
        props.dispatch,
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
                  onSoknadClick(props.dispatch, soknad.fiksDigisosId)
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

const mapStateToProps = (state: AppState) => ({
  soknader: state.model.soknader,
  aktivSoknad: state.model.aktivSoknad,
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
)(SoknadsOversiktPanel);
