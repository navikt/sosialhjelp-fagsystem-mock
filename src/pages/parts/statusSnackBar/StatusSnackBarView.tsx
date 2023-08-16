import React, { SyntheticEvent } from "react";
import { AppState, DispatchProps } from "../../../redux/reduxTypes";
import { Model } from "../../../redux/types";
import { connect } from "react-redux";
import { skjulSnackbar } from "../../../redux/actions";
import { Tag } from "@navikt/ds-react";
import styles from "./statusSnackBar.module.css";
import { CheckmarkIcon, XMarkOctagonIcon } from "@navikt/aksel-icons";
import useTimeout from "../../../utils/useTimeout";
interface StoreProps {
  visSnackbar: boolean;
  snackbarVariant: "success" | "error";
  model: Model;
}

type Props = DispatchProps & StoreProps;

const variantIcon = {
  success: <CheckmarkIcon title="success" />,
  error: <XMarkOctagonIcon title="error" />,
};

const StatusSnackBarView: React.FC<Props> = (props: Props) => {
  const { visSnackbar, snackbarVariant, dispatch } = props;

  function handleClose(event?: SyntheticEvent, reason?: string) {
    if (reason === "clickaway") {
      return;
    }

    dispatch(skjulSnackbar());
  }

  useTimeout(handleClose, 2000, visSnackbar);
  return visSnackbar ? (
    <>
      <Tag
        aria-describedby="client-snackbar"
        variant={snackbarVariant}
        className={styles.toast}
        size="medium"
      >
        {variantIcon[snackbarVariant]}
        {snackbarVariant === "error"
          ? "Noe gikk galt i kall mot server"
          : "En hendelse er registrert i innsyn"}
      </Tag>
    </>
  ) : null;
};

const mapStateToProps = (state: AppState) => ({
  visSnackbar: state.model.visSnackbar,
  snackbarVariant: state.model.snackbarVariant,
  model: state.model,
});

const mapDispatchToProps = (dispatch: any) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StatusSnackBarView);
