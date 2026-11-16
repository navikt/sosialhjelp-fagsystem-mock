import React, { useRef, useState } from "react";
import { RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";

import { sendPdfOgOppdaterVedtakFattet } from "../../../redux/actions";
import { Utfall } from "../../../types/hendelseTypes";
import { lagDummyPdfFormData } from "../../../utils/dummyPdf";
import { FsSaksStatus, FsSoknad } from "../../../redux/types";

import { Button, Select } from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";

interface Props {
  soknad: FsSoknad;
  sak: FsSaksStatus;
}

const VedtakFattetView: React.FC<Props> = ({ sak }: Props) => {
  const [vedtakFattetUtfall, setVedtakFattetUtfall] = useState<Utfall | null>(
    null,
  );
  const model = useSelector((state: RootState) => state.model);
  const dispatch = useDispatch();
  const inputEl = useRef<HTMLInputElement>(null);

  const handleFileUpload = (files: FileList) => {
    if (files.length !== 1) {
      return;
    }
    const formData = new FormData();
    formData.append("file", files[0], files[0].name);

    sendPdfOgOppdaterVedtakFattet(
      formData,
      vedtakFattetUtfall,
      sak.referanse,
      model,
      dispatch,
    );
  };

  return (
    <div>
      <div className={`${globals.flex} ${globals.flexRow}`}>
        <Select
          label="Vedtak utfall"
          size="small"
          value={vedtakFattetUtfall ? vedtakFattetUtfall : ""}
          onChange={(evt) => {
            const value = evt.target.value;
            if (
              value === Utfall.INNVILGET ||
              value === Utfall.DELVIS_INNVILGET ||
              value === Utfall.AVSLATT ||
              value === Utfall.AVVIST
            ) {
              setVedtakFattetUtfall(value);
            }
          }}
        >
          <option hidden disabled value=""></option>
          <option key={"vedtakFattetStatusSelect: 0"} value={Utfall.INNVILGET}>
            Innvilget
          </option>
          <option
            key={"vedtakFattetStatusSelect: 1"}
            value={Utfall.DELVIS_INNVILGET}
          >
            Delvis innvilget
          </option>
          <option key={"vedtakFattetStatusSelect: 2"} value={Utfall.AVSLATT}>
            Avslått
          </option>
          <option key={"vedtakFattetStatusSelect: 3"} value={Utfall.AVVIST}>
            Avvist
          </option>
        </Select>
        <Button
          size="small"
          variant="secondary-neutral"
          onClick={() => {
            sendPdfOgOppdaterVedtakFattet(
              lagDummyPdfFormData("Vedtak"),
              vedtakFattetUtfall,
              sak.referanse,
              model,
              dispatch,
            );
          }}
        >
          {"Send vedtak fattet"}
        </Button>
        <input
          id={"inputField vedtakFattet"}
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
      </div>
    </div>
  );
};

export default VedtakFattetView;
