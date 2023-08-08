import React, { useEffect, useState } from "react";
import { AppState, DispatchProps } from "../../../redux/reduxTypes";
import { connect } from "react-redux";
import {
  nyttDokumentasjonkrav,
  oppdaterDokumentasjonkrav,
  sendNyHendelseOgOppdaterModel,
  setAktivtDokumentasjonkrav,
  skjulNyDokumentasjonkravModal,
} from "../../../redux/actions";
import { FsSoknad, Model } from "../../../redux/types";
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
import globals from "../../../globals.module.css";

interface OwnProps {
  soknad: FsSoknad;
}

interface StoreProps {
  visNyDokumentasjonkravModal: boolean;
  model: Model;
  aktivtDokumentasjonkrav: string | undefined | null;
  modalSaksreferanse: string | null;
}

type Props = DispatchProps & OwnProps & StoreProps;

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

let date = new Date();
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

const NyttDokumentasjonkravModal: React.FC<Props> = (props: Props) => {
  const [modalDokumentasjonkrav, setModalDokumentasjonkrav] =
    useState<Dokumentasjonkrav>(initialDokumentasjonkrav);
  const [visFeilmelding, setVisFeilmelding] = useState(false);
  const [referansefeltDisabled, setReferansefeltDisabled] = useState(false);

  const {
    visNyDokumentasjonkravModal,
    dispatch,
    model,
    soknad,
    aktivtDokumentasjonkrav,
    modalSaksreferanse,
  } = props;

  const resetStateValues = () => {
    setModalDokumentasjonkrav({
      ...initialDokumentasjonkrav,
      dokumentasjonkravreferanse: generateFilreferanseId(),
    });
    setVisFeilmelding(false);
    setReferansefeltDisabled(false);

    dispatch(setAktivtDokumentasjonkrav(null));
  };

  const sendDokumentasjonkrav = () => {
    let fristDate = getDateOrNullFromDateString(modalDokumentasjonkrav.frist);

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
        nyttDokumentasjonkrav(soknad.fiksDigisosId, nyHendelse),
      );
    } else {
      sendNyHendelseOgOppdaterModel(
        nyHendelse,
        model,
        dispatch,
        oppdaterDokumentasjonkrav(soknad.fiksDigisosId, nyHendelse),
      );
    }

    dispatch(dispatch(skjulNyDokumentasjonkravModal()));

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

    setVisFeilmelding(false);
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

  useEffect(() => {
    Modal.setAppElement("#root");
  }, []);

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
      aria-label="Nytt dokumentasjonskrav"
      className={globals.modal}
      open={visNyDokumentasjonkravModal}
      onClose={() => {
        props.dispatch(skjulNyDokumentasjonkravModal());
        setTimeout(() => {
          resetStateValues();
        }, 500);
      }}
    >
      <Modal.Content className={globals.modal_gridContent}>
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
          visFeilmelding={visFeilmelding}
          setVisFeilmelding={setVisFeilmelding}
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
          value={
            modalDokumentasjonkrav.status ? modalDokumentasjonkrav.status : ""
          }
          onChange={(evt: any) =>
            setModalDokumentasjonkrav({
              ...modalDokumentasjonkrav,
              status: evt.target.value as DokumentasjonkravStatus,
            })
          }
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
        <div className={globals.buttonGroup}>
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
          <Button
            size="small"
            variant={
              aktivtDokumentasjonkrav == null ? "primary" : "secondary-neutral"
            }
            onClick={() => {
              if (!visFeilmelding) {
                sendDokumentasjonkrav();
              }
            }}
          >
            {aktivtDokumentasjonkrav == null
              ? "Legg til dokumentasjonkrav"
              : "Endre dokumentasjonkrav"}
          </Button>
        </div>
      </Modal.Content>
    </Modal>
  );
};

const mapStateToProps = (state: AppState) => ({
  visNyDokumentasjonkravModal: state.model.visNyDokumentasjonkravModal,
  model: state.model,
  aktivtDokumentasjonkrav: state.model.aktivtDokumentasjonkrav,
  modalSaksreferanse: state.model.modalSaksreferanse,
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    dispatch,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(NyttDokumentasjonkravModal);
