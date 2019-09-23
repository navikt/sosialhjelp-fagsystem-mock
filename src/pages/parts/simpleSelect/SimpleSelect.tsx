import React, {useRef, useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import {FormControl, Theme} from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import {createStyles} from "@material-ui/styles";
import makeStyles from "@material-ui/core/styles/makeStyles";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
        },
        selectEmpty: {
            marginTop: theme.spacing(2),
        },
    }),
);

export interface SelectValue {
    value: string;
    label: string;
}

interface OwnProps {
    label: string;
    values: SelectValue[];
    selected: string;
    onSelect: (value: string) => void;
}

interface StoreProps {
}

interface State {
    age: string;
    name: string;
}

const initialState: State = {
    age: '',
    name: 'hai',
};

type Props = DispatchProps & OwnProps & StoreProps;


const SimpleSelect: React.FC<Props> = (props: Props) => {
    // const [values, setValues] = useState(initialState);
    const classes = useStyles();
    const {onSelect, label, selected, values} = props;

    const [labelWidth, setLabelWidth] = React.useState(0);
    const inputLabel = React.useRef<HTMLLabelElement>(null);
    React.useEffect(() => {
        setLabelWidth(inputLabel.current!.offsetWidth);
    }, []);

    const menuItems = values.map((value) => {
       return (
           <MenuItem value={value.value}>{value.label}</MenuItem>
       )
    });


    return (
        <div>
            <FormControl variant="outlined" className={classes.formControl}>
                <InputLabel ref={inputLabel} htmlFor="outlined-age-simple">
                    {label}
                </InputLabel>
                <Select
                    value={selected}
                    onChange={(evt) => {
                        if (evt && typeof evt.target.value === 'string'){
                            onSelect(evt.target.value)
                        }
                    }}
                    labelWidth={labelWidth}
                    inputProps={{
                        name: {label},
                    }}
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    { menuItems }
                </Select>
            </FormControl>
        </div>
    );
};

const mapStateToProps = (state: AppState) => ({
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SimpleSelect);
