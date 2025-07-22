import {Alphabet} from "../automata/Alphabet";
import {State} from "../states/State";
import {char} from "../types";
import {IllegalArgument} from "../exceptions/exceptions";

/**
 * Represents an automaton that DECIDES a language.
 * Undecidable languages cannot be covered.
 */
export abstract class Automaton<TState extends State> {
    protected readonly states:Map<string, TState>;
    protected readonly _alphabet:Alphabet;
    protected readonly _startState:TState;
    protected readonly _acceptStates:Set<TState>

    protected constructor(alphabet: Alphabet, startState:TState) {
        this.states = new Map<string, TState>;
        this._alphabet = alphabet;
        this._acceptStates = new Set<TState>()

        this._startState = startState;
        this.states.set(startState.name, startState);
    }

    /**
     * Add state method. Each automata class shall implement its own logic of adding states.
     *
     * @abstract
     * @param name
     * @param final
     */
    public abstract addState(name:string, final?:boolean):void;

    /**
     * Executes a given string.
     *
     * @param {string} str - The string to be executed.
     * @return {boolean} - Returns true if the string is accepted, otherwise returns false.
     */
    abstract runString(str:string):boolean

    /**
     * Get the type of the machine as a string.
     * @returns The type of the automaton as a string.
     */
    public abstract get machineType():string;

    /**
     * Adds states to the current object.
     *
     * @param final whether all the states being added are final
     * @param {...string} names - The names of the states to be added.
     */
    public addStates(final:boolean, ...names:string[]) {
        names.forEach(n => this.addState(n, final));
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
     * @param alphabet
     * @throws IllegalArgument if the symbol is not part of the alphabet
     */
    public testSymbolAgainstAlphabet(input:char, alphabet: Alphabet = this._alphabet){
        if(!alphabet.has(input)) throw new IllegalArgument(`${input} is not part of the alphabet of this finite automaton`)
    }

    /**
     * Inserts a state to the Automaton. Protected method.
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
     * Returns the set of accepting states of the DFA.
     * @return The Set of accepting states.
     */
    public get acceptStates(): Set<TState> {
        return this._acceptStates;
    }
}