import * as React from 'react';
import {RadioPanelGruppe} from "nav-frontend-skjema";
import {HendelseType, SoknadsStatus, SoknadsStatusType} from "../../types/hendelseTypes";
import {getNow} from "../../utils/utilityFunctions";

interface OwnProps {
    currentSoknadsStatus: SoknadsStatusType
    onVelgSoknadsStatus: (soknadsStatus: SoknadsStatus) => void;
}

type Props = OwnProps;

const SoknadsStatus: React.FC<Props> = (props: Props) => {

    return (
        <RadioPanelGruppe
            name="soknadsStatus"
            legend="Endre status på søknaden:"
            radios={[
                {label: 'Mottatt', value: SoknadsStatusType.MOTTATT},
                {label: 'Under behandling', value: SoknadsStatusType.UNDER_BEHANDLING},
                {label: 'Ferdigbehandlet', value: SoknadsStatusType.FERDIGBEHANDLET},
                {label: 'Behandles ikke', value: SoknadsStatusType.BEHANDLES_IKKE}
            ]}
            checked={props.currentSoknadsStatus}
            onChange={(evt, soknadsStatusType: string) => {
                if (
                    soknadsStatusType === SoknadsStatusType.MOTTATT ||
                    soknadsStatusType === SoknadsStatusType.UNDER_BEHANDLING ||
                    soknadsStatusType === SoknadsStatusType.FERDIGBEHANDLET ||
                    soknadsStatusType === SoknadsStatusType.UNDER_BEHANDLING

                ){
                    const nySoknadsStatus: SoknadsStatus = {
                        type: HendelseType.SoknadsStatus,
                        hendelsestidspunkt: getNow(),
                        status: soknadsStatusType
                    };
                    props.onVelgSoknadsStatus(nySoknadsStatus);

                }
            }}
        />
    )
};

export default SoknadsStatus;