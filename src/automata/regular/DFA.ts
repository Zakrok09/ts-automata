import {Symbol, toChar} from "../../index";
import {FiniteAutomaton} from "./FiniteAutomaton";
import {DFAState, NFAState} from "../../states/RegularStates";
import {IllegalArgument, IllegalAutomatonState} from "../../exceptions/exceptions";

/**
 * Represents a deterministic finite automaton.
 *
 * @class DFA
 */
export class DFA extends FiniteAutomaton<DFAState> {

    /**
     * Represents a constructor for creating a DFA.
     * and the values are corresponding DFAState objects.
     *
     * @param alphabet - The alphabet of the DFA, represented by a Set of strings.
     * @param startState - The start state of the DFA.
     * @param startingAccept - Whether the starting state should accept.
     */
    constructor(alphabet: Set<Symbol>, startState: string, startingAccept: boolean) {
        let start:DFAState = new DFAState(startState);
        super(alphabet, start);

        if (startingAccept) {
            this._startState.accepting = true;
            this._acceptStates.add(start);
        }
    }

    /**
     * Checks if the DFA transition diagram is valid.
     *
     * @returns True if the transition diagram is valid, otherwise false.
     */
    public isValid():boolean {
        for (let [key, state] of this.states) {
            if (state.getInputAlphabet().size !== this.alphabet.size) {
                return false;
            }
        }
        return true;
    }

    /**
     * Add a state to the DFA
     *
     * @param name The name of the state
     * @param final Whether the state is final or not.
     * Defaults to false.
     */
    addState(name: string, final?: boolean): void {
        super.insertState(new DFAState(name), final);
    }

    /**
     * Removes an edge from a DFA state.
     *
     * @param {string} stateName - The name of the state.
     * @param {Symbol} input - The input character of the edge to be removed.
     *
     * @returns {boolean} - True if the edge is successfully removed, false otherwise.
     *
     * @throws {IllegalArgument} if the input character is not part of the alphabet of this DFA.
     * @throws {IllegalArgument} if the state does not exist.
     */
    public removeEdge(stateName:string, input:Symbol):boolean {
        this.testSymbolAgainstAlphabet(input);

        const state = this.states.get(stateName);
        if (!state) throw new IllegalArgument(`State ${stateName} does not exist!`);

        return state.removeTransition(input);
    }

    /**
     * Runs the given string against the finite state machine.
     *
     * @param str The string to be evaluated.
     * @returns Returns true if the string is accepted by the finite state machine, otherwise false.
     * @throws IllegalAutomatonState if the DFA is in an invalid state, running any string on it will
     * result in a runtime error being thrown.
     */
    public runString(str:string): boolean {
        if (!this.isValid()) throw new IllegalAutomatonState('The DFA is not valid. Cannot run string.');

        let currentState:DFAState = this._startState;

        for (let char of str) {
            let c: Symbol = toChar(char);
            currentState = currentState.transition(c);
            if (!currentState) return false;
        }

        return currentState.accepting;
    }

    /**
     * Returns a string representation of the DFA.
     * @returns The string representation of the DFA.
     */
    public toString() {
        return `DFA: {Alphabet: ${this.alphabet} \nStates: ${this.states} \nStarting State: ${this.startState}}`
    }

    /**
     * Returns the start state of the DFA.
     *
     * @return {DFAState} The start state of the DFA.
     */
    get startState(): DFAState {
        return this._startState;
    }
}