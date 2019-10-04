import * as React from 'react'
import {AppState, DispatchProps} from "../../redux/reduxTypes";
import {connect} from "react-redux";
import {BackendUrls} from "../../redux/v2/v2Types";
import {Panel} from "nav-frontend-paneler";
import {Input, RadioPanelGruppe} from "nav-frontend-skjema";
import {editBackendUrlForType, setBackendUrlTypeToUse} from "../../redux/v2/v2Actions";


interface OwnProps {
    backendUrls: BackendUrls;
    backendUrlToUse: string;
}

interface State {
    input: string;
}

type Props = DispatchProps & OwnProps;


class BackendUrl extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            input: ""
        }
    }

    render() {

        const {backendUrls, backendUrlToUse} = this.props;

        const radios = Object.keys(backendUrls).map((backendUrlType: string, index: number) => {
            // @ts-ignore
            const url = backendUrls[backendUrlType];
            let label: JSX.Element | string = (
                <div>
                    <p>{backendUrlType}</p>
                    <p>{url}</p>
                </div>
            );
            if (backendUrlToUse === backendUrlType) {
                label = <Input className={"sp-input"} label={backendUrlType} value={url}
                               onChange={(evt) => this.props.dispatch(editBackendUrlForType(backendUrlType, evt.target.value))}/>;
            }
            return {
                label: label,
                value: backendUrlType,
            }
        });

        return (
            <div>
                BackendUrl
                <Panel class={"sp-panel"}>
                    <RadioPanelGruppe
                        name="backendUrl"
                        legend="Sett backend url:"
                        radios={radios}
                        checked={backendUrlToUse}
                        onChange={(evt, nyBackendUrlTypeToUse) => {
                            this.props.dispatch(setBackendUrlTypeToUse(nyBackendUrlTypeToUse));
                        }}
                    />
                </Panel>
            </div>
        )
    }
}


const mapStateToProps = (state: AppState) => ({
    backendUrls: state.v2.backendUrls,
    backendUrlToUse: state.v2.backendUrlToUse
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BackendUrl);
