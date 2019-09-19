import {NavKontor} from "../../../types/additionalTypes";

export const getNavKontorInfoById = (id: string): NavKontor | undefined => {
    // @ts-ignore
    if (navKontorMapper && navKontorMapper[id]){
        // @ts-ignore
        return navKontorMapper[id];
    }
    return undefined;
};

export const navKontorMapper = {
    "1234" : {
        id: 1234,
        name: "Nav Frogner"
    },
    "1337": {
        id: 1337,
        name: "Nav Kautokeino"
    }
};