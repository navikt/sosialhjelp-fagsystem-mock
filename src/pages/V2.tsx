import React from 'react';
import {Panel} from "nav-frontend-paneler";
import {Input} from "nav-frontend-skjema";
import {Knapp} from "nav-frontend-knapper";
import {AppState, DispatchProps} from "../redux/reduxTypes";
import {connect} from "react-redux";
import {setAppName} from "../redux/example/exampleActions";
import Lesmerpanel from "nav-frontend-lesmerpanel";
import {V2Model} from "../redux/v2/v2Types";
import NavFrontendSpinner from "nav-frontend-spinner";
import Modal from 'nav-frontend-modal';
import {sendDigisosSokerJson, setfiksDigisosId} from "../redux/v2/v2Actions";




interface V2Props {
    v2: V2Model
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

        if (!this.props.v2) {
            return "...loading"
        }

        const {fiksDigisosId, digisosSokerJson, loaderOn} = this.props.v2;

        return (
            <div>
                <div>
                    Referanse Id
                    <Panel>
                        <Input value={fiksDigisosId} label={'fiksDigisosId'} onChange={(evt) => this.props.dispatch(setfiksDigisosId(evt.target.value))}/>
                        <button className={"btn btn-primary"}
                                onClick={() => {
                                    this.props.dispatch(sendDigisosSokerJson(fiksDigisosId && fiksDigisosId !== "" ? fiksDigisosId : "1234", JSON.stringify(digisosSokerJson, null, 4)))
                                }}
                        >
                            OK
                        </button>
                    </Panel>
                </div>
                <div>
                    Soknads status
                    <Panel>
                        <Knapp>Mottatt</Knapp>
                        <Knapp>Under behandling</Knapp>
                        <Knapp>ferdigstilt</Knapp>
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
                        <NavFrontendSpinner type="XXL" />
                    </div>
                </Modal>

            </div>
        );
    }

}

const mapStateToProps = (state: AppState) => ({
    v2: state.v2
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
