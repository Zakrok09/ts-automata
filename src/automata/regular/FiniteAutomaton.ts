import {RegularState} from "../../states/RegularStates";
import {IllegalArgument} from "../../exceptions/exceptions";
import {Automaton} from "../Automaton";
import {Alphabet} from "../Alphabet";
import {EPSILON, toChar} from "../../types";

export abstract class FiniteAutomaton<TState extends RegularState> extends Automaton<TState> {

    protected constructor(alphabet: Alphabet, startState: TState) {
        super(alphabet, startState);
    }

    /**
     * Add en edge to the Non-deterministic finite automaton.
     * @param stateName the name of the state from which the edge goes.
     * @param inputStr the input of the edge (must be a single char)
     * @param to the destination state or where the edge goes
     * @throws IllegalArgument throws an error
     * if the input character is not part of the alphabet or is longer than a char,
     * the given state does not exist or the destination state does not exist.
     */
    addEdge(stateName: string, inputStr: string, to: string):void {
        if (inputStr.length !== 1) throw new IllegalArgument("Input longer than 1 ")

        let input = toChar(inputStr)
        if (input === EPSILON) throw new IllegalArgument("Epsilon cannot be added to a finite automaton. Use addEpsilonEdge if you are adding it to a NFA")
        this.testSymbolAgainstAlphabet(input);

        const state = this.states.get(stateName);
        if (!state) throw new IllegalArgument(`State ${stateName} does not exist!`);

        const toState = this.states.get(to);
        if (!toState) throw new IllegalArgument(`State ${to} does not exist!`);

        state.insertTransition(input, toState);
    }

    /**
     * Add en edge to the Non-deterministic finite automaton.
     * @param stateName the name of the state from which the edge goes.
     * @param inputs the input of the edge (must be a single char)
     * @param to the destination state or where the edge goes
     * @return true if the edge was successfully added
     * @throws IllegalArgument throws an error
     * if any of the input characters is not part of the alphabet,
     * the given state does not exist or the destination state does not exist.
     */
    addEdges(stateName: string, inputs: string, to: string):void {
        for (let char of inputs) {
            this.addEdge(stateName, char, to);
        }
    }

    /**
     * Get the string representation of the Finite Automaton.
     * @returns The string representation of the Finite Automaton.
     */
    public toString(transitions:string):string {
        let alphabet:string = "";
        this._alphabet.chars.forEach(sym => alphabet += `${sym}, `);
        alphabet = alphabet.trim().slice(0, alphabet.length-2)

        let states:string = "";
        this.states.forEach(state => states += `${state.name}, `);
        states = states.trim().slice(0, states.length-2)

        return `${this.machineType}: {\n\tAlphabet: [${alphabet}]\n\tStates: [${states}]\n\tStarting State: ${this._startState.name}\n\tTransitions:${transitions}\n}`
    }

    /**
     * Returns the start state of the DFA.
     *
     * @return The start state of the DFA.
     */
    get startState():TState {
        return this._startState;
    }

    /**
     * Getter for the alphabet of the Finite Automaton
     *
     * @return the alphabet of the automaton
     */
    get alphabet(): Alphabet {
        return this._alphabet;
    }


    /**
     * Checks if the transition diagram is valid.
     *
     * @abstract
     * @returns True if the transition diagram is valid, otherwise false.
     */
    public abstract isValid():boolean;

    /**
     * Runs the given string against the finite state machine.
     *
     * @abstract
     * @param str The string to be evaluated.
     * @returns Returns true if the string is accepted by the finite state machine, otherwise false.
     */
    public abstract runString(str:string): boolean;
}