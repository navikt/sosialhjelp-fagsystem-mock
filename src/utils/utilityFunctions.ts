export function mergeListsToLengthN<T> (
    inputList: T[],
    maximumList: T[],
    n: number
): T[] {

    const m: number = inputList.length;
    let outputList: T[];

    if (n < m){
        // Fjern overflødige elementer i lista. Siden det spoles tilbake i tid.
        outputList = inputList.slice(0, n);
    } else {
        // Legg til nye elementer i lista fra komplett liste, men ikke endre de som allerede er der
        const listOfElementsToAdd: T[] = maximumList.slice(m, n);
        outputList = inputList.concat(listOfElementsToAdd);
    }

    return outputList
}


