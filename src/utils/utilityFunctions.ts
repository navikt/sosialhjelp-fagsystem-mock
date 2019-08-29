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
        // Legg til nye elementer i hendelsePreparedUpdated fra komplett lista
        const listOfElementsToAdd: T[] = maximumList.slice(m, n);
        outputList = inputList.concat(listOfElementsToAdd);
    }


    return outputList
}


