import React, {Dispatch, SetStateAction} from "react";
import TextField from "@material-ui/core/TextField";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles, Theme} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        textField: {
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(2),
            width:'95%',
        },
    }),
);

interface OwnProps {
    label: string;
    value: any;
    setValue: (v: any) => any;
    inputType?: string;
    required?: boolean;
    visFeilmelding?: boolean;
    setVisFeilmelding?: Dispatch<SetStateAction<boolean>>;
    referansefeltDisabled?: boolean;
    id?: string;
}

type Props = OwnProps;

const CustomTextField: React.FC<Props> = (props: Props) => {

    const classes = useStyles();
    const {label, value, setValue, inputType, required, visFeilmelding, setVisFeilmelding, referansefeltDisabled, id} = props;

    return <TextField
        disabled={required && referansefeltDisabled}
        id={id ? id : "outlined-name"}
        label={label}
        className={classes.textField}
        value={value ? value : ''}
        type={inputType}
        required={required}
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
        InputLabelProps={{
            shrink: true,
        }}
        margin="normal"
        variant="filled"
        autoComplete="off"
    />
};

export default CustomTextField;
