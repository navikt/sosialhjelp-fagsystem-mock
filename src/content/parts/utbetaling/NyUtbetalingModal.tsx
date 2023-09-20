import React, { useState } from "react";
import { AppState, DispatchProps } from "../../../redux/reduxTypes";
import { connect } from "react-redux";

import {
  nyUtbetaling,
  oppdaterUtbetaling,
  sendNyHendelseOgOppdaterModel,
  setAktivUtbetaling,
  skjulNyUtbetalingModal,
} from "../../../redux/actions";

import { FsSoknad, Model } from "../../../redux/types";
import useEffectOnce, {
  formatDateString,
  generateFilreferanseId,
  getNow,
  getSakTittelFraSaksreferanse,
  getShortDateISOString,
  getUtbetalingByUtbetalingsreferanse,
} from "../../../utils/utilityFunctions";

import {
  HendelseType,
  Utbetaling,
  UtbetalingStatus,
} from "../../../types/hendelseTypes";

import CustomTextField from "../../../components/customTextField";
import CustomDatePicker from "../../../components/customDatePicker";
import {
  Button,
  Modal,
  Select,
  TextField,
  ToggleGroup,
} from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";
import styles from "./utbetaling.module.css";

interface OwnProps {
  soknad: FsSoknad;
}

interface StoreProps {
  visNyUtbetalingModal: boolean;
  model: Model;
  aktivUtbetaling: string | undefined | null;
  modalSaksreferanse: string | null;
}

type Props = DispatchProps & OwnProps & StoreProps;

const initialUtbetaling: Utbetaling = {
  type: HendelseType.Utbetaling,
  hendelsestidspunkt: "",
  utbetalingsreferanse: generateFilreferanseId(),
  saksreferanse: "",
  status: null,
  belop: null,
  beskrivelse: null,
  forfallsdato: null,
  utbetalingsdato: null,
  fom: null,
  tom: null,
  annenMottaker: null,
  mottaker: null,
  kontonummer: null,
  utbetalingsmetode: null,
};

let date = new Date();
date.setDate(new Date().getDate() - 7); // En uke bak i tid
date.setHours(12);
const defaultForfallsdato = getShortDateISOString(date);

date = new Date();
date.setDate(new Date().getDate() - 8); // Åtte dager bak i tid
date.setHours(12);
const defaultUtbetalingsdato = getShortDateISOString(date);

date = new Date();
date.setDate(new Date().getDate() - 14); // To uker tilbake i tid
date.setHours(12);
const defaultFomDato = getShortDateISOString(date);

date = new Date();
date.setDate(new Date().getDate() + 14); // To uker fram i tid
date.setHours(12);
const defaultTomDato = getShortDateISOString(date);

const defaultUtbetaling: Utbetaling = {
  type: HendelseType.Utbetaling,
  hendelsestidspunkt: "",
  utbetalingsreferanse: generateFilreferanseId(),
  saksreferanse: null,
  status: UtbetalingStatus.UTBETALT,
  belop: 6550,
  beskrivelse: "Livsopphold",
  forfallsdato: defaultForfallsdato,
  utbetalingsdato: defaultUtbetalingsdato,
  fom: defaultFomDato,
  tom: defaultTomDato,
  annenMottaker: false,
  mottaker: "Standard Standarsen",
  kontonummer: "12345678903",
  utbetalingsmetode: "Bankkonto",
};

const NyUtbetalingModal: React.FC<Props> = (props: Props) => {
  const [modalUtbetaling, setModalUtbetaling] =
    useState<Utbetaling>(initialUtbetaling);
  const [kontonummerLabelPlaceholder, setKontonummerLabelPlaceholder] =
    useState("Kontonummer (Ikke satt)");

  const [visFeilmelding, setVisFeilmelding] = useState(false);
  const [referansefeltDisabled, setReferansefeltDisabled] = useState(false);

  const {
    visNyUtbetalingModal,
    dispatch,
    model,
    soknad,
    aktivUtbetaling,
    modalSaksreferanse,
  } = props;

  useEffectOnce(() => {
    if (aktivUtbetaling) {
      let utbetaling = getUtbetalingByUtbetalingsreferanse(
        soknad,
        aktivUtbetaling,
      );
      if (utbetaling) {
        setModalUtbetaling(utbetaling);

        setKontonummerLabelPlaceholder(
          utbetaling.kontonummer == null
            ? "Kontonummer (Ikke satt)"
            : "Kontonummer",
        );
        setTimeout(() => {
          setReferansefeltDisabled(true);
        }, 10);
      }
    } else {
      setModalUtbetaling((current) => {
        return {
          ...current,
          saksreferanse: modalSaksreferanse,
        };
      });
    }
  });

  const resetStateValues = () => {
    setModalUtbetaling({
      ...initialUtbetaling,
      utbetalingsreferanse: generateFilreferanseId(),
    });

    setKontonummerLabelPlaceholder("Kontonummer (Ikke satt)");
    setVisFeilmelding(false);
    setReferansefeltDisabled(false);
    dispatch(setAktivUtbetaling(null));
  };

  const sendUtbetaling = () => {
    let nyHendelse: Utbetaling = { ...modalUtbetaling };
    if (modalSaksreferanse) {
      nyHendelse = { ...nyHendelse, saksreferanse: modalSaksreferanse };
    }
    nyHendelse.hendelsestidspunkt = getNow();
    nyHendelse.kontonummer =
      modalUtbetaling.kontonummer && modalUtbetaling.kontonummer.length === 11
        ? modalUtbetaling.kontonummer
        : null;
    nyHendelse.forfallsdato = formatDateString(nyHendelse.forfallsdato);
    nyHendelse.utbetalingsdato = formatDateString(nyHendelse.utbetalingsdato);
    nyHendelse.fom = formatDateString(nyHendelse.fom);
    nyHendelse.tom = formatDateString(nyHendelse.tom);

    if (aktivUtbetaling == null) {
      sendNyHendelseOgOppdaterModel(
        nyHendelse,
        model,
        dispatch,
        nyUtbetaling(soknad.fiksDigisosId, nyHendelse),
      );
    } else {
      sendNyHendelseOgOppdaterModel(
        nyHendelse,
        model,
        dispatch,
        oppdaterUtbetaling(soknad.fiksDigisosId, nyHendelse),
      );
    }
    resetStateValues();

    dispatch(dispatch(skjulNyUtbetalingModal()));
  };

  const setDefaultUtbetaling = () => {
    setModalUtbetaling({
      ...defaultUtbetaling,
      utbetalingsreferanse: generateFilreferanseId(),
      saksreferanse: modalUtbetaling.saksreferanse,
    });

    if (soknad.saker.length > 0 && modalUtbetaling.saksreferanse == null) {
      setModalUtbetaling({
        ...defaultUtbetaling,
        saksreferanse: soknad.saker[0].referanse,
      });
    }

    setKontonummerLabelPlaceholder("Kontonummer");
    setVisFeilmelding(false);
    setReferansefeltDisabled(false);
  };

  return (
    <Modal
      className={globals.modal}
      open={visNyUtbetalingModal}
      onClose={() => {
        resetStateValues();
        props.dispatch(skjulNyUtbetalingModal());
      }}
      header={{ heading: "Utbetaling" }}
    >
      <Modal.Body className={`${globals.modal_gridContent} `}>
        <CustomTextField
          label={"Utbetalingsreferanse *"}
          value={modalUtbetaling.utbetalingsreferanse}
          setValue={(verdi: string) =>
            setModalUtbetaling({
              ...modalUtbetaling,
              utbetalingsreferanse: verdi,
            })
          }
          required={true}
          referansefeltDisabled={referansefeltDisabled}
          visFeilmelding={visFeilmelding}
          setVisFeilmelding={setVisFeilmelding}
        />
        <Select
          size="small"
          disabled={modalSaksreferanse != null}
          label="Saksreferanse"
          value={modalUtbetaling.saksreferanse ?? ""}
          onChange={(evt) =>
            setModalUtbetaling({
              ...modalUtbetaling,
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
        <CustomTextField
          label={"Beløp"}
          value={modalUtbetaling.belop}
          inputType={"number"}
          setValue={(verdi: number) =>
            setModalUtbetaling({ ...modalUtbetaling, belop: +verdi })
          }
        />
        <CustomTextField
          label={"Beskrivelse (Stønadstype)"}
          value={modalUtbetaling.beskrivelse}
          setValue={(verdi: string) =>
            setModalUtbetaling({
              ...modalUtbetaling,
              beskrivelse: verdi,
            })
          }
        />
        <div className={styles.datoGruppe}>
          <CustomDatePicker
            label={"Forfallsdato"}
            value={modalUtbetaling.forfallsdato}
            setValue={(verdi: string) =>
              setModalUtbetaling({
                ...modalUtbetaling,
                forfallsdato: verdi,
              })
            }
          />
          <CustomDatePicker
            label={"Utbetalingsdato"}
            value={modalUtbetaling.utbetalingsdato}
            setValue={(verdi: string) =>
              setModalUtbetaling({
                ...modalUtbetaling,
                utbetalingsdato: verdi,
              })
            }
          />
        </div>
        <div className={styles.datoGruppe}>
          <CustomDatePicker
            label={"fom"}
            value={modalUtbetaling.fom}
            setValue={(verdi: string) =>
              setModalUtbetaling({ ...modalUtbetaling, fom: verdi })
            }
          />
          <CustomDatePicker
            label={"tom"}
            value={modalUtbetaling.tom}
            setValue={(verdi: string) =>
              setModalUtbetaling({ ...modalUtbetaling, tom: verdi })
            }
          />
        </div>

        <Select
          label="Status"
          size="small"
          value={modalUtbetaling.status ?? ""}
          onChange={(evt) =>
            setModalUtbetaling({
              ...modalUtbetaling,
              status: evt.target.value as UtbetalingStatus,
            })
          }
        >
          <option hidden disabled value=""></option>
          <option value={UtbetalingStatus.PLANLAGT_UTBETALING}>
            Planlagt Utbetaling
          </option>
          <option value={UtbetalingStatus.UTBETALT}>Utbetalt</option>
          <option value={UtbetalingStatus.STOPPET}>Stoppet</option>
          <option value={UtbetalingStatus.ANNULLERT}>Annullert</option>
        </Select>
        <ToggleGroup
          size="small"
          label="Annen mottaker"
          className={styles.togglegroup}
          value={modalUtbetaling.annenMottaker ? "ja" : "nei"}
          onChange={(value) =>
            setModalUtbetaling({
              ...modalUtbetaling,
              annenMottaker: value === "ja",
            })
          }
        >
          <ToggleGroup.Item value="ja">Ja</ToggleGroup.Item>
          <ToggleGroup.Item value="nei">Nei</ToggleGroup.Item>
        </ToggleGroup>
        <CustomTextField
          label={"Mottaker"}
          value={modalUtbetaling.mottaker}
          setValue={(verdi: string) =>
            setModalUtbetaling({ ...modalUtbetaling, mottaker: verdi })
          }
        />
        <TextField
          size="small"
          label={kontonummerLabelPlaceholder}
          onChange={(evt) => {
            setModalUtbetaling({
              ...modalUtbetaling,
              kontonummer: evt.target.value,
            });
            if (evt.target.value.length === 11) {
              setKontonummerLabelPlaceholder("Kontonummer");
            } else {
              setKontonummerLabelPlaceholder("Kontonummer (Ikke satt)");
            }
          }}
          className={globals.textField}
          value={modalUtbetaling.kontonummer ?? ""}
          autoComplete="off"
        />
        <CustomTextField
          label={"Utbetalingsmetode"}
          value={modalUtbetaling.utbetalingsmetode}
          setValue={(verdi: string) =>
            setModalUtbetaling({
              ...modalUtbetaling,
              utbetalingsmetode: verdi,
            })
          }
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          size="small"
          variant={aktivUtbetaling == null ? "primary" : "secondary-neutral"}
          onClick={() => {
            if (!visFeilmelding) {
              sendUtbetaling();
            }
          }}
        >
          {aktivUtbetaling == null ? "Legg til utbetaling" : "Endre utbetaling"}
        </Button>
        {aktivUtbetaling == null && (
          <Button
            size="small"
            variant="secondary-neutral"
            onClick={setDefaultUtbetaling}
          >
            Fyll ut alle felter
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

const mapStateToProps = (state: AppState) => ({
  visNyUtbetalingModal: state.model.visNyUtbetalingModal,
  model: state.model,
  aktivUtbetaling: state.model.aktivUtbetaling,
  modalSaksreferanse: state.model.modalSaksreferanse,
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NyUtbetalingModal);
