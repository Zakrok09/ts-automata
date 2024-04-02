import {RegularState} from "../../states/RegularStates";
import {IllegalArgument} from "../../exceptions/exceptions";
import {Automaton} from "../Automaton";
import {Alphabet} from "../Alphabet";
import {char, EPSILON, toChar} from "../../types";

export abstract class FiniteAutomaton<TState extends RegularState> implements Automaton {
    protected readonly states:Map<string, TState>;
    protected readonly alphabet:Alphabet;
    protected readonly _startState:TState;
    protected readonly _acceptStates:Set<TState>

    protected constructor(alphabet: Alphabet, startState:TState) {
        this.states = new Map<string, TState>;
        this.alphabet = alphabet;
        this._acceptStates = new Set<TState>()

        this._startState = startState;
        this.states.set(startState.name, startState);
    }

    /**
     * Returns the set of accepting states of the DFA.
     * @return The Set of accepting states.
     */
    public get acceptStates(): Set<TState> {
        return this._acceptStates;
    }

    /**
     * Retrieves the state associated with the specified name.
     *
     * @param name The name of the state to retrieve.
     * @return The state associated with the specified name, or undefined if not found.
     */
    public getState(name:string):TState|undefined {
        return this.states.get(name);
    }

    /**
     * Test the symbol against the alphabet. This method throws an exception if the alphabet does not
     * recognise the symbol.
     *
     * @protected
     * @param input the symbol to be tested
     * @throws IllegalArgument if the symbol is not part of the alphabet
     */
    protected testSymbolAgainstAlphabet(input:char){
        if(!this.alphabet.has(input)) throw new IllegalArgument(`${input} is not part fo the alphabet of this finite automaton`)
    }

    /**
     * Inserts a state to the Finite Automaton. Protected method.
     * Each extending class of finite automata shall implement its own addState method.
     *
     * @param newState - The name of the state to be added.
     * @param final - Optional. Specify if the state is a final (accepting) state. Defaults to false.
     */
    protected insertState(newState:TState, final?:boolean) {
        this.states.set(newState.name, newState);

        if (final) {
            newState.accepting = true;
            this._acceptStates.add(newState)
        }
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
     * Add en edge to the Non-deterministic finite automaton.
     * @param stateName the name of the state from which the edge goes.
     * @param inputStr the input of the edge.
     * @param to the destination state or where the edge goes
     * @return true if the edge was successfully added
     * @throws IllegalArgument Throws an error if the input character is not part of the alphabet,
     * the given state does not exist, or the destination state does not exist.
     */
    addEdge(stateName: string, inputStr: string, to: string): boolean {
        let input = toChar(inputStr)
        if (input === EPSILON) throw new IllegalArgument("Epsilon cannot be added to a finite automaton. Use addEpsilonEdge if you are adding it to a NFA")
        this.testSymbolAgainstAlphabet(input);

        const state = this.states.get(stateName);
        if (!state) throw new IllegalArgument(`State ${stateName} does not exist!`);

        const toState = this.states.get(to);
        if (!toState) throw new IllegalArgument(`State ${to} does not exist!`);

        state.insertTransition(input, toState);
        return true;
    }

    /**
     * Get the string representation of the Finite Automaton.
     * @returns The string representation of the Finite Automaton.
     */
    public toString(transitions:string):string {
        let alphabet:string = "";
        this.alphabet.chars.forEach(sym => alphabet += `${sym}, `);
        alphabet = alphabet.trim().slice(0, alphabet.length-2)

        let states:string = "";
        this.states.forEach(state => states += `${state.name}, `);
        states = states.trim().slice(0, states.length-2)

        return `${this.machineType}: {\n\tAlphabet: [${alphabet}]\n\tStates: [${states}]\n\tStarting State: ${this._startState.name}\n\tTransitions:${transitions}\n}`
    }

    /**
     * Get the type of the machine as a string.
     * @returns The type of the automaton as a string.
     */
    public abstract get machineType():string;

    /**
     * Add state method. Each finite automata class shall implement its own logic of adding states.
     *
     * @abstract
     * @param name
     * @param final
     */
    public abstract addState(name:string, final?:boolean):void;

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