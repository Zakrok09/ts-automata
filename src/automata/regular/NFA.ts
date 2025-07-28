import {FiniteAutomaton} from "./FiniteAutomaton";
import {EPSILON, toChar} from "../../types";
import {DFA} from "./DFA";
import {NFAState} from "../../states/RegularStates";
import {IllegalArgument} from "../../exceptions/exceptions";
import {Alphabet} from "../Alphabet";
import {NFAConverter} from "../util/NFAConverter";

/**
 * Nondeterministic finite automaton.
 *
 * @extends FiniteAutomaton with NFAState.
 * @classdesc a NFA is a 5-tuple of its states, alphabet, transition function, starting state
 * and a set of accepting states.
 * It has equivalent power to DFAs and GNFAs.
 * Decides Regular languages.
 * @link https://en.wikipedia.org/wiki/Nondeterministic_finite_automaton
 * @since 0.1.0
 */
export class NFA extends FiniteAutomaton<NFAState> {

    /**
     * Constructs a finite automaton given an alphabet and a starting state. Applies to
     * all types of finite automatas defined: DFA, NFA and GNFA.
     *
     * @param alphabetString the alphabet of the automaton. Should not change throughout execution.
     * @param startState the name of the starting state.
     * @param startingAccept whether the starting state should accept.
     */
    public constructor(alphabetString: string, startState: string, startingAccept: boolean) {
        let start:NFAState = new NFAState(startState);
        super(Alphabet.fromString(alphabetString), start);

        if (startingAccept) {
            this._startState.accepting = true;
            this._acceptStates.add(start);
        }
    }

    /**
     * Adds a state to the NFA.
     *
     * @param {string} name the name of the state.
     * @param {boolean} [final] optional parameter to specify if the state is final.
     */
    addState(name: string, final?: boolean): void {
        super.insertState(new NFAState(name), final);
    }

    /**
     * Adds an epsilon edge from the specified state to the specified state.
     *
     * @param {string} stateName - The name of the state from which the epsilon edge originates.
     * @param {string} to - The name of the state to which the epsilon edge leads.
     */
    public addEpsilonEdge(stateName:string, to:string):void {
        const state = this.states.get(stateName);
        if (!state) throw new IllegalArgument(`State ${stateName} does not exist!`);

        const toState = this.states.get(to);
        if (!toState) throw new IllegalArgument(`State ${to} does not exist!`);

        state.insertTransition(EPSILON, toState);
    }

    /**
     * Remove an edge from the NFA.
     *
     * @param stateName the name of the state from which the edge shall be removed
     * @param input the symbol to specify the edge.
     * @param to the destination state as in a NFA there can be multiple edges with the
     * same input symbol and state from which they come out of.
     */
    public removeEdge(stateName:string, input:string, to:string) {
        let char = toChar(input)
        this.testSymbolAgainstAlphabet(char);

        const state = this.states.get(stateName);
        if (!state) throw new IllegalArgument(`State ${stateName} does not exist!`);

        const dest = this.states.get(to);
        if (!dest) throw new IllegalArgument(`State ${stateName} does not exist!`);

        return state.removeTransition(char, dest);
    };

    /**
     * Runs the given string against the finite state machine.
     *
     * @abstract
     * @param str The string to be evaluated.
     * @returns Returns true if the string is accepted by the finite state machine, otherwise false.
     */
    public runString(str: string): boolean {
        let activeStates = NFA.epsilonClosure([this._startState]);

        while (str.length > 0 && activeStates.length > 0) {
            const symbol = toChar(str[0]);
            str = str.slice(1);
            const nextStates: NFAState[] = [];
            for (const state of activeStates) {
                const transitions = state.transition(symbol);
                nextStates.push(...transitions);
            }
            activeStates = NFA.epsilonClosure(nextStates);
        }

        return activeStates.some(state => this._acceptStates.has(state));
    }

    /**
     * Calculates the epsilon closure of the given states in an NFA.
     *
     * @param {NFAState[]} states - The initial states for which to calculate the epsilon closure.
     * @return {NFAState[]} - An array of NFAStates representing the epsilon closure of the given states.
     */
    public static epsilonClosure(states: NFAState[]): NFAState[] {
        const stack = [...states];
        const closureSet = new Set<NFAState>(stack);
        while (stack.length > 0) {
            const currentState = stack.pop()!;
            const followingStates = currentState.transition(EPSILON);
            followingStates.forEach(state => {
                if (!closureSet.has(state)) {
                    closureSet.add(state);
                    stack.push(state);
                }
            });
        }
        return Array.from(closureSet);
    }

    /**
     * Returns a string representation of the NFA.
     * @returns The string representation of the NFA.
     */
    public toString() {
        let transitions:string = "";
        this.states.forEach(state => {
            let currState = `\n\t\tState: ${state.name}`;

            for (const [input, nextStates] of state.transitions) {
                let nextString = "";
                nextStates.forEach(nextState => nextString += `${nextState.name}, `)
                nextString = nextString.trim().slice(0, nextString.length-2)
                currState += `\n\t\t\t${input} => ${nextString}`
            }

            transitions+=currState;
        })

        return super.toString(transitions);
    }

    /**
     * Returns the machine type of the NFA. The result is always NFA.
     */
    get machineType(): string {
        return "NFA";
    }

    /**
     * Returns whether the NFA is valid.
     */
    isValid(): boolean {
        return true;
    }

    /**
     * Convert a NFA to a DFA.
     * Conversion is done
     * using the algorithm described by Micheal Sipser in his book "Introduction to the Theory of Computation"
     *
     * @return a DFA of the NFA using Sipper's algorithm.
     */
    public toDFA(): DFA {
        const nfaConverter = new NFAConverter(this);
        return nfaConverter.toDFA();
    }

    public copy() : NFA{
        let newNFA = new NFA(this._alphabet.joinToString(),this._startState.name,this._startState.accepting)
        this.states.forEach(state => {if (!newNFA.getState(state.name)){newNFA.addState(state.name,state.accepting)}})
        this.states.forEach(state => state.transitions.keys()
                            .forEach(sym=> state.transitions.get(sym)!
                                .forEach(to => {if (sym==EPSILON){
                                                    newNFA.addEpsilonEdge(state.name,to.name)
                                                }else{
                                                    newNFA.addEdge(state.name,sym,to.name)
                                                }})))
        return newNFA;
    }
}