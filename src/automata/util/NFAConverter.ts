import {DFA} from "../regular/DFA";
import {DFAState, NFAState} from "../../states/RegularStates";
import {NFA} from "../regular/NFA";

/**
 * @class Method object for converting NFAs to DFAs
 * @link https://refactoring.guru/replace-method-with-method-object
 */
export class NFAConverter {
    private readonly nfa:NFA;

    /**
     * Constructs a new instance of the class.
     *
     * @param {NFA} nfa - The NFA object to assign to the instance.
     */
    constructor(nfa: NFA) {
        this.nfa = nfa;
    }

    /**
     * Get the name of a state.
     *
     * @param states An array of NFAState objects representing the states.
     *
     * @returns The name of the state.
     * If the state name is empty, returns "dead-state".
     */
    private stateName(states: NFAState[]): string {
        let res = states.map(s => s.name)
            .sort((a, b) => a.localeCompare(b)).join('-');
        return res.trim() === "" ? "dead-state" : res;
    }

    /**
     * Convert a NFA to a DFA.
     * Conversion is done
     * using the algorithm described by Micheal Sipser in his book "Introduction to the Theory of Computation"
     *
     * @return a DFA of the NFA using Sipper's algorithm.
     */
    public toDFA(): DFA {

        // Create the start state.
        const startStateBunch = new StateBunch(NFA.epsilonClosure([this.nfa.startState]));
        const statesToProcess: StateBunch[] = [startStateBunch];

        let alphabet = this.nfa.alphabet.joinToString();
        let dfa:DFA|undefined = undefined;

        while (statesToProcess.length > 0) {
            const currentBunch = statesToProcess.pop()!;
            const currentStateName = this.stateName(currentBunch.states);

            let isFinal =
                currentBunch.states.some(nfaState => this.nfa.acceptStates.has(nfaState));

            // Add the 'current' state to the 'all states' set.
            let dfaState = new DFAState(currentStateName);

            if (dfa === undefined) {
                dfa = new DFA(alphabet, dfaState.name, isFinal)
            } else if (!dfa.getState(currentStateName))
                dfa.addState(currentStateName, isFinal)

            for (const symbol of this.nfa.alphabet.chars) {
                // The next state is the epsilon-closure of the set of all states we can reach
                // on this symbol from any active NFA state.
                let nextStates:NFAState[] = []
                for (const state of currentBunch.states) {
                    nextStates.push(...state.transition(symbol))
                }
                nextStates = NFA.epsilonClosure(nextStates);

                // We call it the combination of all the states
                const nextStateName = this.stateName(nextStates);

                // Look to see if we've already encountered this set of NFA states as a DFA state.
                let nextDFAState = dfa?.getState(nextStateName);

                // If we haven't, make it a new state in the DFA and remember to process it later.
                if (!nextDFAState) {
                    nextDFAState = new DFAState(nextStateName);
                    statesToProcess.push(new StateBunch(nextStates));
                    dfa?.addState(nextStateName, nextStates.some(nfaState => this.nfa.acceptStates.has(nfaState)))
                }

                dfa?.addEdge(currentStateName, symbol, nextStateName)
            }
        }

        return dfa!;
    }
}

/**
 * @class Util class for dealing with groups of states.
 */
class StateBunch {
    states:NFAState[];

    constructor(states: NFAState[]) {
        this.states = states;
    }
}