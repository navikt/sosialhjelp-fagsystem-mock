import * as React from 'react';
import {Panel} from "nav-frontend-paneler";
import {HendelseType, saksStatus, SaksStatus} from "../../types/hendelseTypes";
import {getNow} from "../../utils/utilityFunctions";
import {Input, RadioPanelGruppe} from "nav-frontend-skjema";


const saksStatusTemplate: saksStatus = {
    type: HendelseType.saksStatus,
    hendelsestidspunkt: getNow(),
    status: SaksStatus.UNDER_BEHANDLING,
    referanse: "SAK1",
    tittel: "Nødhjelp"
};

interface Props {
    onClick: (nySaksStatus: saksStatus) => void;
}

interface State {
    isOpen: boolean,
    nySaksStatus: saksStatus
}

class OpprettNySaksStatus extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isOpen: false,
            nySaksStatus: {...saksStatusTemplate}
        }
    }

    render(){

        const {isOpen, nySaksStatus} = this.state;

        const introPanel: () => JSX.Element =() => {
            const {isOpen} = this.state;
            return (
                <div>
                    { isOpen &&
                        <>
                            <button className={"btn btn-primary"} onClick={() => {
                                this.props.onClick(this.state.nySaksStatus)
                                // this.setState({isOpen: false, nySaksStatus: {...saksStatusTemplate}})
                            }}>
                                <div>Opprett <span className="glyphicon glyphicon-ok" aria-hidden="true"/></div>
                            </button>
                            <button onClick={() => this.setState({isOpen: !isOpen, nySaksStatus: {...saksStatusTemplate}})}
                                    className={"btn btn-danger"}><div>Avbryt <span className="glyphicon glyphicon-trash" aria-hidden="true"/></div>
                            </button>
                        </>
                    }
                    { !isOpen &&
                        <button onClick={() => this.setState({isOpen: !isOpen, nySaksStatus: {...saksStatusTemplate}})}
                                className={"btn btn-primary"}><div>Opprett sak <span className="glyphicon glyphicon-plus" aria-hidden="true"/></div>
                        </button>
                    }
                </div>
            )
        };

        const nySaksStatusPanel: () => JSX.Element = () => {

            return (
                <>
                    Spesifiser ny sak:
                    <div>
                        <Input label={"Tittel"} value={nySaksStatus.tittel} onChange={(evt) => {
                            nySaksStatus.tittel = evt.target.value;
                            this.setState({nySaksStatus: nySaksStatus});
                        }}/>
                        <Input label={"Referanse"} value={nySaksStatus.referanse} onChange={(evt) => {
                            nySaksStatus.referanse = evt.target.value;
                            this.setState({nySaksStatus: nySaksStatus});
                        }}/>
                        <RadioPanelGruppe
                            name="saksStatus"
                            legend="Status på sak"
                            radios={[
                                { label: 'Under behandling', value: SaksStatus.UNDER_BEHANDLING },
                                { label: 'Ikke innsyn', value: SaksStatus.IKKE_INNSYN },
                                { label: 'Behandler ikke', value: SaksStatus.BEHANDLES_IKKE },
                                { label: 'Feilregistrert', value: SaksStatus.FEILREGISTRERT}
                            ]}
                            checked={nySaksStatus.status}
                            onChange={(evt, value) => {
                                switch (value) {
                                    case "UNDER_BEHANDLING": {nySaksStatus.status = SaksStatus.UNDER_BEHANDLING; this.setState({nySaksStatus: nySaksStatus}); break;}
                                    case "IKKE_INNSYN": {nySaksStatus.status = SaksStatus.IKKE_INNSYN; this.setState({nySaksStatus: nySaksStatus}); break;}
                                    case "BEHANDLES_IKKE": {nySaksStatus.status = SaksStatus.BEHANDLES_IKKE; this.setState({nySaksStatus: nySaksStatus}); break;}
                                    case "FEILREGISTRERT": {nySaksStatus.status = SaksStatus.FEILREGISTRERT; this.setState({nySaksStatus: nySaksStatus}); break;}
                                }
                            }}
                        />

                    </div>
                </>
            )
        };

        return(
            <div>
                Opprett ny sak
                <Panel>
                    <div>
                        Her kan en sak opprettes.
                        Saken får en status, og vil senere resultere i et vedtak.
                    </div>
                    { isOpen && nySaksStatusPanel()}
                    {introPanel()}
                </Panel>
            </div>
        )
    }
}

export default OpprettNySaksStatus;