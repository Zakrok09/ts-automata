import { DFAState } from "~/states/RegularStates";
import { AutomatonUtil } from "./automata-util";
import {DFA} from "../../regular/DFA";

export class DFAUtil extends AutomatonUtil<DFAState> {

    constructor(automaton: DFA) {
        super(automaton);
    }
    /**
     * Performs a depth-first search to find all states reachable from the start state.
     * @returns Returns a set of all states reachable from the start state.
     */
    private dfs() : Set<DFAState> {
        let stack: DFAState[] = [];
        stack.push(this._automaton._startState);
        let visited : Set<DFAState> = new Set<DFAState>();
        // Perform a depth-first search to check if there is any accepting state reachable from the start state.
        // If we find an accepting state, the language is not empty.
        while (stack.length > 0) {
            let state = stack.pop()!;
            if (visited.has(state)) continue;
            visited.add(state);
            for (let neighbour of state.transitions.values()) {
                stack.push(neighbour);
            }
        }
        return visited;
    }
    /**
     * Checks if the language of the DFA is empty.
     * A DFA's language is empty if there are no accepting states reachable from the start state
     * @returns Returns true if the language of the DFA is empty, otherwise false.
     */
    public isLanguageEmpty(): boolean {
        let visited = this.dfs();
        return Array.from(visited).every(state => !state.accepting);
    }
    /**
     * Checks if the language of the DFA contains all strings(sigma star).
     * A DFA's language contains all strings if all states reachable from the start are accepting state.
     * @returns Returns true if the language of the DFA contains all strings, otherwise false.
     */
    public isLanguageAllStrings(): boolean {
        let visited = this.dfs();
        return Array.from(visited).every(state => state.accepting);
    }
    /**
     * Checks if the language of the DFA contains a specific string.
     * @param word the string to be checked
     * @returns Returns true if the language of the DFA contains the string, otherwise false.
     */
    public doesLanguageContainString(word : string ): boolean {
        return this._automaton.runString(word);
    }
    /**
     * Checks if the language of the DFA is equal to the language of another DFA.
     * @param other the other DFA to compare with
     * @returns Returns true if the languages are equal, otherwise false.
     */
    public equal(other: DFA): boolean {
        return false;
    }
    public union(other: DFA): DFA {
        throw new Error("Union operation is not implemented for DFA.");
    }
    

}