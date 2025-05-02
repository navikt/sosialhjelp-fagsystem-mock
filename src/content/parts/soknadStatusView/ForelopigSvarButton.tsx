import { Button } from "@navikt/ds-react";
import { ForelopigSvar, HendelseType } from "../../../types/hendelseTypes";
import { getNow } from "../../../utils/utilityFunctions";
import {
  defaultDokumentlagerRef,
  OPPDATER_FORELOPIG_SVAR,
} from "../../../redux/reducer";
import { sendNyHendelseOgOppdaterModel } from "../../../redux/actions";
import { AppState } from "../../../redux/reduxTypes";
import { FsSoknad } from "../../../redux/types";
import { useDispatch, useSelector } from "react-redux";

interface Props {
  soknad: FsSoknad;
}

const ForelopigSvarButton = ({ soknad }: Props) => {
  const model = useSelector((state: AppState) => state.model);
  const dispatch = useDispatch();

  return (
    <Button
      size="small"
      onClick={() => {
        const nyHendelse: ForelopigSvar = {
          type: HendelseType.ForelopigSvar,
          hendelsestidspunkt: getNow(),
          forvaltningsbrev: {
            referanse: {
              type: defaultDokumentlagerRef.type,
              id: defaultDokumentlagerRef.id,
            },
          },
          vedlegg: [],
        };

        sendNyHendelseOgOppdaterModel(
          nyHendelse,
          model,
          dispatch,
          OPPDATER_FORELOPIG_SVAR({
            forFiksDigisosId: soknad.fiksDigisosId,
            nyttForelopigSvar: nyHendelse,
          }),
        );
      }}
    >
      {"Send foreløpig svar"}
    </Button>
  );
};

export default ForelopigSvarButton;
