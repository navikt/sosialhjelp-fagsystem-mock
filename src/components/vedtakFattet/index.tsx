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
import {getAllSaksStatuser, getNow, sakEksistererOgEtVedtakErIkkeFattet} from "../../utils/utilityFunctions";

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

enum VedtaksFeiltype {
    SAKS_REFERANSE = "SAKS_REFERANSE",
    UTFALL = "UTFALL",
    VEDLEGG_TITTEL = "VEDLEGG_TITTEL"
}

interface VedtaksFeil {
    type: VedtaksFeiltype;
    id?: string;
}

interface Props {
    onFattVedtak: (vedtak: vedtakFattet) => void;
    hendelser: Hendelse[];
}

interface State {
    isOpen: boolean;
    isValid: boolean;
    nyttVedtak: vedtakFattet;
    nyttVedlegg: Vedlegg;
    feil: VedtaksFeil[];
    editVedleggIdx: number | undefined;
}


const initialState: State = {
    isOpen: false,
    isValid: true,
    nyttVedtak: {...nyttVedtakTemplate},
    nyttVedlegg: {...nyttVedleggTemplate},
    feil: [],
    editVedleggIdx: undefined
};

class FattNyttVedtak extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = initialState;
    }

    handleFattVedtak() {
        const nyttVedtak = {...this.state.nyttVedtak};
        let listOfFeil: VedtaksFeil[] = [];
        if (!sakEksistererOgEtVedtakErIkkeFattet(this.props.hendelser, this.state.nyttVedtak.saksreferanse)) {
            listOfFeil.push({type: VedtaksFeiltype.SAKS_REFERANSE});
        }
        if (
            nyttVedtak.utfall.utfall !== Utfall.AVVIST &&
            nyttVedtak.utfall.utfall !== Utfall.AVSLATT &&
            nyttVedtak.utfall.utfall !== Utfall.DELVIS_INNVILGET &&
            nyttVedtak.utfall.utfall !== Utfall.INNVILGET) {
            listOfFeil.push({type: VedtaksFeiltype.UTFALL});
        }
        const feilIVedlegg = nyttVedtak.vedlegg.map((vedlegg: Vedlegg, idx): VedtaksFeil => {
            if (vedlegg.tittel === "") {
                return {
                    type: VedtaksFeiltype.VEDLEGG_TITTEL,
                    id: `${idx}`
                };
            } else {
                return {
                    type: VedtaksFeiltype.VEDLEGG_TITTEL,
                };
            }
        }).filter((vedtaksfeil: VedtaksFeil) => {
            return !!vedtaksfeil.id
        });
        listOfFeil = listOfFeil.concat(feilIVedlegg);

        if (listOfFeil.length === 0) {
            this.props.onFattVedtak(this.state.nyttVedtak);
            this.setState({...initialState});
        } else {

            this.setState({
                isValid: false,
                feil: listOfFeil
            })
        }
    }

    handleSelectUtfall(utfall: string) {
        const nyttVedtak = {...this.state.nyttVedtak};
        switch (utfall) {
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
        this.setState({nyttVedtak: nyttVedtak, isValid: true});
    }

    handleSelectFilreferanse(value: string) {
        const nyttVedtak: vedtakFattet = {...this.state.nyttVedtak};
        switch (value) {
            case "svarut": {
                nyttVedtak.vedtaksfil.referanse.type = FilreferanseType.svarut;
                break;
            }
            case "dokumentlager": {
                nyttVedtak.vedtaksfil.referanse.type = FilreferanseType.dokumentlager;
                break;
            }
        }
        this.setState({nyttVedtak: nyttVedtak, isValid: true});
    }

    handleSelectSaksReferanse(saksReferanseString: string) {
        const nyttVedtak: vedtakFattet = {...this.state.nyttVedtak};
        nyttVedtak.saksreferanse = saksReferanseString;
        this.setState({
            nyttVedtak: nyttVedtak,
            isValid: true
        });
    }

    updateVedleggInListOfVedlegg(updatedVedlegg: Vedlegg, idx: number) {
        const nyttVedtak: vedtakFattet = this.state.nyttVedtak;
        const vedleggslisteUpdated: Vedlegg[] = nyttVedtak.vedlegg.map((vedlegg, index) => {
            if (index === idx) {
                return updatedVedlegg;
            }
            return vedlegg;
        });
        nyttVedtak.vedlegg = vedleggslisteUpdated;
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


        // export interface Vedlegg {
        //     tittel: string;
        //     referanse: Filreferanse;
        // }

        const insertVedleggContent: () => JSX.Element = () => {
            const nyttVedtak = {...this.state.nyttVedtak};

            let vedleggsOversiktJsx: JSX.Element[];
            if (nyttVedtak.vedlegg.length > 0) {
                vedleggsOversiktJsx = nyttVedtak.vedlegg.map((vedlegg: Vedlegg, idx: number) => {

                    const editVedleggIdx: number | undefined = this.state.editVedleggIdx;

                    if (editVedleggIdx !== undefined && editVedleggIdx === idx) {
                        return (
                            <div>
                                Tittel redigering: <input value={vedlegg.tittel} onChange={(evt) => {
                                const vedleggUpdated = {...vedlegg};
                                vedleggUpdated.tittel = evt.target.value;
                                this.updateVedleggInListOfVedlegg(vedleggUpdated, idx);
                            }}
                            />
                                Type:
                                <select onChange={(evt) => {
                                    const vedleggUpdated = JSON.parse(JSON.stringify(vedlegg));
                                    let filreferanseUpdated: FilreferanseType = FilreferanseType.svarut;
                                    switch (evt.target.value) {
                                        case "svarut": {filreferanseUpdated = FilreferanseType.svarut; break;}
                                        case "dokumentlager": {filreferanseUpdated = FilreferanseType.dokumentlager; break;}
                                    }
                                    vedleggUpdated.referanse.type = filreferanseUpdated;
                                    this.updateVedleggInListOfVedlegg(vedleggUpdated, idx);
                                }}>
                                    <option selected={vedlegg.referanse.type === FilreferanseType.svarut} value={FilreferanseType.svarut}>svarut</option>
                                    <option selected={vedlegg.referanse.type === FilreferanseType.dokumentlager} value={FilreferanseType.dokumentlager}>dokumentlager</option>
                                </select>
                                <button className={"btn btn-default"}
                                        onClick={(evt) => this.setState({editVedleggIdx: undefined})}>
                                    <span className="glyphicon glyphicon-ok" aria-hidden="true"/>
                                </button>
                            </div>
                        )
                    } else {
                        return (
                            <div>
                                Tittel: {vedlegg.tittel}. Referanse: {vedlegg.referanse.type}
                                <button className={"btn btn-default"}
                                        onClick={(evt) => this.setState({editVedleggIdx: idx})}>
                                    <span className="glyphicon glyphicon-pencil" aria-hidden="true"/>
                                </button>
                                <button className={"btn btn-default"}>
                                    <span className="glyphicon glyphicon-remove" aria-hidden="true"/>
                                </button>
                            </div>
                        )
                    }
                });

            } else {
                vedleggsOversiktJsx = [<div>Ingen vedlegg lagt til ennå...</div>];
            }

            vedleggsOversiktJsx.push(
                <div>
                    <button onClick={(evt) => {
                        const nyttVedtakUpdated: vedtakFattet = {...this.state.nyttVedtak};
                        const vedleggslisteUpdated: Vedlegg[] = nyttVedtakUpdated.vedlegg.map((vedlegg) => vedlegg);
                        vedleggslisteUpdated.push({...nyttVedleggTemplate});
                        nyttVedtakUpdated.vedlegg = vedleggslisteUpdated;
                        this.setState({
                            nyttVedtak: nyttVedtakUpdated,
                            editVedleggIdx: vedleggslisteUpdated.length - 1,
                            isValid: true
                        });
                    }}>
                        <span className={"glyphicon glyphicon-plus"} aria-hidden={"true"} />
                    </button>
                </div>
            );

            return (
                <div>
                    {vedleggsOversiktJsx}
                </div>
            );
        };

        const harSakerContent: JSX.Element = (
            <>
                {/*Velg saksreferanse*/}
                <Select onChange={(e) => this.handleSelectSaksReferanse(e.target.value)} label='Saksreferanse'>
                    <option value=''>Velg saksreferanse</option>
                    {optionsSaksreferanse}
                </Select>

                {/*Velg utfall*/}
                <Select onChange={e => this.handleSelectUtfall(e.target.value)} label='Utfall'>
                    <option value=''>Velg utfall</option>
                    <option value={"INNVILGET"}>Innvilget</option>
                    ,
                    <option value={"DELVIS_INNVILGET"}>Delvis innvilget</option>,
                    <option value={"AVSLATT"}>Avslått</option>,
                    <option value={"AVVIST"}>Avvist</option>
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

        const isClosedContent = (
            <div>
                <button onClick={() => this.setState({isOpen: true})} className={"btn btn-primary margin-top"}>Fatt
                    vedtak<span className="glyphicon glyphicon-plus" aria-hidden="true"/></button>
            </div>
        );

        const isOpenContent = (
            <div>
                {harSaker && harSakerContent}
                {!harSaker && harIkkeSakerContent}
                <div>
                    <button
                        onClick={() => this.setState({
                            isOpen: false,
                            nyttVedtak: {...nyttVedtakTemplate},
                            nyttVedlegg: {...nyttVedleggTemplate},
                            isValid: true
                        })}
                        className={"btn btn-danger"}>
                        Avbryt<span className="glyphicon glyphicon-remove" aria-hidden="true"/>
                    </button>
                </div>
            </div>
        );

        return (
            <div>
                Fatt nytt vedtak
                <Panel>
                    <div>
                        <span>Noe tekst</span><input/><span>noe mer tekst</span><select></select>
                    </div>
                    {
                        !this.state.isOpen && isClosedContent
                    }
                    {
                        this.state.isOpen && isOpenContent
                    }
                    {this.state.feil.map((feil: VedtaksFeil) => {
                        return (<div> {feil.type} {feil.id}</div>)
                    })}
                </Panel>
            </div>
        )
    }
}

export default FattNyttVedtak;