import React, { useRef } from "react";
import { RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import { BodyShort, Heading, Panel, Radio, RadioGroup } from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";

import {
  HendelseType,
  SoknadsStatus,
  SoknadsStatusType,
} from "../../../types/hendelseTypes";

import { FsSoknad } from "../../../redux/types";
import {
  sendNyHendelseOgOppdaterModel,
  sendPdfOgOppdaterForelopigSvar,
} from "../../../redux/actions";
import { getNow } from "../../../utils/utilityFunctions";
import ForelopigSvarButton from "./ForelopigSvarButton";
import { OPPDATER_SOKNADS_STATUS } from "../../../redux/reducer";

interface Props {
  soknad: FsSoknad;
}

const SoknadStatusView = ({ soknad }: Props) => {
  const model = useSelector((state: RootState) => state.model);
  const dispatch = useDispatch();
  const inputEl = useRef<HTMLInputElement>(null);

  const handleFileUpload = (files: FileList) => {
    if (files.length !== 1) {
      return;
    }
    const formData = new FormData();
    formData.append("file", files[0], files[0].name);

    dispatch(sendPdfOgOppdaterForelopigSvar(formData));
  };

  function getAntallForelopigSvarHendelser() {
    return soknad.fiksDigisosSokerJson.sak.soker.hendelser.filter(
      (hendelse) => hendelse.type === HendelseType.ForelopigSvar,
    ).length;
  }

  return (
    <div className={globals.flex}>
      <Panel className={globals.panel}>
        <RadioGroup
          legend={
            <Heading level="5" size="small">
              Status på Søknaden
            </Heading>
          }
          name="soknadsStatus1"
          value={soknad.soknadsStatus.status}
          onChange={(value) => {
            if (
              value === SoknadsStatusType.MOTTATT ||
              value === SoknadsStatusType.UNDER_BEHANDLING ||
              value === SoknadsStatusType.FERDIGBEHANDLET ||
              value === SoknadsStatusType.BEHANDLES_IKKE
            ) {
              const nyHendelse: SoknadsStatus = {
                type: HendelseType.SoknadsStatus,
                hendelsestidspunkt: getNow(),
                status: value,
              };

              sendNyHendelseOgOppdaterModel(
                nyHendelse,
                model,
                dispatch,
                OPPDATER_SOKNADS_STATUS({
                  forFiksDigisosId: soknad.fiksDigisosId,
                  nySoknadsStatus: nyHendelse,
                }),
              );
            }
          }}
        >
          <Radio value={SoknadsStatusType.MOTTATT}>Mottatt</Radio>
          <Radio value={SoknadsStatusType.UNDER_BEHANDLING}>
            {" "}
            Under behandling
          </Radio>
          <Radio value={SoknadsStatusType.FERDIGBEHANDLET}>
            Ferdigbehandlet
          </Radio>
          <Radio value={SoknadsStatusType.BEHANDLES_IKKE}>Behandles ikke</Radio>
        </RadioGroup>
      </Panel>
      <Panel className={`${globals.panel}`}>
        <Heading level="3" size="small">
          Foreløpig svar
        </Heading>
        <ForelopigSvarButton soknad={soknad} />
        <BodyShort>
          {"Antall sendt: " + getAntallForelopigSvarHendelser()}
        </BodyShort>
        <input
          id={"inputField"}
          ref={inputEl}
          onChange={(e) => {
            if (e.target.files) {
              handleFileUpload(e.target.files);
            }
          }}
          onClick={(event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
            const element = event.target as HTMLInputElement;
            element.value = "";
          }}
          type="file"
          hidden={true}
          className="visuallyhidden"
          tabIndex={-1}
          accept={
            window.navigator.platform.match(/iPad|iPhone|iPod/) !== null
              ? "*"
              : "application/pdf"
          }
        />
      </Panel>
    </div>
  );
};

export default SoknadStatusView;
