import React, { Dispatch, SetStateAction } from "react";
import { DatePicker, useDatepicker } from "@navikt/ds-react";
import dayjs from "dayjs";
import styles from "./datepicker.module.css";

interface OwnProps {
  label: string;
  value: any;
  setValue: (v: string) => any;
  required?: boolean;
  visFeilmelding?: boolean;
  setVisFeilmelding?: Dispatch<SetStateAction<boolean>>;
}

type Props = OwnProps;

export const dateToString = (dato?: Date) => {
  // String sendt til backend på format YYYY-MM-DD
  return dato ? dayjs(dato).format("YYYY-MM-DD") : "";
};
const CustomDatePicker: React.FC<Props> = (props: Props) => {
  const {
    label,
    value,
    setValue,
    required,
    visFeilmelding,
    setVisFeilmelding,
  } = props;
  const { datepickerProps, inputProps } = useDatepicker({
    onDateChange: (date?: Date) => {
      setValue(dateToString(date));
    },
    inputFormat: "yyyy-MM-dd",
    onValidate: (val) => {
      if (setVisFeilmelding) setVisFeilmelding(!val.isValidDate);
    },
  });

  return (
    <div className={styles.datewrapper}>
      <DatePicker {...datepickerProps} strategy="fixed">
        <DatePicker.Input
          {...inputProps}
          size="small"
          error={visFeilmelding}
          label={label}
          value={value ?? ""}
        />
      </DatePicker>
    </div>
  );
};

export default CustomDatePicker;
