import React, { SyntheticEvent } from "react";
import { RootState} from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import { Tag } from "@navikt/ds-react";
import styles from "./statusSnackBar.module.css";
import { CheckmarkIcon, XMarkOctagonIcon } from "@navikt/aksel-icons";
import useTimeout from "../../../utils/useTimeout";
import { SKJUL_SNACKBAR } from "../../../redux/reducer";

const variantIcon = {
  success: <CheckmarkIcon title="success" />,
  error: <XMarkOctagonIcon title="error" />,
};

const StatusSnackBarView = () => {
  const {visSnackbar, snackbarVariant} = useSelector((state: RootState) => ({
    visSnackbar: state.model.visSnackbar,
    snackbarVariant: state.model.snackbarVariant,
  }));
  const dispatch = useDispatch();
  function handleClose(event?: SyntheticEvent, reason?: string) {
    if (reason === "clickaway") {
      return;
    }

    dispatch(SKJUL_SNACKBAR());
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

export default StatusSnackBarView;
