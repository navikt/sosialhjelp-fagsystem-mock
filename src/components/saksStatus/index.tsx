import * as React from 'react';
import {Panel} from "nav-frontend-paneler";
import Hendelse, {HendelseType, saksStatus, SaksStatus} from "../../types/hendelseTypes";
import {Input, RadioPanelGruppe} from "nav-frontend-skjema";
import {connect} from "react-redux";
import {AppState} from "../../redux/reduxTypes";
import {getNow} from "../../utils/utilityFunctions";


interface OwnProps {
    onClick: (nySaksStatus: saksStatus) => void;
}

interface StateProps {
    hendelser: Hendelse[]
}

type Props = OwnProps & StateProps;

interface saksStatusExtended {
    referanse: string;
    tittel: string;
    status: SaksStatus | undefined;
}

const initialNySaksStatusExtended: saksStatusExtended = {
    referanse: '',
    tittel: '',
    status: undefined
};

interface Validering {
    isValid: boolean;
    errorMessage: string;
}

interface saksStatusValidation {
    isValid: boolean;
    referanse: Validering;
    tittel: Validering;
    status: Validering;
}

interface State {
    isOpen: boolean,
    nySaksStatus: saksStatusExtended,
    nySaksStatusValidation: saksStatusValidation,
    visFeilmeldinger: boolean
}

const initialSaksStatusValidation: saksStatusValidation = {
    isValid: true,
    referanse: {isValid: true, errorMessage: "Referanse til sak må være unik"},
    tittel: {isValid: true, errorMessage: "Tittel kan ikke være tom"},
    status: {isValid: true, errorMessage: "Du må sette status på saken"}
};

class OpprettNySaksStatus extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isOpen: false,
            nySaksStatus: {...initialNySaksStatusExtended},
            nySaksStatusValidation: JSON.parse(JSON.stringify(initialSaksStatusValidation)),
            visFeilmeldinger: false
        }
    }

    handleCreateSaksStatus() {
        const {nySaksStatus} = this.state;
        const validation: saksStatusValidation = validateSaksStatus(this.state.nySaksStatus, this.props.hendelser);


        console.warn("Opprett !");
        if (validation.isValid &&
            nySaksStatus.status
        ) {
            const saksStatus: saksStatus = {
                type: HendelseType.saksStatus,
                hendelsestidspunkt: getNow(),
                referanse: nySaksStatus.referanse,
                tittel: nySaksStatus.tittel,
                status: nySaksStatus.status
            };
            this.props.onClick(saksStatus);
        }
        this.setState({nySaksStatusValidation: validation, visFeilmeldinger: true});
    }

    render() {

        const {isOpen, nySaksStatus} = this.state;

        const introPanel: () => JSX.Element = () => {
            const {isOpen} = this.state;
            return (
                <div>
                    {isOpen &&
                    <>
                        <button className={"btn btn-primary"} onClick={() => {
                            this.handleCreateSaksStatus();
                        }}>
                            <div>Opprett <span className="glyphicon glyphicon-ok" aria-hidden="true"/></div>
                        </button>
                        <button onClick={() => this.setState({
                            isOpen: !isOpen,
                            nySaksStatus: {...initialNySaksStatusExtended},
                            nySaksStatusValidation: initialSaksStatusValidation
                        })}
                                className={"btn btn-danger"}
                        >
                            <div>Avbryt <span className="glyphicon glyphicon-trash" aria-hidden="true"/></div>
                        </button>
                    </>
                    }
                    {!isOpen &&
                    <button
                        onClick={() => this.setState({isOpen: !isOpen, nySaksStatus: {...initialNySaksStatusExtended}})}
                        className={"btn btn-primary"}>
                        <div>Opprett sak <span className="glyphicon glyphicon-plus" aria-hidden="true"/></div>
                    </button>
                    }
                </div>
            )
        };

        const nySaksStatusPanel: () => JSX.Element = () => {
            const {visFeilmeldinger} = this.state;
            const val = this.state.nySaksStatusValidation;
            return (
                <>
                    Spesifiser ny sak:
                    <div>
                        <Input
                            feil={visFeilmeldinger && !val.tittel.isValid ? {feilmelding: val.tittel.errorMessage} : undefined}
                            label={"Tittel"}
                            value={nySaksStatus.tittel}
                            onChange={(evt) => {
                                const nySaksStatusUpdated = {...this.state.nySaksStatus};
                                nySaksStatusUpdated.tittel = evt.target.value;
                                const val: saksStatusValidation = validateSaksStatus(nySaksStatusUpdated, this.props.hendelser);
                                console.warn(JSON.stringify(val, null, 4));
                                this.setState({nySaksStatus: nySaksStatusUpdated, nySaksStatusValidation: val});
                            }}
                        />
                        <Input
                            feil={visFeilmeldinger && !val.referanse.isValid ? {feilmelding: val.referanse.errorMessage} : undefined}
                            label={"Referanse"} value={nySaksStatus.referanse}
                            onChange={(evt) => {
                                const nySaksStatusUpdated = {...this.state.nySaksStatus};
                                nySaksStatusUpdated.referanse = evt.target.value;
                                const val: saksStatusValidation = validateSaksStatus(nySaksStatusUpdated, this.props.hendelser);
                                this.setState({nySaksStatus: nySaksStatusUpdated, nySaksStatusValidation: val});
                            }}
                        />
                        <RadioPanelGruppe
                            feil={visFeilmeldinger && !val.status.isValid ? {feilmelding: val.status.errorMessage} : undefined}
                            name="saksStatus"
                            legend="Status på sak"
                            radios={[
                                {label: 'Under behandling', value: SaksStatus.UNDER_BEHANDLING},
                                {label: 'Ikke innsyn', value: SaksStatus.IKKE_INNSYN},
                                {label: 'Behandler ikke', value: SaksStatus.BEHANDLES_IKKE},
                                {label: 'Feilregistrert', value: SaksStatus.FEILREGISTRERT}
                            ]}
                            checked={nySaksStatus.status}
                            onChange={(evt, value) => {
                                const nySaksStatusUpdated = {...nySaksStatus};
                                switch (value) {
                                    case "UNDER_BEHANDLING": {
                                        nySaksStatusUpdated.status = SaksStatus.UNDER_BEHANDLING;
                                        break;
                                    }
                                    case "IKKE_INNSYN": {
                                        nySaksStatusUpdated.status = SaksStatus.IKKE_INNSYN;
                                        break;
                                    }
                                    case "BEHANDLES_IKKE": {
                                        nySaksStatusUpdated.status = SaksStatus.BEHANDLES_IKKE;
                                        break;
                                    }
                                    case "FEILREGISTRERT": {
                                        nySaksStatusUpdated.status = SaksStatus.FEILREGISTRERT;
                                        break;
                                    }
                                }
                                const val: saksStatusValidation = validateSaksStatus(nySaksStatusUpdated, this.props.hendelser);
                                this.setState({nySaksStatus: nySaksStatusUpdated, nySaksStatusValidation: val})
                            }}
                        />

                    </div>
                </>
            )
        };

        return (
            <div>
                Opprett ny sak
                <Panel>
                    <div>
                        Her kan en sak opprettes.
                        Saken får en status, og vil senere resultere i et vedtak.
                    </div>
                    {isOpen && nySaksStatusPanel()}
                    {introPanel()}
                    {/*<ReactJson src={this.state.nySaksStatusValidation}/>*/}
                </Panel>
            </div>
        )
    }
}

const validateSaksStatus = (sak: saksStatusExtended, hendelser: Hendelse[]): saksStatusValidation => {
    const v: saksStatusValidation = JSON.parse(JSON.stringify(initialSaksStatusValidation));
    const s = {...sak};
    if (s.tittel.length === 0) {
        v.isValid = false;
        v.tittel.isValid = false;
    }
    if (s.referanse.length === 0) {
        v.isValid = false;
        v.referanse.isValid = false;
        v.referanse.errorMessage = "Saksreferanse kan ikke være tom."
    } else if (referanseAlreadyExists(s.referanse, hendelser)) {
        v.isValid = false;
        v.referanse.isValid = false;
        v.referanse.errorMessage = "Referansen er allerede brukt. Velg en unik referanse."
    }
    if (s.status === undefined) {
        v.isValid = false;
        v.status.isValid = false;
    }
    return v;
};

const referanseAlreadyExists = (ref: string, hendelser: Hendelse[]) => {
    const r: Hendelse | undefined = hendelser.find(h => {
        if (h.type === HendelseType.saksStatus) {
            return h.referanse === ref;
        }
        return false;
    });
    return !!r;
};

const mapStateToProps = (state: AppState) => ({
    hendelser: state.v2.fiksDigisosSokerJson.sak.soker.hendelser,
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(OpprettNySaksStatus);