import React, { useEffect, useRef, useState } from "react";
import { RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import {
  sendNyHendelseOgOppdaterModel,
  sendPdfOgOppdaterDokumentasjonEtterspurt,
} from "../../../redux/actions";

import { FsSoknad } from "../../../redux/types";

import {
  Dokument,
  DokumentasjonEtterspurt,
  FilreferanseType,
  HendelseType,
} from "../../../types/hendelseTypes";

import {
  formatDateString,
  getDateOrNullFromDateString,
  getNow,
} from "../../../utils/utilityFunctions";

import CustomTextField from "../../../components/customTextField";
import CustomDatePicker from "../../../components/customDatePicker";
import { BodyLong, Button, Modal, Table } from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";
import styles from "./dokEtterpurt.module.css";
import { TrashIcon } from "@navikt/aksel-icons";
import {
  OPPDATER_DOKUMENTASJON_ETTERSPURT,
  SKJUL_NY_DOKUMENTASJON_ETTERSPURT_MODAL,
} from "../../../redux/reducer";

interface Props {
  soknad: FsSoknad;
}

const standardRef = "2c75227d-64f8-4db6-b718-3b6dd6beb450";
const initialDokumentasjonEtterspurt: DokumentasjonEtterspurt = {
  type: HendelseType.DokumentasjonEtterspurt,
  hendelsestidspunkt: "",
  forvaltningsbrev: {
    referanse: {
      type: FilreferanseType.dokumentlager,
      id: standardRef,
    },
  },
  vedlegg: [],
  dokumenter: [],
};

const initialDokument: Dokument = {
  dokumenttype: "",
  tilleggsinformasjon: null,
  innsendelsesfrist: null,
  dokumentreferanse: null,
};

const defaultFrist = () => {
  const date = new Date();
  date.setDate(new Date().getDate() + 7); // En uke frem i tid
  date.setHours(12);
  const innsendelsesfrist = date.toISOString();
  return innsendelsesfrist;
};

const NyDokumentasjonEtterspurtModal: React.FC<Props> = ({ soknad }: Props) => {
  const { model, visNyDokumentasjonEtterspurtModal } = useSelector(
    (state: RootState) => ({
      model: state.model,
      visNyDokumentasjonEtterspurtModal:
        state.model.visNyDokumentasjonEtterspurtModal,
    }),
  );
  const dispatch = useDispatch();

  const [modalDokumentasjonEtterspurt, setModalDokumentasjonEtterspurt] =
    useState<DokumentasjonEtterspurt>(initialDokumentasjonEtterspurt);

  useEffect(() => {
    if (soknad.dokumentasjonEtterspurt && visNyDokumentasjonEtterspurtModal) {
      setModalDokumentasjonEtterspurt({
        ...soknad.dokumentasjonEtterspurt,
      });
    }
  }, [soknad.dokumentasjonEtterspurt, visNyDokumentasjonEtterspurtModal]);

  const [modalDokument, setModalDokument] = useState<Dokument>(initialDokument);
  const [visFeilmelding, setVisFeilmelding] = useState(false);
  const [visFeilmeldingDatePicker, setVisFeilmeldingDatePicker] =
    useState(false);

  const inputEl = useRef<HTMLInputElement>(null);

  const dokumenterErAlleredeEtterspurt =
    soknad.dokumentasjonEtterspurt &&
    soknad.dokumentasjonEtterspurt.dokumenter.length > 0;

  function resetStateValues() {
    setModalDokumentasjonEtterspurt({ ...initialDokumentasjonEtterspurt });
    setModalDokument({ ...initialDokument });

    setVisFeilmelding(false);
    setVisFeilmeldingDatePicker(false);
  }

  const handleFileUpload = (files: FileList) => {
    if (files.length !== 1) {
      return;
    }
    const formData = new FormData();
    formData.append("file", files[0], files[0].name);

    sendPdfOgOppdaterDokumentasjonEtterspurt(
      formData,
      modalDokumentasjonEtterspurt.dokumenter,
      model,
      dispatch,
    );

    dispatch(SKJUL_NY_DOKUMENTASJON_ETTERSPURT_MODAL());

    setTimeout(() => {
      resetStateValues();
    }, 500);
  };

  const leggTilDokument = () => {
    const innsendelsesfristDate = getDateOrNullFromDateString(
      modalDokument.innsendelsesfrist,
    );
    const nyttDokument: Dokument = {
      dokumenttype: modalDokument.dokumenttype,
      tilleggsinformasjon: modalDokument.tilleggsinformasjon,
      innsendelsesfrist: innsendelsesfristDate
        ? innsendelsesfristDate.toISOString()
        : null,
      dokumentreferanse: createDokumentreferanse(),
    };
    setModalDokumentasjonEtterspurt({
      ...modalDokumentasjonEtterspurt,
      dokumenter: [...modalDokumentasjonEtterspurt.dokumenter, nyttDokument],
    });
    setModalDokument({ ...initialDokument });
  };

  const createDokumentreferanse = () => {
    const randomId = Math.round(Math.random() * 1_000_000);
    return "mock-dokref-" + randomId;
  };

  const sendDokumentasjonEtterspurt = () => {
    const nyHendelse: DokumentasjonEtterspurt = {
      type: HendelseType.DokumentasjonEtterspurt,
      hendelsestidspunkt: getNow(),
      forvaltningsbrev: modalDokumentasjonEtterspurt.forvaltningsbrev,
      vedlegg: [],
      dokumenter: modalDokumentasjonEtterspurt.dokumenter,
    };

    sendNyHendelseOgOppdaterModel(
      nyHendelse,
      model,
      dispatch,
      OPPDATER_DOKUMENTASJON_ETTERSPURT({
        forFiksDigisosId: soknad.fiksDigisosId,
        nyDokumentasjonEtterspurt: nyHendelse,
      }),
    );

    dispatch(SKJUL_NY_DOKUMENTASJON_ETTERSPURT_MODAL());

    setTimeout(() => {
      resetStateValues();
    }, 500);
  };

  const setDefaultDokumentasjonEtterspurt = () => {
    const nyttDokument: Dokument = {
      dokumenttype: "Husleiekvittering",
      tilleggsinformasjon: "Kvittering for betalt husleie forrige måned",
      innsendelsesfrist: defaultFrist(),
      dokumentreferanse: createDokumentreferanse(),
    };

    setModalDokumentasjonEtterspurt({
      ...modalDokumentasjonEtterspurt,
      dokumenter: [...modalDokumentasjonEtterspurt.dokumenter, nyttDokument],
    });
    setModalDokument({ ...initialDokument });
  };

  const makeTableRow = (dokument: Dokument, idx: number) => {
    const uuid = uuidv4();
    return (
      <Table.Row
        key={dokument.dokumenttype + dokument.tilleggsinformasjon + uuid}
      >
        <Table.HeaderCell scope="row">{dokument.dokumenttype}</Table.HeaderCell>
        {dokument.tilleggsinformasjon != null ? (
          <Table.DataCell>{dokument.tilleggsinformasjon}</Table.DataCell>
        ) : (
          <Table.DataCell>Ikke utfylt</Table.DataCell>
        )}
        {dokument.innsendelsesfrist != null ? (
          <Table.DataCell>
            {formatDateString(dokument.innsendelsesfrist)}
          </Table.DataCell>
        ) : (
          <Table.DataCell>Ikke utfylt</Table.DataCell>
        )}
        <Table.DataCell>{dokument.dokumentreferanse}</Table.DataCell>
        <Table.DataCell align="right">
          <Button
            aria-label="delete"
            size="small"
            onClick={() => {
              const dokumenter = [...modalDokumentasjonEtterspurt.dokumenter];
              dokumenter.splice(idx, 1);
              setModalDokumentasjonEtterspurt({
                ...modalDokumentasjonEtterspurt,
                dokumenter: dokumenter,
              });
            }}
            icon={<TrashIcon title="delete" />}
          ></Button>
        </Table.DataCell>
      </Table.Row>
    );
  };

  const DokumentasjonEtterspurtOversikt = () => {
    return modalDokumentasjonEtterspurt.dokumenter.length > 0 ? (
      <div className={globals.scroll}>
        <Table className={globals.table} size="small">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Tilleggsinformasjon</Table.HeaderCell>
              <Table.HeaderCell>Frist</Table.HeaderCell>
              <Table.HeaderCell>Dokumentreferanse</Table.HeaderCell>
              <Table.HeaderCell align="right">Slett</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {modalDokumentasjonEtterspurt.dokumenter.map((dokument, idx) =>
              makeTableRow(dokument, idx),
            )}
          </Table.Body>
        </Table>
      </div>
    ) : (
      <>
        <BodyLong>Ingen dokumenter er lagt til</BodyLong>
      </>
    );
  };

  const onAddClick = () => {
    return () => {
      if (modalDokument.dokumenttype === "") {
        setVisFeilmelding(true);
      } else if (
        getDateOrNullFromDateString(modalDokument.innsendelsesfrist) == null
      ) {
        setVisFeilmeldingDatePicker(true);
      } else {
        leggTilDokument();
      }
    };
  };

  return (
    <Modal
      className={globals.modal}
      open={visNyDokumentasjonEtterspurtModal}
      onClose={() => {
        dispatch(SKJUL_NY_DOKUMENTASJON_ETTERSPURT_MODAL());
        resetStateValues();
      }}
      header={{ heading: "Dokumentasjon etterspurt" }}
    >
      <Modal.Body className={globals.modal_gridContent}>
        <CustomTextField
          label={"Dokumenttype *"}
          value={modalDokument.dokumenttype}
          setValue={(verdi: string) =>
            setModalDokument({
              ...modalDokument,
              dokumenttype: verdi,
            })
          }
          required={true}
          visFeilmelding={visFeilmelding}
          setVisFeilmelding={setVisFeilmelding}
        />
        <CustomTextField
          label={"Tilleggsinformasjon"}
          value={modalDokument.tilleggsinformasjon}
          setValue={(verdi: string) =>
            setModalDokument({
              ...modalDokument,
              tilleggsinformasjon: verdi,
            })
          }
        />
        <CustomDatePicker
          label={"Innsendelsesfrist *"}
          value={modalDokument.innsendelsesfrist}
          setValue={(verdi: string) => {
            setModalDokument({
              ...modalDokument,
              innsendelsesfrist: verdi,
            });
          }}
          required={true}
          visFeilmelding={visFeilmeldingDatePicker}
          setVisFeilmelding={setVisFeilmeldingDatePicker}
        />
        <div className={styles.fyllut_knapper}>
          <Button
            variant="secondary-neutral"
            onClick={onAddClick()}
            size="small"
          >
            Legg til
          </Button>
          <Button
            variant="tertiary-neutral"
            size="small"
            onClick={() => {
              setDefaultDokumentasjonEtterspurt();
            }}
          >
            Legg til defaultverdier
          </Button>
        </div>
        <div className={styles.dokEtterspurtOversikt}>
          <DokumentasjonEtterspurtOversikt />
        </div>

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
      </Modal.Body>
      <Modal.Footer>
        <Button
          size="small"
          variant={
            !dokumenterErAlleredeEtterspurt ? "primary" : "secondary-neutral"
          }
          onClick={() => {
            sendDokumentasjonEtterspurt();
          }}
        >
          {dokumenterErAlleredeEtterspurt
            ? "Endre etterspurt dokumentasjon"
            : "Etterspør dokumentasjon"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NyDokumentasjonEtterspurtModal;
