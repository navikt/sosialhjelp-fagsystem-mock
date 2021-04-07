import React from 'react';
import Hendelse, { FiksDigisosSokerJson, SoknadsStatusType } from '../types/hendelseTypes';

import { getAllSaksStatuser } from '../utils/utilityFunctions';
import { HentetFsSoknad } from '../redux/types';
import { createFsSoknadFromHendelser } from './hentSoknadUtils';

it('adds a FsSoknadObject to state based on DigisosSokerJson', () => {

    const dokKrav = {
        'dokumentasjonkravreferanse': 'qufzd0xg-heh7-8olr-tu37-bq70lfdti01e',
        'utbetalingsreferanse': [
            'uvn122qk-ap3y-1v1u-jzeb-4uqo0t4esktq'
        ],
        'beskrivelse': 'Du må kjøpe flere kort til MTG',
        'status': 'IKKE_OPPFYLT',
        'type': 'dokumentasjonkrav',
        'hendelsestidspunkt': '2021-04-07T09:40:04.862Z'
    }

    const sak1 = {
        'referanse': 'hdso93xj-t42m-kx07-dqnb-c5aqb0j8r1az',
        'tittel': 'sak1',
        'type': 'saksStatus',
        'hendelsestidspunkt': '2021-04-07T09:39:37.144Z'
    }

    const sistevedtakSak1 = {
        'saksreferanse': 'hdso93xj-t42m-kx07-dqnb-c5aqb0j8r1az',
        'utfall': 'AVVIST',
        'vedtaksfil': {
            'referanse': {
                'id': '2c75227d-64f8-4db6-b718-3b6dd6beb450',
                'type': 'dokumentlager'
            }
        },
        'vedlegg': [],
        'type': 'vedtakFattet',
        'hendelsestidspunkt': '2021-04-07T09:39:43.510Z'
    }
    const vilkarSak1 = {
        'vilkarreferanse': 'a6dsq1ux-d49v-vqzs-a8qp-bbg2n0v1m4ag',
        'utbetalingsreferanse': [
            'uvn122qk-ap3y-1v1u-jzeb-4uqo0t4esktq'
        ],
        'beskrivelse': 'Du må kjøpe flere kort til MTG',
        'status': 'IKKE_OPPFYLT',
        'type': 'vilkar',
        'hendelsestidspunkt': '2021-04-07T09:40:00.456Z'
    }
    const utbetaling1 = {
        'utbetalingsreferanse': '1gddrq9p-dgfc-577g-dw1j-8ov7ly94fd9m',
        'saksreferanse': 'hdso93xj-t42m-kx07-dqnb-c5aqb0j8r1az',
        'status': 'PLANLAGT_UTBETALING',
        'belop': 1337,
        'beskrivelse': 'Midler til å kjøpe utvidelsespakker til Starcraft',
        'forfallsdato': '2021-04-14',
        'utbetalingsdato': '2021-04-13',
        'fom': '2021-03-31',
        'tom': '2021-03-21',
        'annenMottaker': false,
        'mottaker': 'Jim Raynor',
        'kontonummer': '12345678903',
        'utbetalingsmetode': 'Kronekort',
        'type': 'utbetaling',
        'hendelsestidspunkt': '2021-04-07T09:40:15.306Z'
    }

    const utbetaling2 = {
        'utbetalingsreferanse': 'uvn122qk-ap3y-1v1u-jzeb-4uqo0t4esktq',
        'saksreferanse': 'hdso93xj-t42m-kx07-dqnb-c5aqb0j8r1az',
        'status': 'PLANLAGT_UTBETALING',
        'belop': 1337,
        'beskrivelse': 'Midler til å kjøpe utvidelsespakker til Starcraft',
        'forfallsdato': '2021-04-14',
        'utbetalingsdato': '2021-04-13',
        'fom': '2021-03-31',
        'tom': '2021-03-21',
        'annenMottaker': false,
        'mottaker': 'Jim Raynor',
        'kontonummer': '12345678903',
        'utbetalingsmetode': 'Kronekort',
        'type': 'utbetaling',
        'hendelsestidspunkt': '2021-04-07T09:39:55.690Z'
    }

    const data = {
        'version': '1.0.0',
        'avsender': {
            'systemnavn': 'Testsystemet',
            'systemversjon': '1.0.0'
        },
        'hendelser': [
            {
                'status': 'MOTTATT',
                'type': 'soknadsStatus',
                'hendelsestidspunkt': '2021-04-07T09:37:37.641Z'
            },
            {
                'status': 'FERDIGBEHANDLET',
                'type': 'soknadsStatus',
                'hendelsestidspunkt': '2021-04-07T09:39:27.778Z'
            },
            {
                'status': 'UNDER_BEHANDLING',
                'type': 'soknadsStatus',
                'hendelsestidspunkt': '2021-04-07T09:39:29.491Z'
            },
            sak1,
            {
                'saksreferanse': 'hdso93xj-t42m-kx07-dqnb-c5aqb0j8r1az',
                'utfall': 'DELVIS_INNVILGET',
                'vedtaksfil': {
                    'referanse': {
                        'id': '2c75227d-64f8-4db6-b718-3b6dd6beb450',
                        'type': 'dokumentlager'
                    }
                },
                'vedlegg': [],
                'type': 'vedtakFattet',
                'hendelsestidspunkt': '2021-04-07T09:39:40.910Z'
            },
            sistevedtakSak1,
            utbetaling1,
            utbetaling2,
            vilkarSak1,
            dokKrav,
            {
                'navKontor': '1210',
                'type': 'tildeltNavKontor',
                'hendelsestidspunkt': '2021-04-07T09:40:20.895Z'
            },
            {
                'navKontor': '1208',
                'type': 'tildeltNavKontor',
                'hendelsestidspunkt': '2021-04-07T09:40:22.862Z'
            }
        ]
    } as HentetFsSoknad['data'];

    const fiksDigisosSokerJson = {
        sak: {
            soker: {
                ...data
            }
        },
        type: 'no.nav.digisos.digisos.soker.v1'
    } as FiksDigisosSokerJson


    expect(createFsSoknadFromHendelser(data.hendelser, fiksDigisosSokerJson, 'VxBlk01Kz0a')).toEqual(
        {
            soknadsStatus: {
                'status': 'UNDER_BEHANDLING',
                'type': 'soknadsStatus',
                'hendelsestidspunkt': '2021-04-07T09:39:29.491Z'
            },
            navKontor: {
                'navKontor': '1208',
                'type': 'tildeltNavKontor',
                'hendelsestidspunkt': '2021-04-07T09:40:22.862Z'
            },
            dokumentasjonEtterspurt: undefined,
            forelopigSvar: undefined,
            vilkar: [],
            dokumentasjonkrav: [],
            utbetalingerUtenSaksreferanse: [],
            saker: [{
                ...sak1,
                utbetalinger: [utbetaling1, utbetaling2],
                vedtakFattet: sistevedtakSak1,
                vilkar: [vilkarSak1],
                dokumentasjonskrav: [dokKrav],
            }],
            fiksDigisosId: 'VxBlk01Kz0a',
            fiksDigisosSokerJson: fiksDigisosSokerJson,
        }
    );
});


