import React, { Dispatch, SetStateAction } from "react";
import { TextField } from "@navikt/ds-react";

interface OwnProps {
  label: string;
  value: any;
  setValue: (v: any) => any;
  inputType?: string;
  required?: boolean;
  visFeilmelding?: boolean;
  setVisFeilmelding?: Dispatch<SetStateAction<boolean>>;
  referansefeltDisabled?: boolean;
}

type Props = OwnProps;

const CustomTextField: React.FC<Props> = (props: Props) => {
  const {
    label,
    value,
    setValue,
    required,
    visFeilmelding,
    setVisFeilmelding,
    referansefeltDisabled,
  } = props;

  return (
    <TextField
      size="small"
      disabled={required && referansefeltDisabled}
      label={label}
      value={value ?? ""}
      error={required && visFeilmelding}
      onChange={(evt) => {
        setValue(evt.target.value);
        if (required) {
          if (evt.target.value.length === 0) {
            if (setVisFeilmelding) setVisFeilmelding(true);
          } else {
            if (setVisFeilmelding) setVisFeilmelding(false);
          }
        }
      }}
      autoComplete="off"
    />
  );
};

export default CustomTextField;
