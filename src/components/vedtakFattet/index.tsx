import * as React from 'react';
import {Panel} from "nav-frontend-paneler";
import Hendelse, {
    Dokumentlager,
    DokumentlagerExtended,
    FilreferanseType,
    HendelseType,
    saksStatus,
    Svarut,
    SvarutExtended,
    Utfall,
    Vedlegg,
    vedtakFattet
} from "../../types/hendelseTypes";
import {RadioPanelGruppe, Select} from "nav-frontend-skjema";
import {getAllSaksStatuser, getNow, sakEksistererOgEtVedtakErIkkeFattet} from "../../utils/utilityFunctions";
import {AppState, DispatchProps} from "../../redux/reduxTypes";
import {Filreferanselager} from "../../redux/v2/v2Types";
import {connect} from "react-redux";
import ReactJson from "react-json-view";


export interface vedtakFattetExtended {
    type: HendelseType.vedtakFattet;
    hendelsestidspunkt: string;
    saksreferanse: string;
    utfall: { utfall: Utfall | undefined };
    vedtaksfil: {
        referanse: SvarutExtended | DokumentlagerExtended | undefined
    }
    vedlegg: (SvarutExtended | DokumentlagerExtended)[]
}

const nyttVedtakTemplate: vedtakFattetExtended = {
    type: HendelseType.vedtakFattet,
    hendelsestidspunkt: getNow(),
    saksreferanse: "",
    utfall: {utfall: undefined},
    vedtaksfil: {referanse: undefined},
    vedlegg: []
};


enum VedtaksFeiltype {
    SAKS_REFERANSE = "SAKS_REFERANSE",
    UTFALL = "UTFALL",
    VEDLEGG_TITTEL = "VEDLEGG_TITTEL",
    INGEN_VEDLEGG = "INGEN_VEDLEGG"
}

interface VedtaksFeil {
    type: VedtaksFeiltype;
    id?: string;
}

interface OwnProps {
    onFattVedtak: (vedtak: vedtakFattet) => void;
}

interface ReduxProps {
    filreferanselager: Filreferanselager
    hendelser: Hendelse[];
}

type Props = OwnProps & ReduxProps & DispatchProps

interface State {
    isOpen: boolean;
    isValid: boolean;
    nyttVedtak: vedtakFattetExtended;
    feil: VedtaksFeil[];
    editVedleggIdx: number | undefined;
    valgtLagringssted: string;
    visLeggTilVedlegg: boolean;
    lagerlokasjonsvalg: FilreferanseType | undefined;
    vedleggOptionsValg: FilreferanseType | undefined;
}


const initialState: State = {
    // FIXME: Husk å fjern denne. Lagt til kun for å lettere utvikle vedtakFattet.
    isOpen: true,
    isValid: true,
    nyttVedtak: {...nyttVedtakTemplate},
    feil: [],
    editVedleggIdx: undefined,
    valgtLagringssted: '',
    visLeggTilVedlegg: false,
    lagerlokasjonsvalg: undefined,
    vedleggOptionsValg: undefined
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

        if (listOfFeil.length === 0 &&
            nyttVedtak.utfall.utfall &&
            nyttVedtak.vedtaksfil.referanse
        ) {
            const vedtaksfilUpdated: Svarut | Dokumentlager = convertToFilreferanse(nyttVedtak.vedtaksfil.referanse);
            const vedleggUpdated: Vedlegg[] = convertToListOfVedlegg(nyttVedtak.vedlegg);


            const nyttVedtakFattet: vedtakFattet = {
                type: HendelseType.vedtakFattet,
                hendelsestidspunkt: getNow(),
                saksreferanse: nyttVedtak.saksreferanse,
                utfall: {utfall: nyttVedtak.utfall.utfall},
                vedtaksfil: {referanse: vedtaksfilUpdated},
                vedlegg: vedleggUpdated
            };

            this.props.onFattVedtak(nyttVedtakFattet);
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
            default: {
                nyttVedtak.utfall.utfall = undefined;
            }
        }
        this.setState({nyttVedtak: nyttVedtak, isValid: true});
    }

    handleSelectSaksReferanse(saksReferanseString: string) {
        const nyttVedtak: vedtakFattetExtended = {...this.state.nyttVedtak};
        nyttVedtak.saksreferanse = saksReferanseString;
        this.setState({
            nyttVedtak: nyttVedtak,
            isValid: true
        });
    }

    removeVedleggFromList(vedleggIdx: number) {
        const nyttVedtak = {...this.state.nyttVedtak};
        const vedleggUpdated: (SvarutExtended | DokumentlagerExtended)[] = nyttVedtak.vedlegg.map(vedlegg => vedlegg);
        vedleggUpdated.splice(vedleggIdx, 1);
        nyttVedtak.vedlegg = vedleggUpdated;
        this.setState({
            nyttVedtak: nyttVedtak,
            editVedleggIdx: undefined
        })
    }

    harFeilAvType(type: VedtaksFeiltype) {
        return this.state.feil.filter(feil => {
            return feil.type === type;
        }).length > 0;
    }

    getFeilmeldingForSaksreferanse() {
        const nyttVedtak = this.state.nyttVedtak;
        if (nyttVedtak.saksreferanse === "") {
            return "En gyldig sak må velges."
        } else {
            return "Denne saken har allerede fått et vedtak knyttet til seg."
        }
    }


    render() {
        const {hendelser} = this.props;
        const {nyttVedtak} = this.state;
        const alleSaksStatuser: saksStatus[] = getAllSaksStatuser(hendelser);
        const harSaker: boolean = alleSaksStatuser.length > 0;

        const optionsSaksreferanse: JSX.Element[] = alleSaksStatuser.map((saksStatus: saksStatus) => {
            return (
                <option value={saksStatus.referanse}>{saksStatus.tittel} (saksreferanse: {saksStatus.referanse},
                    status: {saksStatus.status})</option>
            )
        });

        const insertVedleggContent: () => JSX.Element = () => {
            const nyttVedtak = {...this.state.nyttVedtak};
            const {visLeggTilVedlegg} = this.state;
            const {svarutlager, dokumentlager} = this.props.filreferanselager;
            const {vedleggOptionsValg} = this.state;


            const vedleggsOversiktJsx = nyttVedtak.vedlegg.map((vedlegg: (SvarutExtended | DokumentlagerExtended), idx) => {
                return (
                    <div>
                        <div>Tittel: {vedlegg.tittel}</div>
                        <button onClick={() => this.removeVedleggFromList(idx)}><span
                            className="glyphicon glyphicon-remove" aria-hidden="true"/></button>
                    </div>
                )
            });

            const radios = [
                {label: 'Svarut', value: FilreferanseType.svarut},
                {label: 'Dokumentlager', value: FilreferanseType.dokumentlager}
            ];

            return (
                <div>
                    <h4>Diverse vedlegg som skal følge vedtaket kan legges til her:</h4>
                    {vedleggsOversiktJsx}
                    <div>
                        {visLeggTilVedlegg && (
                            <div>
                                <select onChange={(evt) => {
                                    switch (evt.target.value) {
                                        case "svarut": {this.setState({vedleggOptionsValg: FilreferanseType.svarut}); break;}
                                        case "dokumentlager": {this.setState({vedleggOptionsValg: FilreferanseType.dokumentlager}); break;}
                                        default: {this.setState({vedleggOptionsValg: undefined}); break;}
                                    }
                                }}>
                                    <option selected={(vedleggOptionsValg === undefined)} value={''}>Velg lagrings sted</option>
                                    <option selected={vedleggOptionsValg === FilreferanseType.svarut} value={FilreferanseType.svarut}>svarut</option>
                                    <option selected={vedleggOptionsValg === FilreferanseType.dokumentlager} value={FilreferanseType.dokumentlager}>dokumentlager</option>
                                </select>
                                <select onChange={(evt) => {
                                    const nyttVedtakUpdated = {...this.state.nyttVedtak};
                                    const vedleggslisteUpdated = this.state.nyttVedtak.vedlegg.map(v => v);
                                    const filreferanse: SvarutExtended | DokumentlagerExtended | undefined = getFilreferanseExtended(evt.target.value, this.props.filreferanselager);
                                    if (filreferanse){
                                        vedleggslisteUpdated.push(filreferanse);
                                        nyttVedtakUpdated.vedlegg = vedleggslisteUpdated;
                                        this.setState({nyttVedtak: nyttVedtakUpdated, visLeggTilVedlegg: false, vedleggOptionsValg: undefined});
                                    }
                                }}>
                                    { vedleggOptionsValg !== undefined &&
                                        <option value={''}>Velg fil som skal legges ved</option>
                                    }
                                    {vedleggOptionsValg === FilreferanseType.svarut && svarutlager.map((s: SvarutExtended) => {
                                        return <option value={s.id}>{s.tittel}</option>
                                    })}
                                    {vedleggOptionsValg === FilreferanseType.dokumentlager && dokumentlager.map((s: DokumentlagerExtended) => {
                                        return <option value={s.id}>{s.tittel}</option>
                                    })}
                                </select>

                                <button className={"btn btn-danger"} onClick={() => this.setState({visLeggTilVedlegg: false})}>
                                    <span className={"glyphicon glyphicon-remove"} aria-hidden="true"/>
                                </button>
                            </div>

                        )}
                        {!visLeggTilVedlegg && (
                            <button
                                onClick={() => {this.setState({visLeggTilVedlegg: true})}}
                                className={"btn btn-primary"}>
                                <span className="glyphicon glyphicon-plus" aria-hidden="true"/>
                            </button>
                        )}
                    </div>
                </div>
            );
        };

        const insertOptionsVedtaksfil = () => {

            const {nyttVedtak} = this.state;
            const ref: SvarutExtended | DokumentlagerExtended | undefined = nyttVedtak.vedtaksfil.referanse;
            let options: JSX.Element[] = [];

            if (this.state.valgtLagringssted === FilreferanseType.svarut) {
                options = this.props.filreferanselager.svarutlager.map((svarut: SvarutExtended) => {
                    return <option value={svarut.id}>Tittel: {svarut.tittel} . Id: {svarut.tittel}</option>
                })
            }
            if (this.state.valgtLagringssted === FilreferanseType.dokumentlager) {
                options = this.props.filreferanselager.dokumentlager.map((dokumentlager: DokumentlagerExtended) => {
                    return <option value={dokumentlager.id}>Tittel: {dokumentlager.tittel} . Id: {dokumentlager.tittel}</option>
                })
            }
            console.warn("valgt vedtaksfil: " + JSON.stringify(nyttVedtak.vedtaksfil.referanse, null, 4));
            return (
                <Select
                    label={'Filreferanse'}
                    onChange={(evt) => {
                        console.warn('value: ' + evt.target.value);
                        const nyttVedtakUpdated = {...nyttVedtak};
                        const filreferanse: SvarutExtended | DokumentlagerExtended | undefined = getFilreferanseExtended(evt.target.value,this.props.filreferanselager)
                        nyttVedtakUpdated.vedtaksfil.referanse = filreferanse;
                        this.setState({nyttVedtak: nyttVedtakUpdated})
                    }}
                    selected={nyttVedtak.vedtaksfil.referanse ? nyttVedtak.vedtaksfil.referanse.id : ''}
                >
                    <option selected={ref === undefined} value={''}>Velg vedtaksfil</option>
                    {options}
                </Select>
            )
        };

        const harSakerContent: JSX.Element = (
            <>
                {/*Velg saksreferanse*/}
                <Select
                    feil={!this.state.isValid && this.harFeilAvType(VedtaksFeiltype.SAKS_REFERANSE) ? {feilmelding: this.getFeilmeldingForSaksreferanse()} : undefined}
                    onChange={(e) => this.handleSelectSaksReferanse(e.target.value)} label='Saksreferanse'>
                    <option value=''>Velg saksreferanse</option>
                    {optionsSaksreferanse}
                </Select>

                {/*Velg utfall*/}
                <Select
                    feil={!this.state.isValid && this.harFeilAvType(VedtaksFeiltype.UTFALL) ? {feilmelding: "Velg et utfall"} : undefined}
                    onChange={e => this.handleSelectUtfall(e.target.value)} label='Utfall'>
                    <option value=''>Velg utfall</option>
                    <option value={"INNVILGET"}>Innvilget</option>
                    <option value={"DELVIS_INNVILGET"}>Delvis innvilget</option>
                    <option value={"AVSLATT"}>Avslått</option>
                    <option value={"AVVIST"}>Avvist</option>
                </Select>

                {/*Vedtaksfil*/}
                <div>
                    <RadioPanelGruppe
                        name="lagringssted"
                        legend="Velg sted hvor filen er lagret"
                        radios={[
                            {label: 'Svarut', value: FilreferanseType.svarut},
                            {label: 'Dokumentlager', value: FilreferanseType.dokumentlager},
                        ]}
                        checked={this.state.valgtLagringssted}
                        onChange={(evt, value) => {
                            const nyttVedtak = {...this.state.nyttVedtak};
                            nyttVedtak.vedtaksfil.referanse = undefined;
                            this.setState({valgtLagringssted: value, nyttVedtak: nyttVedtak})
                        }}
                    />
                    {/*FIXME: */}

                    {
                        this.state.valgtLagringssted === 'svarut'
                        || this.state.valgtLagringssted === 'dokumentlager'
                            ? insertOptionsVedtaksfil() : null
                    }
                </div>


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
                <Panel>
                    <ReactJson src={this.state.nyttVedtak}/>
                </Panel>
            </div>
        )
    }
}

const convertToFilreferanse = (extended: SvarutExtended | DokumentlagerExtended): Svarut | Dokumentlager => {
    switch (extended.type) {
        case FilreferanseType.svarut: {
            return {
                type: FilreferanseType.svarut,
                id: extended.id,
                nr: extended.nr
            } as Svarut;
        }
        default: {
            return {
                type: FilreferanseType.dokumentlager,
                id: extended.id
            } as Dokumentlager
        }
    }
};

const convertToListOfVedlegg = (vedleggsliste: (SvarutExtended | DokumentlagerExtended)[]): Vedlegg[] => {
    return vedleggsliste.map((vedlegg: (SvarutExtended | DokumentlagerExtended)) => {
        return {
            tittel: vedlegg.tittel,
            referanse: convertToFilreferanse(vedlegg)

        } as Vedlegg
    }) as Vedlegg[];
};

const getFilreferanseExtended = (id: string, filreferanselager: Filreferanselager) => {
    let filreferanse: SvarutExtended | DokumentlagerExtended | undefined = filreferanselager.dokumentlager.find((d) => {
        return d.id === id;
    });
    if (filreferanse === undefined){
        filreferanse = filreferanselager.svarutlager.find((d) => {
            return d.id === id;
        });
    }
    return filreferanse;
};


const mapStateToProps = (state: AppState) => ({
    hendelser: state.v2.fiksDigisosSokerJson.sak.soker.hendelser,
    filreferanselager: state.v2.filreferanselager
});

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(FattNyttVedtak);