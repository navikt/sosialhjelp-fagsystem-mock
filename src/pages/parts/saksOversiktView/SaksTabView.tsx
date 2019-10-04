import React, {useState} from 'react';
import {AppState, DispatchProps} from "../../../redux/reduxTypes";
import {connect} from "react-redux";
import Typography from "@material-ui/core/Typography";
import {SaksStatus, SaksStatusType} from "../../../types/hendelseTypes";
import FormControl from "@material-ui/core/FormControl";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Box from "@material-ui/core/Box";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles} from "@material-ui/core";
import SimpleSelect from "../simpleSelect/SimpleSelect";
import {settNySaksStatus} from "../../../redux/v2/v2Actions";
import {V2Model} from "../../../redux/v2/v2Types";
import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import {aiuuur, oppdaterFsSaksStatus} from "../../../redux/v3/v3Actions";
import {OppdaterFsSaksStatus, V3State} from "../../../redux/v3/v3Types";
import {getFsSoknadByFiksDigisosId} from "../../../utils/utilityFunctions";
import {FsSoknad} from "../../../redux/v3/v3FsTypes";

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: theme.spacing(2)
        },
        paper: {
            padding: theme.spacing(2,2),
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center'
        },
        paper2: {
            padding: theme.spacing(2,2),
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            marginLeft: theme.spacing(2)
        },
        box: {
            marginTop: theme.spacing(1),
            padding: theme.spacing(1),
        },
        formControl: {
            margin: theme.spacing(3)
        },
        addbox: {
            margin: theme.spacing(2, 0, 2, 0),
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            color: 'inherit'

        },
        fab: {
            marginRight: theme.spacing(1),
            color: 'inherit'
        },
        horizontalWrapper: {
            display: 'flex',
            flexDirection: 'column'
        },
        horizontalBox: {
            // display: 'inline-block'
        }
    });
});

interface OwnProps {
    idx: number,
    sak: SaksStatus
}

interface StoreProps {
    v2: V2Model,
    v3: V3State
}

interface State {
    input: string;
}

const initialState: string = 'Ny tittel på sak';

type Props = DispatchProps & OwnProps & StoreProps;


const SaksTabView: React.FC<Props> = (props: Props) => {
    const [tittel, setTittel] = useState(initialState);
    const {sak, dispatch, v2, v3}  = props;
    const classes = useStyles();


    return (
        <div>

            <br/>
            <br/>

            <Input value={tittel} onChange={(evt) => setTittel(evt.target.value)} />
            <Button onClick={() => {

                const fsSoknader = v3.soknader;
                if (fsSoknader){
                    const fsSoknad: FsSoknad | undefined = getFsSoknadByFiksDigisosId(fsSoknader, v2.aktivSoknad);
                    if (fsSoknad && tittel.length > 0){
                        dispatch(
                            aiuuur(
                                v2.aktivSoknad,
                                fsSoknad.fiksDigisosSokerJson,
                                v2,
                                oppdaterFsSaksStatus(
                                    v2.aktivSoknad,
                                    sak.referanse,
                                    tittel,
                                    sak.status
                                )
                            )
                        )
                    }
                }
            } }>Oppdater tittel</Button>

            <br/>
            <br/>


            <Box className={classes.box}>
                <SimpleSelect
                    onSelect={(value) => {
                        if (value === SaksStatusType.UNDER_BEHANDLING
                            || value === SaksStatusType.BEHANDLES_IKKE
                            || value === SaksStatusType.FEILREGISTRERT
                            || value === SaksStatusType.IKKE_INNSYN
                        ) {

                            const fsSoknader = v3.soknader;
                            if (fsSoknader){
                                const fsSoknad: FsSoknad | undefined = getFsSoknadByFiksDigisosId(fsSoknader, v2.aktivSoknad);
                                if (fsSoknad && tittel.length > 0){
                                    dispatch(
                                        aiuuur(
                                            v2.aktivSoknad,
                                            fsSoknad.fiksDigisosSokerJson,
                                            v2,
                                            oppdaterFsSaksStatus(
                                                v2.aktivSoknad,
                                                sak.referanse,
                                                sak.tittel,
                                                value
                                            )
                                        )
                                    )
                                }
                            }
                        }
                    }}
                    label={'Saksstatus'}
                    selected={sak.status}
                    values={[
                        {value: SaksStatusType.UNDER_BEHANDLING, label: "Under behandling"},
                        {value: SaksStatusType.IKKE_INNSYN, label: "Ikke innsyn"},
                        {value: SaksStatusType.FEILREGISTRERT, label: "Feilregistrert"},
                        {value: SaksStatusType.BEHANDLES_IKKE, label: "Behandles ikke"}
                    ]}
                />
            </Box>


            <br/>
            <Typography>Vilkår</Typography>
            <br/>
            <Typography>Dokumentasjonskrav</Typography>
            <br/>
            <Typography>Utbetalinger</Typography>
            <br/>
            <Typography>Vedtak</Typography>
            <br/>
            <Typography>Rammevedtak</Typography>
            <br/>
        </div>
    );
};

const mapStateToProps = (state: AppState) => ({
    v2: state.v2,
    v3: state.v3,
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SaksTabView);
