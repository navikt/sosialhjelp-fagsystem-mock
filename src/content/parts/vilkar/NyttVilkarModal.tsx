import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  sendNyHendelseOgOppdaterModel,
} from "../../../redux/actions";
import { FsSoknad } from "../../../redux/types";
import {
  generateFilreferanseId,
  getAllUtbetalingsreferanser,
  getNow,
  getSakTittelFraSaksreferanse,
  getSakTittelOgNrFraUtbetalingsreferanse,
  getVilkarByVilkarreferanse,
} from "../../../utils/utilityFunctions";
import {
  HendelseType,
  Vilkar,
  VilkarStatus,
} from "../../../types/hendelseTypes";
import CustomTextField from "../../../components/customTextField";
import {
  Button,
  Modal,
  Select,
  Chips,
  Fieldset,
  BodyShort,
} from "@navikt/ds-react";
import globals from "../../../app/globals.module.css";
import {
  NYTT_VILKAR,
  OPPDATER_VILKAR,
  SET_AKTIVT_VILKAR, SKJUL_NY_VILKAR_MODAL
} from "../../../redux/reducer";
import { RootState } from "../../../store";

interface Props {
  soknad: FsSoknad;
}

const initialVilkar: Vilkar = {
  type: HendelseType.Vilkar,
  hendelsestidspunkt: "",
  vilkarreferanse: generateFilreferanseId(),
  utbetalingsreferanse: null,
  tittel: "",
  beskrivelse: null,
  status: null,
  saksreferanse: "",
};

const defaultVilkar: Vilkar = {
  type: HendelseType.Vilkar,
  hendelsestidspunkt: "",
  vilkarreferanse: generateFilreferanseId(),
  utbetalingsreferanse: [],
  tittel: "Betale husleie",
  beskrivelse: "Du må betale din husleie hver måned.",
  status: VilkarStatus.RELEVANT,
  saksreferanse: null,
};

const NyttVilkarModal: React.FC<Props> = ({ soknad }: Props) => {
  const { visNyVilkarModal, modalSaksreferanse, aktivtVilkar, model } =
    useSelector((state: RootState) => ({
      visNyVilkarModal: state.model.visNyVilkarModal,
      model: state.model,
      aktivtVilkar: state.model.aktivtVilkar,
      modalSaksreferanse: state.model.modalSaksreferanse,
    }));

  const dispatch = useDispatch();

  const [modalVilkar, setModalVilkar] = useState<Vilkar>(initialVilkar);

  const [visFeilmelding, setVisFeilmelding] = useState(false);
  const [referansefeltDisabled, setReferansefeltDisabled] =
    useState(!!aktivtVilkar);

  function resetStateValues() {
    setModalVilkar({
      ...initialVilkar,
      vilkarreferanse: generateFilreferanseId(),
    });
    setVisFeilmelding(false);
    setReferansefeltDisabled(false);

    dispatch(SET_AKTIVT_VILKAR(null));
  }

  const sendVilkar = () => {
    const nyHendelse: Vilkar = { ...modalVilkar };
    nyHendelse.hendelsestidspunkt = getNow();

    if (aktivtVilkar == null) {
      sendNyHendelseOgOppdaterModel(
        nyHendelse,
        model,
        dispatch,
        NYTT_VILKAR({
          forFiksDigisosId: soknad.fiksDigisosId,
          nyttVilkar: nyHendelse,
        }),
      );
    } else {
      sendNyHendelseOgOppdaterModel(
        nyHendelse,
        model,
        dispatch,
        OPPDATER_VILKAR({
          forFiksDigisosId: soknad.fiksDigisosId,
          oppdatertVilkar: nyHendelse,
        }),
      );
    }
    dispatch(SKJUL_NY_VILKAR_MODAL());

    setTimeout(() => {
      resetStateValues();
    }, 500);
  };

  const setDefaultVilkar = () => {
    setModalVilkar({
      ...defaultVilkar,
      vilkarreferanse: generateFilreferanseId(),
    });

    const alleUtbetalingsreferanser = getAllUtbetalingsreferanser(soknad);
    if (alleUtbetalingsreferanser.length > 0) {
      setModalVilkar({
        ...defaultVilkar,
        vilkarreferanse: generateFilreferanseId(),
        utbetalingsreferanse: [alleUtbetalingsreferanser[0]],
      });
    }

    setVisFeilmelding(false);
    setReferansefeltDisabled(false);
  };

  useEffect(() => {
    if (aktivtVilkar && visNyVilkarModal) {
      const vilkar = getVilkarByVilkarreferanse(soknad.vilkar, aktivtVilkar);
      if (vilkar) {
        setModalVilkar(vilkar);

        setTimeout(() => {
          setReferansefeltDisabled(true);
        }, 10);
      }
    }
  }, [aktivtVilkar, visNyVilkarModal, soknad.vilkar]);

  const onChipToggled = (value: string) => {
    const selected = modalVilkar?.utbetalingsreferanse ?? [];
    setModalVilkar({
      ...modalVilkar,
      utbetalingsreferanse: selected?.includes(value)
        ? selected.filter((x) => x !== value)
        : [...selected, value],
    });
  };

  const utbetalingsReferanser = getAllUtbetalingsreferanser(soknad);

  return (
    <Modal
      className={globals.modal}
      open={visNyVilkarModal}
      onClose={() => {
        dispatch(SKJUL_NY_VILKAR_MODAL());
        resetStateValues();
      }}
      header={{ heading: !!aktivtVilkar ? "Endre vilkår" : "Nytt vilkår" }}
    >
      <Modal.Body className={globals.modal_gridContent}>
        <>
          <CustomTextField
            label={"Vilkårreferanse *"}
            value={modalVilkar.vilkarreferanse}
            setValue={(verdi: string) =>
              setModalVilkar({ ...modalVilkar, vilkarreferanse: verdi })
            }
            required={true}
            referansefeltDisabled={referansefeltDisabled}
            visFeilmelding={visFeilmelding}
            setVisFeilmelding={setVisFeilmelding}
          />
          <CustomTextField
            label={"Tittel"}
            value={modalVilkar.tittel}
            setValue={(verdi: string) =>
              setModalVilkar({ ...modalVilkar, tittel: verdi })
            }
          />
          <CustomTextField
            label={"Beskrivelse"}
            value={modalVilkar.beskrivelse}
            setValue={(verdi: string) =>
              setModalVilkar({ ...modalVilkar, beskrivelse: verdi })
            }
          />
          <Select
            size="small"
            label="Status"
            value={modalVilkar.status ? modalVilkar.status : ""}
            onChange={(evt) =>
              setModalVilkar({
                ...modalVilkar,
                status: evt.target.value as VilkarStatus,
              })
            }
          >
            <option value={VilkarStatus.RELEVANT}>Relevant</option>
            <option value={VilkarStatus.ANNULLERT}>Annullert</option>
            <option value={VilkarStatus.OPPFYLT}>Oppfylt</option>
            <option value={VilkarStatus.IKKE_OPPFYLT}>Ikke oppfylt</option>
          </Select>
          <Select
            size="small"
            disabled={modalSaksreferanse != null}
            label="Saksreferanse"
            value={modalVilkar.saksreferanse ? modalVilkar.saksreferanse : ""}
            onChange={(evt) =>
              setModalVilkar({
                ...modalVilkar,
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
        </>
        <div className={globals.fullWidthItem}>
          <Fieldset
            legend="Utbetalingsreferanser"
            description={
              utbetalingsReferanser.length > 0 && "Velg ønskede utbetalinger"
            }
          >
            {utbetalingsReferanser.length > 0 ? (
              <Chips id="utbetreferanser">
                {getAllUtbetalingsreferanser(soknad).map((value) => {
                  return (
                    <Chips.Toggle
                      key={value}
                      className={globals.chip}
                      onClick={() => onChipToggled(value)}
                      selected={modalVilkar?.utbetalingsreferanse?.includes(
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
            ) : (
              <BodyShort>Søknaden har ingen utbetalinger</BodyShort>
            )}
          </Fieldset>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          size="small"
          variant={aktivtVilkar == null ? "primary" : "secondary-neutral"}
          onClick={() => {
            if (!visFeilmelding) {
              sendVilkar();
            }
          }}
        >
          {aktivtVilkar == null ? "Legg til vilkår" : "Endre vilkår"}
        </Button>
        {aktivtVilkar == null && (
          <Button
            size="small"
            variant="secondary-neutral"
            onClick={() => {
              setDefaultVilkar();
            }}
          >
            Fyll ut alle felter
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default NyttVilkarModal;
