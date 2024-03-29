import {char, toChar} from "../../index";
import {FiniteAutomaton} from "./FiniteAutomaton";
import {DFAState} from "../../states/RegularStates";
import {IllegalArgument, IllegalAutomatonState} from "../../exceptions/exceptions";

/**
 * Represents a deterministic finite automaton.
 *
 * @extends FiniteAutomaton with DFAState.
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
    constructor(alphabet: Set<char>, startState: string, startingAccept: boolean) {
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
        for (let state of this.states.values()) {
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
     * @param {char} input - The input character of the edge to be removed.
     *
     * @returns {boolean} - True if the edge is successfully removed, false otherwise.
     *
     * @throws {IllegalArgument} if the input character is not part of the alphabet of this DFA.
     * @throws {IllegalArgument} if the state does not exist.
     */
    public removeEdge(stateName:string, input:char):boolean {
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
            let c: char = toChar(char);
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
        let alphabet:string = "";
        this.alphabet.forEach(sym => alphabet += `${sym}, `);
        alphabet = alphabet.trim().slice(0, alphabet.length-2)

        let states:string = "";
        this.states.forEach(state => states += `${state.name}, `);
        states = states.trim().slice(0, states.length-2)

        return `DFA: {\n\tAlphabet: [${alphabet}]\n\tStates: [${states}]\n\tStarting State: ${this.startState.name}\n}`
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