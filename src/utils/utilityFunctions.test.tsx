import React from 'react';
import {mergeListsToLengthN} from "./utilityFunctions";

it('returnerer en liste med riktig komponenter', () => {

    const komplett = ["a", "b", "c", "d", "e", "f"];

    const current1 = ["a", "b"];
    const n1 = 3;
    expect(mergeListsToLengthN(current1, komplett, n1)).toEqual(
        ["a", "b", "c"]
    );

    const current2 = ["a", "b"];
    const n2 = 1;
    expect(mergeListsToLengthN(current2, komplett, n2)).toEqual(
        ["a"]
    );

    const current3 = ["a"];
    const n3 = 6;
    expect(mergeListsToLengthN(current3, komplett, n3)).toEqual(
        ["a", "b", "c", "d", "e", "f"]
    );

    const current4 = ["x", "y", "z"];
    const n4 = 6;
    expect(mergeListsToLengthN(current4, komplett, n4)).toEqual(
        ["x", "y", "z", "d", "e", "f"]
    );
});
