import {DFAState} from "../State";
import {char, toChar} from "../../index";
import {IllegalArgument} from "../../exceptions/exceptions";

/**
 * Represents a deterministic finite automaton.
 *
 * @class DFA
 */
export class DFA {
    private readonly states:Map<string, DFAState>;
    private readonly alphabet:Set<char>;
    private readonly _startState:DFAState;
    private readonly _acceptStates:Set<DFAState>


    /**
     * Represents a constructor for creating a DFA.
     *
     * and the values are corresponding DFAState objects.
     * @param alphabet - The alphabet of the DFA, represented by a Set of strings.
     * @param startState - The start state of the DFA.
     * @param startingAccept - Whether the starting state should be final.
     */
    constructor(alphabet: Set<char>, startState: string, startingAccept: boolean) {
        this.states = new Map<string, DFAState>;
        this.alphabet = alphabet;
        this._acceptStates = new Set<DFAState>()

        let start:DFAState = new DFAState(startState);
        this.states.set(startState, start);
        this._startState = this.states.get(startState)!;

        if (startingAccept) {
            this.startState.accepting = true;
            this.acceptStates.add(start);
        }
    }

    /**
     * Checks if the transition diagram is valid.
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
     * Adds a state to the DFA.
     *
     * @param {string} name - The name of the state to be added.
     * @param {boolean} final - Optional. Specify if the state is a final (accepting) state. Defaults to false.
     */
    public addState(name:string, final?:boolean) {
        let newState:DFAState = new DFAState(name);
        this.states.set(name, newState);

        if (final) {
            newState.accepting = true;
            this.acceptStates.add(newState)
        }
    }

    /**
     * Adds an edge from one state to another based on a given input.
     *
     * @param stateName - The name of the starting state.
     * @param input - The input character triggering the transition.
     * @param to - The name of the state to transition to.
     * @returns Returns true if the transition was successfully added.
     * @throws IllegalArgument - Throws an error if the input character is not part of the alphabet, the starting state does not exist, or the destination state does not exist.
     */
    public addEdge(stateName:string, input:char, to:string):boolean {
        if(!this.alphabet.has(input)) throw new IllegalArgument(`Illegal argument! ${input} not part of alphabet!`)

        const state = this.states.get(stateName);
        if (!state) throw new IllegalArgument(`State ${stateName} does not exist!`);

        const toState = this.states.get(to);
        if (!toState) throw new IllegalArgument(`State ${to} does not exist!`);

        state.insertTransition(input, toState);
        return true;
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
        if(!this.alphabet.has(input)) throw new IllegalArgument(`${input} is not part fo the alphabet of this DFA`)

        const state = this.states.get(stateName);
        if (!state) throw new IllegalArgument(`State ${stateName} does not exist!`);

        return state.removeTransition(input);
    }

    /**
     * Runs the given string against the finite state machine.
     *
     * @param {string} str - The string to be evaluated.
     *
     * @returns {boolean} - Returns true if the string is accepted by the finite state machine, otherwise false.
     */
    public runString(str:string): boolean {
        if (!this.isValid()) return false;

        let currentState:DFAState = this._startState;

        for (let char of str) {
            let c: char = toChar(char);
            currentState = currentState.transition(c);
            if (!currentState) return false;
        }

        return currentState.accepting;
    }

    /**
     * Adds states to the current object. All added states are considered not final
     *
     * @param {...string} names - The names of the states to be added.
     */
    public addStates(...names:string[]) {
        names.forEach(n => this.addState(n, false));
    }

    /**
     * Returns the set of accepting states of the DFA.
     *
     * @return {Set} The Set of accepting states.
     */
    public get acceptStates(): Set<DFAState> {
        return this._acceptStates;
    }

    /**
     * Returns a string representation of the DFA object.
     * @returns The string representation of the DFA object.
     */
    public toString() {
        console.log(`DFA: {Alphabet: ${this.alphabet} \nStates: ${this.states} \nStarting State: ${this.startState}}`)
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