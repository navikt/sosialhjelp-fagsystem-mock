import React from "react";
import { AppState, DispatchProps } from "../../../redux/reduxTypes";
import { connect } from "react-redux";
import { HendelseType, TildeltNavKontor } from "../../../types/hendelseTypes";
import { getNow } from "../../../utils/utilityFunctions";
import {
  sendNyHendelseOgOppdaterModel,
  oppdaterNavKontor,
  sendValgbareNavkontorTilMockBackend,
} from "../../../redux/actions";
import { FsSoknad, Model } from "../../../redux/types";
import { Select } from "@navikt/ds-react";
import { NavKontor } from "../../../types/additionalTypes";
interface OwnProps {
  soknad: FsSoknad;
}

interface StoreProps {
  model: Model;
}

type Props = DispatchProps & OwnProps & StoreProps;

const TildeldeltNavkontorView: React.FC<Props> = (props: Props) => {
  const { dispatch, soknad, model } = props;

  const navKontor0: NavKontor = {
    id: "1208",
    name: "NAV Årstad",
  };
  const navKontor1: NavKontor = {
    id: "1209",
    name: "NAV Bergenhus",
  };
  const navKontor2: NavKontor = {
    id: "1210",
    name: "NAV Ytrebygda",
  };
  const navKontorListe = [navKontor0, navKontor1, navKontor2];

  const getNavkontorFromId = (id: string | null) => {
    if (id == null) {
      return "";
    }
    const navKontoret = navKontorListe.filter(
      (navkontor) => navkontor.id === id,
    );
    if (navKontoret.length === 0) {
      return "";
    } else {
      return navKontoret[0].id;
    }
  };

  const menuItems = navKontorListe.map((navKontor: NavKontor) => {
    return (
      <option key={"navKontorItem: " + navKontor.id} value={navKontor.id}>
        {navKontor.name}
      </option>
    );
  });

  return (
    <Select
      label="Tildel navkontor:"
      value={getNavkontorFromId(
        soknad.navKontor ? soknad.navKontor.navKontor : "",
      )}
      onChange={(evt) => {
        let navKontorEnhetsNr = evt.target.value as string;

        if (navKontorEnhetsNr === "") {
          return;
        }

        const nyHendelse: TildeltNavKontor = {
          type: HendelseType.TildeltNavKontor,
          hendelsestidspunkt: getNow(),
          navKontor: navKontorEnhetsNr.toString(),
        };

        sendValgbareNavkontorTilMockBackend(navKontorListe, model, dispatch);

        sendNyHendelseOgOppdaterModel(
          nyHendelse,
          model,
          dispatch,
          oppdaterNavKontor(soknad.fiksDigisosId, nyHendelse),
        );
      }}
    >
      <option hidden disabled value=""></option>
      {menuItems}
    </Select>
  );
};

const mapStateToProps = (state: AppState) => ({
  model: state.model,
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    dispatch,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TildeldeltNavkontorView);
