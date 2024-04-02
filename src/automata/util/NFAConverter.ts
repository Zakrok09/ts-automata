import {DFA} from "../regular/DFA";
import {DFAState, NFAState} from "../../states/RegularStates";
import {NFA} from "../regular/NFA";
import {char} from "../../types";

/**
 * @class Method object for converting NFAs to DFAs
 * @link https://refactoring.guru/replace-method-with-method-object
 */
export class NFAConverter {
    private readonly nfa:NFA;

    // TODO Substitute this for a builder to handle the awkward case of creating a DFA and it being undefined first.
    private dfa:DFA|undefined;

    /**
     * Constructs a new instance of the class.
     *
     * @param {NFA} nfa - The NFA object to assign to the instance.
     */
    constructor(nfa: NFA) {
        this.nfa = nfa;
        this.dfa = undefined;
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
        const startStateBunch = new StateBunch(NFA.epsilonClosure([this.nfa.startState]), this.nfa);
        const statesToProcess: StateBunch[] = [startStateBunch];

        let alphabet = this.nfa.alphabet.joinToString();

        while (statesToProcess.length > 0) {
            const currentBunch = statesToProcess.pop()!;
            const currentStateName = this.stateName(currentBunch.states);

            this.processStateBunch(currentBunch, currentStateName, alphabet, statesToProcess)
        }

        return this.dfa!;
    }

    /**
     * Process the next StateBunch that
     * Extracted method for toDFA conversion.
     * @link https://refactoring.guru/extract-method
     */
    private processStateBunch(currentBunch:StateBunch, currentStateName:string, alphabetString:string, statesToProcess:StateBunch[]):void {
        let isFinal = currentBunch.hasAnyFinalState();
        let dfaState = new DFAState(currentStateName);

        if (this.dfa === undefined) {
            // handle the first addition to the DFA, which will create a new DFA.
            this.dfa = new DFA(alphabetString, dfaState.name, isFinal)
        } else if (!this.dfa.getState(currentStateName))
            this.dfa.addState(currentStateName, isFinal)

        for (const symbol of this.nfa.alphabet.chars) {
            this.handleNextStateBunch(currentBunch, currentStateName, symbol, statesToProcess);
        }
    }

    /**
     * Handle the next StateBunch to be added given a symbol.
     * This would mean handling all the next active states in the NFA on a given symbol, including parsing their
     * epsilon closures.
     *
     * This method will put the next generated StateBunch on the queue for processing.
     * @private
     */
    private handleNextStateBunch(currentBunch:StateBunch, currentStateName:string, symbol:char, statesToProcess:StateBunch[]):void {
        let nextStates:NFAState[] = currentBunch.giveNextStates(symbol);
        const nextStateName = this.stateName(nextStates);

        // Look to see if we've already encountered this set of NFA states as a DFA state.
        let nextDFAState = this.dfa?.getState(nextStateName);

        // If we haven't, make it a new state in the DFA and remember to process it later.
        if (!nextDFAState) {
            statesToProcess.push(new StateBunch(nextStates, this.nfa));
            this.dfa?.addState(nextStateName, nextStates.some(nfaState => this.nfa.acceptStates.has(nfaState)))
        }

        this.dfa?.addEdge(currentStateName, symbol, nextStateName)
    }
}

/**
 * @class Util class for dealing with groups of active states.
 * A StateBunch is a group of active states in the traversal of a NFA conversion to a DFA
 * using Sipser's algorithm.
 */
class StateBunch {
    states:NFAState[];
    nfa:NFA;

    constructor(states: NFAState[], nfa:NFA) {
        this.states = states;
        this.nfa = nfa;

    }

    /**
     * Checks if any of the states in the state bunch is accepting.
     */
    hasAnyFinalState():boolean {
        return this.states.some(nfaState => this.nfa.acceptStates.has(nfaState));
    }

    /**
     * Gives an array with all the states reachable from any current state.
     * Epsilon closure is applied.
     *
     * @param symbol the input on which to look for.
     * @returns an array with the states reachable from any of the current states,
     * given this input (incl. epsilon closure)
     */
    giveNextStates(symbol:char):NFAState[] {
        let nextStates:NFAState[] = []
        for (const state of this.states) {
            nextStates.push(...state.transition(symbol))
        }

        return NFA.epsilonClosure(nextStates);
    }
}