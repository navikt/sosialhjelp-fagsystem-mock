import * as React from 'react';
import {Panel} from "nav-frontend-paneler";
import Hendelse, {
    FilreferanseType,
    HendelseType,
    saksStatus,
    Utfall,
    Vedlegg,
    vedtakFattet
} from "../../types/hendelseTypes";
import {Input, RadioPanelGruppe, Select} from "nav-frontend-skjema";
import {getAllSaksStatuser, getNow} from "../../utils/utilityFunctions";

const nyttVedtakTemplate: vedtakFattet = {
    type: HendelseType.vedtakFattet,
    hendelsestidspunkt: getNow(),
    saksreferanse: "",
    utfall: {utfall: Utfall.INNVILGET},
    vedtaksfil: {referanse: {type: FilreferanseType.svarut}},
    vedlegg: []
};

const nyttVedleggTemplate: Vedlegg = {
    tittel: "",
    referanse: {type: FilreferanseType.svarut}
};

interface Props {
    onFattVedtak: (vedtak: vedtakFattet) => void;
    hendelser: Hendelse[];
}

interface State {
    isValid: false;
    nyttVedtak: vedtakFattet;
    nyttVedlegg: Vedlegg;
}

class FattNyttVedtak extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isValid: false,
            nyttVedtak: {...nyttVedtakTemplate},
            nyttVedlegg: {...nyttVedleggTemplate}
        }
    }

    isValidVedtak(vedtak: vedtakFattet) {
        return true;
    }


    handleFattVedtak() {

        if (this.isValidVedtak(this.state.nyttVedtak)) {
            this.props.onFattVedtak(this.state.nyttVedtak);
        } else {
            this.setState({isValid: false})
        }
    }

    handleSelectSaksreferanse(saksreferanseString: string) {
        const nyttVedtak = {...this.state.nyttVedtak};
        switch (saksreferanseString) {
            case "INNVILGET": {
                nyttVedtak.utfall.utfall = Utfall.INNVILGET;
                break;
            }
            case "DELVIS_INNVILGET": {
                nyttVedtak.utfall.utfall = Utfall.DELVIS_INNVILGET;
                break;
            }
            case "AVSLATT": {
                nyttVedtak.utfall.utfall = Utfall.AVSLATT;
                break;
            }
            case "AVVIST": {
                nyttVedtak.utfall.utfall = Utfall.AVVIST;
                break;
            }
        }
        this.setState({nyttVedtak: nyttVedtak});
    }

    handleSelectFilreferanse(value: string){
        const nyttVedtak: vedtakFattet = {...this.state.nyttVedtak};
        switch (value) {
            case "svarut": {nyttVedtak.vedtaksfil.referanse.type = FilreferanseType.svarut; break;}
            case "dokumentlager": {nyttVedtak.vedtaksfil.referanse.type = FilreferanseType.dokumentlager; break;}
        }
        this.setState({nyttVedtak: nyttVedtak});
    }


    render() {

        const {hendelser} = this.props;
        const {nyttVedtak} = this.state;


        const alleSaksStatuser: saksStatus[] = getAllSaksStatuser(hendelser);

        const harSaker: boolean = alleSaksStatuser.length > 0;


        // export interface vedtakFattet {
        //     type: HendelseType.vedtakFattet;
        //     hendelsestidspunkt: string;
        //     saksreferanse: string;
        //     utfall: { utfall: Utfall };
        //     vedtaksfil: { referanse: Filreferanse};
        //     vedlegg: Vedlegg[]
        // }

        const optionsSaksreferanse: JSX.Element[] = alleSaksStatuser.map((saksStatus: saksStatus) => {
            return (
                <option value={saksStatus.referanse}>{saksStatus.tittel} (saksreferanse: {saksStatus.referanse},
                    status: {saksStatus.status})</option>
            )
        });

        const optionsUtfall: JSX.Element[] = [
            <option value={"INNVILGET"}>Innvilget</option>,
            <option value={"DELVIS_INNVILGET"}>Delvis innvilget</option>,
            <option value={"AVSLATT"}>Avslått</option>,
            <option value={"AVVIST"}>Avvist</option>
        ];

        // export interface Vedlegg {
        //     tittel: string;
        //     referanse: Filreferanse;
        // }

        const insertVedleggContent: () => JSX.Element = () => {
            const nyttVedtak = {...this.state.nyttVedtak};

            let vedleggsOversiktJsx: JSX.Element[];
            if (nyttVedtak.vedlegg.length > 0 ){
                vedleggsOversiktJsx = nyttVedtak.vedlegg.map((vedlegg: Vedlegg) => {
                    return (
                        <div>
                            Tittel: { vedlegg.tittel}. Referanse: {vedlegg.referanse.type}
                            <button className={"btn btn-default"}><span className="glyphicon glyphicon-remove" aria-hidden="true"/></button>
                        </div>
                    )
                });
            } else {
                vedleggsOversiktJsx = [<div>Ingen vedlegg lagt til ennå...</div>];
            }

            const nyttVedleggJsx: JSX.Element = (
                <div>

                    <Input value={this.state.nyttVedlegg.tittel} label={"Tittel"} onChange={(evt) => {
                        const nyttVedlegg = {...this.state.nyttVedlegg};
                        nyttVedlegg.tittel = evt.target.value;
                        this.setState({nyttVedlegg: nyttVedlegg});
                    }}/>
                    <Select onChange={(evt) => {
                        const nyttVedlegg = {...this.state.nyttVedlegg};
                        switch (evt.target.value) {
                            case "svarut": {nyttVedlegg.referanse.type = FilreferanseType.svarut; break;}
                            case "dokumentlager": {nyttVedlegg.referanse.type = FilreferanseType.dokumentlager; break;}
                        }
                        this.setState({nyttVedlegg: nyttVedlegg});
                    }} label='Filreferanse'>
                        <option value=''>Velg filreferanse</option>
                        <option value={FilreferanseType.svarut}>Svarut</option>
                        <option value={FilreferanseType.dokumentlager}>Dokumentlager</option>
                    </Select>
                    <button className={"btn btn-primary"} onClick={(evt) => {
                        const nyttVedtak: vedtakFattet = {...this.state.nyttVedtak};
                        const oppdatertVedleggsListe: Vedlegg[] = nyttVedtak.vedlegg.map((vedlegg: Vedlegg) => vedlegg);
                        const nyttVedlegg = {...this.state.nyttVedlegg};
                        oppdatertVedleggsListe.push(nyttVedlegg);
                        nyttVedtak.vedlegg = oppdatertVedleggsListe;
                        this.setState({nyttVedtak: nyttVedtak});
                    }}>
                        Legg til vedlegg <span className="glyphicon glyphicon-ok" aria-hidden="true"/>
                    </button>
                </div>
            );

            return (
                <div>
                    {vedleggsOversiktJsx}
                    {nyttVedleggJsx}
                </div>
            );
        };

        const harSakerContent: JSX.Element = (
            <>
                {/*Velg saksreferanse*/}
                <Select onChange={e => this.handleSelectSaksreferanse(e.target.value)} label='Saksreferanse'>
                    <option value=''>Velg saksreferanse</option>
                    {optionsSaksreferanse}
                </Select>

                {/*Velg utfall*/}
                <Select label='Utfall'>
                    <option value=''>Velg utfall</option>
                    {optionsUtfall}
                </Select>

                {/*Vedtaksfil*/}
                <RadioPanelGruppe
                    name="vedtaksfil"
                    legend="Filreferanse"
                    radios={[
                        {label: 'Svarut', value: FilreferanseType.svarut},
                        {label: 'Dokumentlager', value: FilreferanseType.dokumentlager},
                    ]}
                    checked={nyttVedtak.vedtaksfil.referanse.type}
                    onChange={(evt, value) => this.handleSelectFilreferanse(value)}
                />

                {/*Vedlegg*/}

                {insertVedleggContent()}


                <button className={"btn btn-primary margin-top"} onClick={() => this.handleFattVedtak()}>
                    Bekreft vedtak <span className="glyphicon glyphicon-send" aria-hidden="true"/>
                </button>
            </>
        );

        const harIkkeSakerContent: JSX.Element = (
            <>
                Ingen saker er opprettet. En sak må opprettes før et vedtak kan fattes.
            </>
        );

        return (
            <div>
                Fatt nytt vedtak
                <Panel>
                    {harSaker && harSakerContent}
                    {!harSaker && harIkkeSakerContent}
                </Panel>
            </div>
        )
    }
}

export default FattNyttVedtak;