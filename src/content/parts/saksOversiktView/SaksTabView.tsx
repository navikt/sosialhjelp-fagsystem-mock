import React, { useState } from "react";
import { AppState } from "../../../redux/reduxTypes";
import { useDispatch, useSelector } from "react-redux";

import { HendelseType, SaksStatus } from "../../../types/hendelseTypes";

import { FsSaksStatus, FsSoknad } from "../../../redux/types";

import { sendNyHendelseOgOppdaterModel } from "../../../redux/actions";
import { getNow } from "../../../utils/utilityFunctions";

import EndreSaksstatusComponent from "./EndreSaksstatusComponent";
import VedtakFattetView from "./VedtakFattetView";
import UtbetalingOversiktView from "../utbetaling/UtbetalingOversiktView";
import { Button, Label, TextField } from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";
import styles from "./saksoversikt.module.css";
import { OPPDATER_FS_SAKS_STATUS } from "../../../redux/reducer";

interface Props {
  sak: FsSaksStatus;
  soknad: FsSoknad;
}

const SaksTabView = ({ soknad, sak }: Props) => {
  const [tittel, setTittel] = useState("");
  const model = useSelector((state: AppState) => state.model);
  const dispatch = useDispatch();

  return (
    <div className={styles.saker}>
      <div className={globals.flexRow}>
        <TextField
          size="small"
          label={"Ny tittel på sak"}
          value={tittel}
          onChange={(evt) => setTittel(evt.target.value)}
          autoComplete="off"
        />
        <Button
          size="small"
          onClick={() => {
            if (tittel.length > 0) {
              const nyHendelse: SaksStatus = {
                type: HendelseType.SaksStatus,
                hendelsestidspunkt: getNow(),
                referanse: sak.referanse,
                tittel: tittel,
                status: sak.status,
              };

              sendNyHendelseOgOppdaterModel(
                nyHendelse,
                model,
                dispatch,
                OPPDATER_FS_SAKS_STATUS({
                  forFiksDigisosId: soknad.fiksDigisosId,
                  oppdatertSaksstatus: nyHendelse,
                }),
              );
            }
          }}
          variant="secondary-neutral"
        >
          Oppdater tittel
        </Button>
      </div>

      <EndreSaksstatusComponent soknad={soknad} sak={sak} />
      <div>
        <Label as={"p"} spacing>
          Utbetalinger
        </Label>

        <UtbetalingOversiktView
          utbetalingListe={sak.utbetalinger}
          saksreferanse={sak.referanse}
        />
      </div>
      <VedtakFattetView soknad={soknad} sak={sak} />
    </div>
  );
};

export default SaksTabView;
