import React from 'react';
import {Panel} from "nav-frontend-paneler";
import {Input, RadioPanelGruppe} from "nav-frontend-skjema";
import {Knapp} from "nav-frontend-knapper";
import {AppState, DispatchProps} from "../redux/reduxTypes";
import {connect} from "react-redux";
import {setAppName} from "../redux/example/exampleActions";
import Lesmerpanel from "nav-frontend-lesmerpanel";
import {V2Model} from "../redux/v2/v2Types";
import NavFrontendSpinner from "nav-frontend-spinner";
import Modal from 'nav-frontend-modal';
import {
    disableSetFiksDigisosId,
    enableSetFiksDigisosId,
    sendFiksDigisosSokerJson,
    setfiksDigisosId
} from "../redux/v2/v2Actions";
import ReactJson from "react-json-view";
import Hendelse, {FiksDigisosSokerJson, HendelseType, SoknadsStatus} from "../types/hendelseTypes";
import {getLastHendelseOfType, getNow} from "../utils/utilityFunctions";


interface V2Props {
    v2: V2Model
    hendelserUpdated: Hendelse[]
}

interface V2State {
    input: string;
}

type Props = DispatchProps & V2Props;
type State = V2State;


class V2 extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            input: ""
        }
    }

    handleInput(value: string) {
        this.setState({
            input: value,
        });
    }

    handleClickSystemButton() {
        this.props.dispatch(setAppName(this.state.input))
    }

    render() {

        console.warn(getNow());

        if (!this.props.v2) {
            return (
                <Modal
                    isOpen={true}
                    contentLabel=""
                    onRequestClose={() => console.warn("onRequestClose Loading Modal")}
                    closeButton={false}
                    shouldCloseOnOverlayClick={false}
                    className={"modal-style-override"}
                >
                    <div className="application-spinner">
                        <NavFrontendSpinner type="XXL"/>
                    </div>
                </Modal>
            )
        }

        const {
            fiksDigisosId,
            fiksDigisosSokerJson,
            loaderOn,
            setFiksDigisosIdIsEnabled
        } = this.props.v2;


        const lastSoknadsStatus: Hendelse | undefined = getLastHendelseOfType(fiksDigisosSokerJson, HendelseType.soknadsStatus);

        const soknadsStatusJsx = () => {
            if (lastSoknadsStatus && lastSoknadsStatus.type === HendelseType.soknadsStatus){
                return (
                    <RadioPanelGruppe
                        name="soknadsStatus"
                        legend="Endre status på søknaden:"
                        radios={[
                            {label: 'Mottatt', value: SoknadsStatus.MOTTATT},
                            {label: 'Under behandling', value: SoknadsStatus.UNDER_BEHANDLING},
                            {label: 'Ferdigbehandlet', value: SoknadsStatus.FERDIGBEHANDLET},
                            {label: 'Behandles ikke', value: SoknadsStatus.BEHANDLES_IKKE}
                        ]}
                        checked={lastSoknadsStatus.status}
                        onChange={(evt, nySoknadsStatus) => {
                            if (nySoknadsStatus === SoknadsStatus.MOTTATT || nySoknadsStatus || SoknadsStatus.UNDER_BEHANDLING || SoknadsStatus.FERDIGBEHANDLET || SoknadsStatus.BEHANDLES_IKKE){
                                // @ts-ignore
                                this.props.hendelserUpdated.push({
                                    type: HendelseType.soknadsStatus,
                                    hendelsestidspunkt: getNow(),
                                    status: nySoknadsStatus
                                });
                                const fiksDigisosSokerJsonUpdated: FiksDigisosSokerJson = JSON.parse(JSON.stringify(fiksDigisosSokerJson));
                                fiksDigisosSokerJsonUpdated.sak.soker.hendelser = this.props.hendelserUpdated;
                                this.props.dispatch(sendFiksDigisosSokerJson(fiksDigisosId, fiksDigisosSokerJsonUpdated));
                            }
                        }}
                    />
                );
            }
            throw Error("Det er ingen hendelse i listen med soknadsStatus. Så noe er galt, fordi det skal det være.")
        };



        const fiksDigisosIdIsValid = fiksDigisosId && fiksDigisosId !== "" && !setFiksDigisosIdIsEnabled;

        return (
            <div>
                <div>
                    Fiks Digisos Id
                    <Panel>
                        <Input disabled={!setFiksDigisosIdIsEnabled} value={fiksDigisosId} label={'fiksDigisosId'}
                               onChange={(evt) => this.props.dispatch(setfiksDigisosId(evt.target.value))}/>
                        <button className={"btn btn-primary"}
                                onClick={() => {
                                    this.props.dispatch(disableSetFiksDigisosId());
                                    this.props.dispatch(sendFiksDigisosSokerJson(fiksDigisosId && fiksDigisosId !== "" ? fiksDigisosId : "1234", fiksDigisosSokerJson))
                                }}
                        >
                            OK
                        </button>
                        <button className={"btn btn-danger"}
                                onClick={() => {
                                    this.props.dispatch(enableSetFiksDigisosId());
                                    this.props.dispatch(sendFiksDigisosSokerJson(fiksDigisosId && fiksDigisosId !== "" ? fiksDigisosId : "1234", fiksDigisosSokerJson))
                                }}
                        >
                            EDIT
                        </button>

                    </Panel>
                </div>

                {fiksDigisosIdIsValid && (
                    <>
                        <div>
                            Soknads status
                            <Panel>
                                {soknadsStatusJsx()}
                            </Panel>
                        </div>
                        <div>
                            Tildel nytt navkontor
                            <Panel>
                                <Input label={'Nav kontor kode (4 siffer)'}/>
                                <button onClick={() => console.warn('Tildeler nytt navkontor')}>
                                    OK
                                </button>
                            </Panel>
                        </div>
                        <div>
                            Opprett sak
                            <Lesmerpanel intro={<div>kommer ...</div>}>
                                <Knapp>Knapp 1</Knapp>
                                <Knapp>Knapp 2</Knapp>
                                <Knapp>Knapp 3</Knapp>
                            </Lesmerpanel>
                        </div>
                        <div>

                            <button
                                // style={{backgroundColor: buttonBackgroundColor}}
                                onClick={() => console.warn("Oppretter sak")}
                            >
                                <span className="glyphicon glyphicon-arrow-right" aria-hidden="true"/>
                            </button>
                            Opprett sak
                        </div>
                        <div style={{display: "none"}}>
                            Backend url
                            <Panel>
                                <Input id={"asdf"} label={'url'}/>
                            </Panel>
                        </div>

                        <Modal
                            isOpen={loaderOn}
                            contentLabel=""
                            onRequestClose={() => console.warn("aksjdn")}
                            closeButton={false}
                            shouldCloseOnOverlayClick={false}
                            className={"modal-style-override"}
                        >
                            <div className="application-spinner">
                                {/*<div style={{padding:'2rem 2.5rem'}}>Innhold her</div>*/}
                                <NavFrontendSpinner type="XXL"/>
                            </div>
                        </Modal>
                    </>
                )}
                <Panel>
                    <ReactJson src={fiksDigisosSokerJson}/>
                </Panel>
            </div>
        );
    }

}

const mapStateToProps = (state: AppState) => ({
    v2: state.v2,
    hendelserUpdated: JSON.parse(JSON.stringify(state.v2.fiksDigisosSokerJson.sak.soker.hendelser))
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(V2);
