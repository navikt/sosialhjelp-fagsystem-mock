import React, { useEffect, useState } from "react";
import { RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import { sendNyHendelseOgOppdaterModel } from "../../../redux/actions";
import { FsSoknad } from "../../../redux/types";
import {
  generateFilreferanseId,
  getAllUtbetalingsreferanser,
  getDateOrNullFromDateString,
  getDokumentasjonkravByDokumentasjonkravreferanse,
  getNow,
  getSakTittelFraSaksreferanse,
  getSakTittelOgNrFraUtbetalingsreferanse,
  getShortDateISOString,
} from "../../../utils/utilityFunctions";
import {
  Dokumentasjonkrav,
  DokumentasjonkravStatus,
  HendelseType,
} from "../../../types/hendelseTypes";

import CustomTextField from "../../../components/customTextField";
import CustomDatePicker from "../../../components/customDatePicker";
import { Button, Modal, Select, Chips, Fieldset } from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";
import {
  NYTT_DOKUMENTASJONKRAV,
  OPPDATER_DOKUMENTASJONKRAV,
  SET_AKTIVT_DOKUMENTASJONKRAV,
  SKJUL_NY_DOKUMENTASJONKRAV_MODAL,
} from "../../../redux/reducer";

interface Props {
  soknad: FsSoknad;
}

const initialDokumentasjonkrav: Dokumentasjonkrav = {
  type: HendelseType.Dokumentasjonkrav,
  hendelsestidspunkt: "",
  dokumentasjonkravreferanse: generateFilreferanseId(),
  utbetalingsreferanse: null,
  tittel: "",
  beskrivelse: null,
  frist: null,
  status: null,
  saksreferanse: "",
};

const date = new Date();
date.setDate(new Date().getDate() + 7);
date.setHours(12);
const defaultFrist = getShortDateISOString(date);

const defaultDokumentasjonkrav: Dokumentasjonkrav = {
  type: HendelseType.Dokumentasjonkrav,
  hendelsestidspunkt: "",
  dokumentasjonkravreferanse: generateFilreferanseId(),
  utbetalingsreferanse: [],
  tittel: "Husleie for forrige måned",
  beskrivelse:
    "Du må levere kopi av kvittering for betalt husleie forrige måned.",
  frist: defaultFrist,
  status: DokumentasjonkravStatus.RELEVANT,
  saksreferanse: null,
};

type ErrorableField = "status" | "dokumentasjonkravreferanse";

const NyttDokumentasjonkravModal: React.FC<Props> = ({ soknad }: Props) => {
  const dispatch = useDispatch();
  const {
    visNyDokumentasjonkravModal,
    model,
    aktivtDokumentasjonkrav,
    modalSaksreferanse,
  } = useSelector((state: RootState) => ({
    visNyDokumentasjonkravModal: state.model.visNyDokumentasjonkravModal,
    model: state.model,
    aktivtDokumentasjonkrav: state.model.aktivtDokumentasjonkrav,
    modalSaksreferanse: state.model.modalSaksreferanse,
  }));
  const [modalDokumentasjonkrav, setModalDokumentasjonkrav] =
    useState<Dokumentasjonkrav>(initialDokumentasjonkrav);
  const [fieldsWithError, setFieldsWithError] = useState<ErrorableField[]>([]);
  const [referansefeltDisabled, setReferansefeltDisabled] = useState(false);

  const resetStateValues = () => {
    setModalDokumentasjonkrav({
      ...initialDokumentasjonkrav,
      dokumentasjonkravreferanse: generateFilreferanseId(),
    });
    setFieldsWithError([]);
    setReferansefeltDisabled(false);

    dispatch(SET_AKTIVT_DOKUMENTASJONKRAV(null));
  };

  const sendDokumentasjonkrav = () => {
    const fristDate = getDateOrNullFromDateString(modalDokumentasjonkrav.frist);

    const nyHendelse: Dokumentasjonkrav = {
      ...modalDokumentasjonkrav,
      frist: fristDate?.toISOString() ?? null,
    };
    nyHendelse.hendelsestidspunkt = getNow();

    if (aktivtDokumentasjonkrav == null) {
      sendNyHendelseOgOppdaterModel(
        nyHendelse,
        model,
        dispatch,
        NYTT_DOKUMENTASJONKRAV({
          forFiksDigisosId: soknad.fiksDigisosId,
          nyttDokumentasjonkrav: nyHendelse,
        }),
      );
    } else {
      sendNyHendelseOgOppdaterModel(
        nyHendelse,
        model,
        dispatch,
        OPPDATER_DOKUMENTASJONKRAV({
          forFiksDigisosId: soknad.fiksDigisosId,
          oppdatertDokumentasjonkrav: nyHendelse,
        }),
      );
    }

    dispatch(SKJUL_NY_DOKUMENTASJONKRAV_MODAL());

    setTimeout(() => {
      resetStateValues();
    }, 500);
  };

  const setDefaultDokumentasjonkrav = () => {
    setModalDokumentasjonkrav({
      ...defaultDokumentasjonkrav,
      dokumentasjonkravreferanse: generateFilreferanseId(),
    });

    const alleUtbetalingsreferanser = getAllUtbetalingsreferanser(soknad);
    if (alleUtbetalingsreferanser.length > 0) {
      setModalDokumentasjonkrav({
        ...defaultDokumentasjonkrav,
        dokumentasjonkravreferanse: generateFilreferanseId(),
        utbetalingsreferanse: [alleUtbetalingsreferanser[0]],
      });
    }

    setFieldsWithError([]);
    setReferansefeltDisabled(false);
  };

  useEffect(() => {
    if (aktivtDokumentasjonkrav && visNyDokumentasjonkravModal) {
      const dokumentasjonkrav =
        getDokumentasjonkravByDokumentasjonkravreferanse(
          soknad.dokumentasjonkrav,
          aktivtDokumentasjonkrav,
        );
      if (dokumentasjonkrav) {
        setModalDokumentasjonkrav(dokumentasjonkrav);
        setTimeout(() => {
          setReferansefeltDisabled(true);
        }, 10);
      }
    }
  }, [
    aktivtDokumentasjonkrav,
    visNyDokumentasjonkravModal,
    soknad.dokumentasjonkrav,
  ]);

  const onChipToggled = (value: string) => {
    const selected = modalDokumentasjonkrav?.utbetalingsreferanse ?? [];
    setModalDokumentasjonkrav({
      ...modalDokumentasjonkrav,
      utbetalingsreferanse: selected?.includes(value)
        ? selected.filter((x) => x !== value)
        : [...selected, value],
    });
  };

  return (
    <Modal
      className={globals.modal}
      open={visNyDokumentasjonkravModal}
      onClose={() => {
        dispatch(SKJUL_NY_DOKUMENTASJONKRAV_MODAL());
        resetStateValues();
      }}
      header={{ heading: "Dokumentasjonkrav" }}
    >
      <Modal.Body className={globals.modal_gridContent}>
        <CustomTextField
          label={"Dokumentasjonkravreferanse *"}
          value={modalDokumentasjonkrav.dokumentasjonkravreferanse}
          setValue={(verdi: string) =>
            setModalDokumentasjonkrav({
              ...modalDokumentasjonkrav,
              dokumentasjonkravreferanse: verdi,
            })
          }
          required={true}
          referansefeltDisabled={referansefeltDisabled}
          visFeilmelding={fieldsWithError.includes(
            "dokumentasjonkravreferanse",
          )}
          setVisFeilmelding={(b: boolean) => {
            if (b) {
              setFieldsWithError((prev) =>
                !prev.includes("dokumentasjonkravreferanse")
                  ? [...prev, "dokumentasjonkravreferanse"]
                  : prev,
              );
            } else {
              setFieldsWithError((prev) => prev.filter((x) => x !== "status"));
            }
          }}
        />
        <CustomTextField
          label={"Tittel"}
          value={modalDokumentasjonkrav.tittel}
          setValue={(verdi: string) =>
            setModalDokumentasjonkrav({
              ...modalDokumentasjonkrav,
              tittel: verdi,
            })
          }
        />
        <CustomTextField
          label={"Beskrivelse"}
          value={modalDokumentasjonkrav.beskrivelse}
          setValue={(verdi: string) =>
            setModalDokumentasjonkrav({
              ...modalDokumentasjonkrav,
              beskrivelse: verdi,
            })
          }
        />
        <CustomDatePicker
          label={"Frist"}
          value={modalDokumentasjonkrav.frist}
          setValue={(verdi: string) => {
            setModalDokumentasjonkrav({
              ...modalDokumentasjonkrav,
              frist: verdi,
            });
          }}
        />
        <Select
          size="small"
          label="Status *"
          error={fieldsWithError.includes("status") && "Status er påkrevd"}
          value={
            modalDokumentasjonkrav.status ? modalDokumentasjonkrav.status : ""
          }
          onChange={(evt) => {
            setModalDokumentasjonkrav({
              ...modalDokumentasjonkrav,
              status: evt.target.value as DokumentasjonkravStatus,
            });
            setFieldsWithError((prev) => prev.filter((x) => x !== "status"));
          }}
        >
          <option hidden disabled value=""></option>
          <option value={DokumentasjonkravStatus.RELEVANT}>Relevant</option>
          <option value={DokumentasjonkravStatus.LEVERT_TIDLIGERE}>
            Levert tidligere
          </option>
          <option value={DokumentasjonkravStatus.ANNULLERT}>Annullert</option>
          <option value={DokumentasjonkravStatus.OPPFYLT}>Oppfylt</option>
          <option value={DokumentasjonkravStatus.IKKE_OPPFYLT}>
            Ikke oppfylt
          </option>
        </Select>
        <Select
          size="small"
          label="Saksreferanse"
          disabled={modalSaksreferanse != null}
          value={
            modalDokumentasjonkrav.saksreferanse
              ? modalDokumentasjonkrav.saksreferanse
              : ""
          }
          onChange={(evt) =>
            setModalDokumentasjonkrav({
              ...modalDokumentasjonkrav,
              saksreferanse: evt.target.value as string,
            })
          }
        >
          <option hidden disabled value=""></option>
          {soknad.saker.map((sak) => (
            <option key={sak.referanse} value={sak.referanse}>
              {sak.referanse +
                " " +
                getSakTittelFraSaksreferanse(soknad, sak.referanse)}
            </option>
          ))}
        </Select>
        <Fieldset
          legend="Utbetalingsreferanser"
          description="Velg ønskede utbetalinger"
        >
          <Chips>
            {getAllUtbetalingsreferanser(soknad).map((value) => {
              return (
                <Chips.Toggle
                  key={value}
                  className={globals.chip}
                  onClick={() => onChipToggled(value)}
                  selected={modalDokumentasjonkrav?.utbetalingsreferanse?.includes(
                    value,
                  )}
                >
                  {value +
                    " " +
                    getSakTittelOgNrFraUtbetalingsreferanse(soknad, value)}
                </Chips.Toggle>
              );
            })}
          </Chips>
        </Fieldset>
      </Modal.Body>
      <Modal.Footer>
        <Button
          size="small"
          variant={
            aktivtDokumentasjonkrav == null ? "primary" : "secondary-neutral"
          }
          onClick={() => {
            const _errors: ErrorableField[] = [];
            if (modalDokumentasjonkrav.status == null) {
              _errors.push("status");
            }
            if (
              modalDokumentasjonkrav.dokumentasjonkravreferanse.length === 0
            ) {
              _errors.push("dokumentasjonkravreferanse");
            }
            setFieldsWithError(_errors)
            if (_errors.length === 0 && fieldsWithError.length === 0) {
              return sendDokumentasjonkrav();
            }
          }}
        >
          {aktivtDokumentasjonkrav == null
            ? "Legg til dokumentasjonkrav"
            : "Endre dokumentasjonkrav"}
        </Button>
        {aktivtDokumentasjonkrav == null && (
          <Button
            size="small"
            variant="secondary-neutral"
            onClick={() => {
              setDefaultDokumentasjonkrav();
            }}
          >
            Fyll ut alle felter
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default NyttDokumentasjonkravModal;
