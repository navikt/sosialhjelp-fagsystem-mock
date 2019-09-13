import React from 'react';
import {Panel} from "nav-frontend-paneler";
import {Input, RadioPanelGruppe} from "nav-frontend-skjema";
import {AppState, DispatchProps} from "../redux/reduxTypes";
import {connect} from "react-redux";
import {setAppName} from "../redux/example/exampleActions";
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
import Hendelse, {
    FiksDigisosSokerJson,
    HendelseType,
    soknadsStatus,
    SoknadsStatus, tildeltNavKontor, vedtakFattet
} from "../types/hendelseTypes";
import {getLastHendelseOfType, getNow} from "../utils/utilityFunctions";
import TildelNyttNavKontor from "../components/tildelNyttNavKontor";
import BackendUrl from "../components/backendUrl";
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {PacmanLoader} from "react-spinners";
import { css } from '@emotion/core';import OpprettNySaksStatus from "../components/saksStatus";
import FattNyttVedtak from "../components/vedtakFattet";
import DokumentasjonEtterspurt from "../components/dokumentasjonEtterspurt";
import FilreferanseLager from "../components/filreferanseLager";

const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
`;


interface V2Props {
    v2: V2Model
    hendelserUpdated: Hendelse[]
}

interface V2State {
    input: string;
}

export enum NotificationLevel {
    INFO = "INFO",
    SUCCESS = "SUCESS",
    ERROR = "ERROR",
    WARNING = "WARNING"
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

    notifyA = (level: NotificationLevel, text: string, options: any) => {
        switch (level) {
            case NotificationLevel.INFO: {toast.info(text, options); break;}
            case NotificationLevel.SUCCESS: {toast.success(text, options); break;}
            case NotificationLevel.WARNING: {toast.warn(text, options); break;}
            case NotificationLevel.ERROR: {toast.error(text, options); break;}
            default: {toast.info(text, options); break;}
        }
    };


    handleInput(value: string) {
        this.setState({
            input: value,
        });
    }

    handleClickSystemButton() {
        this.props.dispatch(setAppName(this.state.input))
    }

    private updateAndSendFiksDigisosSokerJson() {

        const {hendelserUpdated} = this.props;
        const {backendUrlTypeToUse, backendUrls, fiksDigisosId, fiksDigisosSokerJson} = this.props.v2;

        const fiksDigisosSokerJsonUpdated: FiksDigisosSokerJson = JSON.parse(JSON.stringify(fiksDigisosSokerJson));
        fiksDigisosSokerJsonUpdated.sak.soker.hendelser = hendelserUpdated;
        // @ts-ignore
        const currentBackendUrl = backendUrls[backendUrlTypeToUse];
        this.props.dispatch(sendFiksDigisosSokerJson(fiksDigisosId, fiksDigisosSokerJsonUpdated, currentBackendUrl, this.notifyA));
    }

    render() {

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
            setFiksDigisosIdIsEnabled,
            backendUrls,
            backendUrlTypeToUse
        } = this.props.v2;

        // @ts-ignore
        const currentBackendUrl = backendUrls[backendUrlTypeToUse];


        const lastSoknadsStatus: Hendelse | undefined = getLastHendelseOfType(fiksDigisosSokerJson, HendelseType.soknadsStatus);

        const soknadsStatusJsx = () => {
            if (lastSoknadsStatus && lastSoknadsStatus.type === HendelseType.soknadsStatus) {
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
                            if (nySoknadsStatus === SoknadsStatus.MOTTATT || nySoknadsStatus || SoknadsStatus.UNDER_BEHANDLING || SoknadsStatus.FERDIGBEHANDLET || SoknadsStatus.BEHANDLES_IKKE) {
                                this.props.hendelserUpdated.push({
                                    type: HendelseType.soknadsStatus,
                                    hendelsestidspunkt: getNow(),
                                    status: nySoknadsStatus
                                } as soknadsStatus);
                                this.updateAndSendFiksDigisosSokerJson();
                            }
                        }}
                    />
                );
            }
            throw Error("Det er ingen hendelse i listen med soknadsStatus. Så noe er galt, fordi det skal det være.")
        };


        const fiksDigisosIdIsValid = fiksDigisosId && fiksDigisosId !== "" && !setFiksDigisosIdIsEnabled;

        return (
            <div className={"v2-wrapper"}>
                <div className={"v2-content"}>

                    <button className={"btn btn-default"}>
                        <span className="glyphicon glyphicon-cog" aria-hidden="true"/>
                    </button>

                    <BackendUrl/>

                    <div>
                        Fiks Digisos Id
                        <Panel>
                            <Input disabled={!setFiksDigisosIdIsEnabled} value={fiksDigisosId} label={'fiksDigisosId'}
                                   onChange={(evt) => this.props.dispatch(setfiksDigisosId(evt.target.value))}/>
                            <button className={"btn btn-primary"}
                                    onClick={() => {
                                        this.props.dispatch(disableSetFiksDigisosId());
                                        this.props.dispatch(sendFiksDigisosSokerJson(fiksDigisosId && fiksDigisosId !== "" ? fiksDigisosId : "1234", fiksDigisosSokerJson, currentBackendUrl, this.notifyA))
                                    }}
                            >
                                OK
                            </button>
                            <button className={"btn btn-danger"}
                                    onClick={() => {
                                        this.props.dispatch(enableSetFiksDigisosId());
                                        this.props.dispatch(sendFiksDigisosSokerJson(fiksDigisosId && fiksDigisosId !== "" ? fiksDigisosId : "1234", fiksDigisosSokerJson, currentBackendUrl, this.notifyA))
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

                            <TildelNyttNavKontor
                                onClick={(nyttNavKontor) => {
                                    this.props.hendelserUpdated.push({
                                        type: HendelseType.tildeltNavKontor,
                                        hendelsestidspunkt: getNow(),
                                        navKontor: nyttNavKontor
                                    } as tildeltNavKontor);
                                    this.updateAndSendFiksDigisosSokerJson();
                                }}
                            />


                            <OpprettNySaksStatus
                                onClick={(nySaksStatus) => {
                                    this.props.hendelserUpdated.push(nySaksStatus);
                                    this.updateAndSendFiksDigisosSokerJson();
                                }}
                            />

                            <DokumentasjonEtterspurt />

                            <FattNyttVedtak
                                onFattVedtak={(vedtakFattet: vedtakFattet) => {
                                    this.props.hendelserUpdated.push(vedtakFattet);
                                    this.updateAndSendFiksDigisosSokerJson();
                                }}
                            />

                            <FilreferanseLager />

                            {/* Kan gjøres slik for at testcafe skal kunne sette riktig backend url*/}
                            <div style={{display: "none"}}>
                                Backend url
                                <Panel>
                                    <Input id={"asdf"} label={'url'}/>
                                </Panel>
                            </div>

                            {/*<Modal*/}
                            {/*    isOpen={loaderOn}*/}
                            {/*    contentLabel=""*/}
                            {/*    onRequestClose={() => console.warn("aksjdn")}*/}
                            {/*    closeButton={false}*/}
                            {/*    shouldCloseOnOverlayClick={false}*/}
                            {/*    className={"modal-style-override"}*/}
                            {/*>*/}
                            {/*    <div className="application-spinner">*/}
                            {/*        /!*<div style={{padding:'2rem 2.5rem'}}>Innhold her</div>*!/*/}
                            {/*        /!*<NavFrontendSpinner type="XXL"/>*!/*/}
                            {/*        <div className='sweet-loading pacmanloader'>*/}
                            {/*            <PacmanLoader*/}
                            {/*                css={override}*/}
                            {/*                sizeUnit={"px"}*/}
                            {/*                size={50}*/}
                            {/*                color={'#000'}*/}
                            {/*                loading={loaderOn}*/}
                            {/*            />*/}
                            {/*        </div>*/}
                            {/*    </div>*/}
                            {/*</Modal>*/}
                        </>
                    )}
                    <Panel>
                        <ReactJson src={fiksDigisosSokerJson}/>
                    </Panel>
                    {/*{loaderOn && this.notify()}*/}
                    <ToastContainer containerId={'A'} autoClose={2000}/>
                </div>
                <div className='sweet-loading pacmanloader'>
                    <PacmanLoader
                        css={override}
                        sizeUnit={"px"}
                        size={50}
                        color={'#000'}
                        loading={loaderOn}
                    />
                </div>
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
