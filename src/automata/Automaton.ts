/**
 * Represents an automaton that can execute a given string.
 */
export interface Automaton {

    /**
     * Executes a given string.
     *
     * @param {string} str - The string to be executed.
     * @return {boolean} - Returns true if the string is accepted, otherwise returns false.
     */
    runString(str:string):boolean
}