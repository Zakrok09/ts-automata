import {FiniteAutomaton} from "./FiniteAutomaton";
import {DFA, Char, toChar} from "../../index";
import {NFAState} from "../../states/RegularStates";
import {IllegalArgument} from "../../exceptions/exceptions";

/**
 * Class representation of a non-deterministic finite automaton.
 *
 * @extends FiniteAutomaton with NFAState.
 */
export class NFA extends FiniteAutomaton<NFAState> {

    /**
     * Constructs a finite automaton given an alphabet and a starting state. Applies to
     * all types of finite automatas defined: DFA, NFA and GNFA.
     *
     * @param alphabet the alphabet of the automaton. Should not change throughout execution.
     * @param startState the name of the starting state.
     * @param startingAccept whether the starting state should accept.
     */
    public constructor(alphabet: Set<Char>, startState: string, startingAccept: boolean) {
        let start:NFAState = new NFAState(startState);
        super(alphabet, start);

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
     * Remove an edge from the NFA.
     *
     * @param stateName the name of the state from which the edge shall be removed
     * @param input the symbol to specify the edge.
     * @param to the destination state as in a NFA there can be multiple edges with the
     * same input symbol and state from which they come out of.
     */
    removeEdge(stateName:string, input:Char, to:string) {
        this.testSymbolAgainstAlphabet(input);

        const state = this.states.get(stateName);
        if (!state) throw new IllegalArgument(`State ${stateName} does not exist!`);

        const dest = this.states.get(to);
        if (!dest) throw new IllegalArgument(`State ${stateName} does not exist!`);

        return state.removeTransition(input, dest);
    };

    /**
     * Runs the given string against the finite state machine.
     *
     * @abstract
     * @param str The string to be evaluated.
     * @returns Returns true if the string is accepted by the finite state machine, otherwise false.
     */
    runString(str: string): boolean {
        let activeStates: NFAState[] = [this._startState];

        while (str.length > 0 && activeStates.length > 0) {
            const symbol = toChar(str[0]);
            str = str.slice(1);
            const nextStates: NFAState[] = [];
            for (const state of activeStates) {
                const transitions = state.transition(symbol);
                nextStates.push(...transitions);
            }
            activeStates = nextStates;
        }

        return activeStates.some(state => this._acceptStates.has(state));
    }

    /**
     * TODO: Implement
     *
     * Convert a NFA to a DFA
     *
     * @return a DFA of the NFA using Sipper's algorithm.
     */
    public toDFA(): DFA {
        throw new Error("Method not implemented.");
    }

    /**
     * TODO: Implement
     */
    public toString(): string {
        throw new Error("Method not implemented.");
    }

    /**
     * TODO: Implement
     */
    isValid(): boolean {
        return true;
    }
}