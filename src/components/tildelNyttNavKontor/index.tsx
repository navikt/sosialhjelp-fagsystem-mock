import * as React from 'react';
import {Panel} from "nav-frontend-paneler";
import {Input} from "nav-frontend-skjema";
import {SkjemaelementFeil} from "nav-frontend-skjema/lib/skjemaelement-feilmelding";
import {isNDigits} from "../../utils/utilityFunctions";

interface Props {
    onClick: (nyttNavKontor: string) => void;
}

interface State {
    input: string;
    isValid: boolean;
}

class TildelNyttNavKontor extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            input: "",
            isValid: true
        }
    }

    render(){

        const feil: undefined | SkjemaelementFeil = this.state.isValid ? undefined : { feilmelding: "Nav kontor spesifiserer med 4 siffer." };

        return(
            <div>
                Tildel nytt navkontor
                <Panel>
                    <Input
                        label={'Nav kontor kode (4 siffer)'}
                        value={this.state.input}
                        onChange={(evt) => this.setState({input: evt.target.value, isValid: true})}
                        feil={feil}
                    />
                    <button
                        className={"btn btn-primary"}
                        onClick={() => {
                            if (isNDigits(this.state.input, 4)){
                                this.props.onClick(this.state.input)
                            } else {
                                this.setState({isValid: false})
                            }
                        }}
                    >
                        Tildel nytt navkontor
                    </button>
                </Panel>
            </div>
        )
    }
}

export default TildelNyttNavKontor;