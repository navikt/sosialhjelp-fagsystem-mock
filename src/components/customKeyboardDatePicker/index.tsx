import DateFnsUtils from "@date-io/date-fns";
import {KeyboardDatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import React, {Dispatch, SetStateAction} from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles, Theme} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        datePickerField: {
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(2),
        },
    }),
);

interface OwnProps {
    label: string;
    value: any;
    setValue: (v: string) => any;
    isOpen: boolean;
    setIsOpen: any;
    required?: boolean;
    visFeilmelding?: boolean;
    setVisFeilmelding?: Dispatch<SetStateAction<boolean>>;
    id?: string;
}

type Props = OwnProps;

const CustomKeyboardDatePicker: React.FC<Props> = (props: Props) => {
    const classes = useStyles();
    const {label, value, setValue, isOpen, setIsOpen, required, visFeilmelding, setVisFeilmelding, id} = props;

    return <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
            className={classes.datePickerField}
            disableToolbar
            required={required}
            error={visFeilmelding}
            variant="inline"
            format="yyyy-MM-dd"
            margin="normal"
            id={id ? id : label}
            label={label}
            open={isOpen}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
            value={value}
            onChange={(date: any) => {
                setValue(date);
                setIsOpen(false);
                if (setVisFeilmelding) setVisFeilmelding(false);
            }}
            InputLabelProps={{
                shrink: true,
            }}
            KeyboardButtonProps={{
                'aria-label': 'change date',
            }}
        />
    </MuiPickersUtilsProvider>
};

export default CustomKeyboardDatePicker;
