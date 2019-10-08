import {V3State} from "./v3Types";
import {FsSoknad} from "./v3FsTypes";
import {getInitialFsSoknad} from "./v3InitialFsSoknad";


const initialSoknaderList: FsSoknad[] = [
    getInitialFsSoknad("001", "01018012345", "Admiral Beckett Brass"),
    getInitialFsSoknad("002", "02018023456", "Nary Meha"),
    getInitialFsSoknad("003", "03018034567", "Isareth the Awakener")
];

export const getV3InitialState = (): V3State => {
    return {
        soknader: initialSoknaderList
    }
};