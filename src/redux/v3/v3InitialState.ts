import {V3State} from "./v3Types";
import {FsSoknad} from "./v3FsTypes";
import {getInitialFsSoknad} from "./v3InitialFsSoknad";


const initialSoknaderList: FsSoknad[] = [
    getInitialFsSoknad("001", "01018012345", "Admiral Beckett Brass")
];

export const getV3InitialState = (): V3State => {
    return {
        soknader: initialSoknaderList
    }
};