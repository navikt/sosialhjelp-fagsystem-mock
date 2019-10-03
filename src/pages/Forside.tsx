import React from "react";
import {connect} from "react-redux";
import {AppState, DispatchProps} from "../redux/reduxTypes";
import {Panel} from "nav-frontend-paneler";
import {Input} from "nav-frontend-skjema";
import Form from "react-jsonschema-form";
import ReactJson from "react-json-view";
import {Hendelse} from "../types/foo";
import {getSchemaByHendelseType, mergeListsToLengthN} from "../utils/utilityFunctions";
import Lesmerpanel from "nav-frontend-lesmerpanel";
import uiSchemaSaksStatus from "../uischemas/saksStatus";
import {HendelseType} from "../types/hendelseTypes";

// const additionalMetaSchemas = require("ajv/lib/refs/json-schema-draft-06.json");
// const hendelseSchemaTest = require('./digisos/hendelse-schema-test');
const initialHendelseTest = require('../digisos/initial-hendelse-test');
// const hendelseSchema = require('./digisos/hendelse-schema');
// const SoknadsStatus = require('./digisos/hendelse/SoknadsStatus');
const minimal = require('../digisos/minimal');
const digisosKomplett = require('../digisos/komplett');

const hendelserKomplett: Hendelse[] = digisosKomplett.hendelser;

export const log = (type: any) => console.log.bind(console, type);



interface ForsideState {
    digisosSoker: object;
    hendelserPrepared: Hendelse[];
    historyPoint: number;
    sidebarOpen: boolean;
}

type Props = DispatchProps;


class Forside extends React.Component<Props, ForsideState> {

    constructor(props: Props) {
        super(props);
        this.state = {
            digisosSoker: initialHendelseTest,
            hendelserPrepared: minimal.hendelser,
            historyPoint: 0,
            sidebarOpen: false
        };
        this.onToggleSidebarOpen = this.onToggleSidebarOpen.bind(this);
    }

    onToggleSidebarOpen(open: boolean) {
        this.setState({ sidebarOpen: open });
    }

    handleChange(json: any) {
        this.setState({
            digisosSoker: json.formData
        });
    }

    handleChooseHistoryPoint(idx: number){

        const komplett: Hendelse[] = digisosKomplett["hendelser"];
        const {hendelserPrepared} = this.state;

        this.setState({
            hendelserPrepared: mergeListsToLengthN(hendelserPrepared, komplett, idx + 1),
            historyPoint: idx
        })
    }

    render() {
        const listOfJsxHendelser = hendelserKomplett.map((hendelse: Hendelse, idx: number) => {
            const {historyPoint} = this.state;
            // let buttonBackgroundColor: string;
            let buttonClassName: string;
            let buttonIcon: JSX.Element;

            if ( idx > historyPoint){
                // buttonBackgroundColor = "white";
                buttonClassName = "btn btn-secondary";
                buttonIcon = (<span className="glyphicon glyphicon-arrow-right" aria-hidden="true"/>)
            } else if (idx === historyPoint) {
                // buttonBackgroundColor = "red";
                buttonClassName = "btn btn-success";
                buttonIcon = (<span className="glyphicon glyphicon-ok" aria-hidden="true"/>)
            } else {
                // buttonBackgroundColor = "grey";
                buttonClassName = "btn btn-light"
                buttonIcon = (<span className="glyphicon glyphicon-arrow-right" aria-hidden="true"/>)
            }

            const intro: JSX.Element = (
                <>
                    <p>{hendelse.type}</p>
                    <button
                        // style={{backgroundColor: buttonBackgroundColor}}
                        className={buttonClassName}
                        onClick={() => this.handleChooseHistoryPoint(idx)}
                    >
                        { buttonIcon }
                    </button>
                </>
            );

            let schema: any;
            if (hendelse.type){
                schema = getSchemaByHendelseType(hendelse.type);
            } else {
                schema = getSchemaByHendelseType(HendelseType.SoknadsStatus);
            }

            return (
                <li key={idx} className={"margintop"}>
                    <Lesmerpanel intro={intro} border>
                        <Form schema={schema}
                              formData={hendelse}
                              uiSchema={uiSchemaSaksStatus}
                              // onChange={(json) => this.handleChange(json)}
                              // onSubmit={(json) => this.handleSubmit(json)}
                              // onError={log("errors")}
                        />
                        <div>
                            { JSON.stringify(hendelse, null, 4)}
                        </div>

                    </Lesmerpanel>
                </li>
            );
        });


        return (
            <div className={"margintop pageContent"}>
                <div className={"brukerinfoBlokk"}>
                    <Panel>
                        <div className={"columns"}>
                            <div style={{width: "30%"}} className={"columns__column"}>
                                <h3>
                                    Bruker- og søknadsdata
                                </h3>
                            </div>
                            <div style={{width: "30%"}} className={"columns__column"}>
                                <Input label={'Bruker identifikator'}/>
                            </div>
                            <div style={{width: "30%"}} className={"columns__column"}>
                                <Input label={'Søknadsreferanse'}/>
                            </div>
                        </div>
                    </Panel>
                </div>

                <div className={"flexWrapContent"}>
                    <div className={"hendelseBlokk"}>
                        <Panel className={"navPanel"}>
                            <ul className={"hendelseList"}>
                                {listOfJsxHendelser}
                            </ul>
                        </Panel>
                    </div>

                    <div className={"jsonBlokk"}>
                        <Panel className={"navPanel"}>
                            <div className={"column"}>
                                <div className={"jsonView"}>
                                    <ReactJson src={this.state.hendelserPrepared}/>
                                </div>
                            </div>
                        </Panel>
                    </div>
                </div>

                {/*<Sidebar*/}
                {/*    sidebar={sidebarcontent}*/}
                {/*    open={this.state.sidebarOpen}*/}
                {/*    docked={false}*/}
                {/*    onSetOpen={this.onToggleSidebarOpen}*/}
                {/*    styles={{ sidebar: { background: "white" } }}*/}
                {/*>*/}
                {/*    <Knapp type={'hoved'} style={{margin: "8px"}} onClick={() => this.onToggleSidebarOpen(!this.state.sidebarOpen)}>*/}
                {/*        { this.state.sidebarOpen ? "SKJUL JSON VISNING" : "VIS GENERERT JSON"}*/}
                {/*    </Knapp>*/}
                {/*</Sidebar>*/}

            </div>
        )
    }

}

const mapStateToProps = (state: AppState) => ({
    example: state.example
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Forside);
