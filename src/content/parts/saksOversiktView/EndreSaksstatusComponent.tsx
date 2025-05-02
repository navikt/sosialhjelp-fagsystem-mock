import React from "react";
import { AppState } from "../../../redux/reduxTypes";
import { useDispatch, useSelector } from "react-redux";

import { sendNyHendelseOgOppdaterModel } from "../../../redux/actions";
import {
  HendelseType,
  SaksStatus,
  SaksStatusType,
} from "../../../types/hendelseTypes";
import { getNow } from "../../../utils/utilityFunctions";
import { FsSaksStatus, FsSoknad } from "../../../redux/types";

import { Select } from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";
import { OPPDATER_FS_SAKS_STATUS } from "../../../redux/reducer";
interface Props {
  soknad: FsSoknad;
  sak: FsSaksStatus;
}

const EndreSaksstatusComponent: React.FC<Props> = ({ soknad, sak }: Props) => {
  const model = useSelector((state: AppState) => state.model);
  const dispatch = useDispatch();
  return (
    <Select
      className={globals.fitContent}
      size="small"
      label="Endre saksstatus"
      value={sak.status ? sak.status : ""}
      onChange={(evt) => {
        let value = evt.target.value;
        if (
          value === SaksStatusType.UNDER_BEHANDLING ||
          value === SaksStatusType.BEHANDLES_IKKE ||
          value === SaksStatusType.FEILREGISTRERT ||
          value === SaksStatusType.IKKE_INNSYN
        ) {
          const nyHendelse: SaksStatus = {
            type: HendelseType.SaksStatus,
            hendelsestidspunkt: getNow(),
            referanse: sak.referanse,
            tittel: sak.tittel,
            status: value,
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
    >
      <option hidden disabled value=""></option>
      <option
        key={"saksstatusSelect: 0"}
        value={SaksStatusType.UNDER_BEHANDLING}
      >
        Under behandling
      </option>
      <option key={"saksstatusSelect: 1"} value={SaksStatusType.IKKE_INNSYN}>
        Ikke innsyn
      </option>
      <option key={"saksstatusSelect: 2"} value={SaksStatusType.FEILREGISTRERT}>
        Feilregistrert
      </option>
      <option key={"saksstatusSelect: 3"} value={SaksStatusType.BEHANDLES_IKKE}>
        Behandles ikke
      </option>
    </Select>
  );
};

export default EndreSaksstatusComponent;
