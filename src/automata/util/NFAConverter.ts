import {DFA} from "../regular/DFA";
import {NFAState} from "../../states/RegularStates";
import {NFA} from "../regular/NFA";
import {char} from "../../types";
import {DFABuilder} from "./builders/automata/DFABuilder";

/**
 * @class Method object for converting NFAs to DFAs
 * @link https://refactoring.guru/replace-method-with-method-object
 */
export class NFAConverter {
    private readonly nfa:NFA;
    private dfaBuilder:DFABuilder;

    /**
     * Constructs a new instance of the class.
     *
     * @param {NFA} nfa - The NFA object to assign to the instance.
     */
    constructor(nfa: NFA) {
        this.nfa = nfa;
        this.dfaBuilder = new DFABuilder(nfa.alphabet.joinToString());
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

        while (statesToProcess.length > 0) {
            const currentBunch = statesToProcess.pop()!;

            this.processStateBunch(currentBunch, statesToProcess)
        }

        return this.dfaBuilder.getResult();
    }

    /**
     * Process the next StateBunch according to the Sipser's algorithm.
     * Extracted method for toDFA conversion.
     *
     * @param currentBunch the currently active set of states in the NFA.
     * @param statesToProcess reference to the stack of states to be processed.
     *
     * @link https://refactoring.guru/extract-method
     */
    private processStateBunch(currentBunch:StateBunch, statesToProcess:StateBunch[]):void {
        let isFinal = currentBunch.hasAnyFinalState();

        if (!this.dfaBuilder.getState(currentBunch.name))
            this.dfaBuilder.addState(currentBunch.name, isFinal)

        for (const symbol of this.nfa.alphabet.chars) {
            this.processNextStateBunch(currentBunch, symbol, statesToProcess);
        }
    }

    /**
     * Process the next StateBunch to be added given a symbol.
     * This would mean handling all the next active states in the NFA on a given symbol, including parsing their
     * epsilon closures.
     *
     * This method will put the next generated StateBunch on the queue for processing.
     *
     * @param currentBunch the currently observed bunch of active states in the algorithm.
     * @param symbol the symbol on which to acquire the new stateBunch.
     * @param statesToProcess reference to the stack of states to be processed.
     */
    private processNextStateBunch(currentBunch:StateBunch, symbol:char, statesToProcess:StateBunch[]):void {
        let nextStates:NFAState[] = currentBunch.giveNextStates(symbol);
        let newStateBunch = new StateBunch(nextStates, this.nfa);

        // Look to see if we've already encountered this set of NFA states as a DFA state.
        let nextDFAState = this.dfaBuilder.getState(newStateBunch.name);

        // If we haven't, make it a new state in the DFA and remember to process it later.
        if (!nextDFAState) {
            statesToProcess.push(new StateBunch(nextStates, this.nfa));
            this.dfaBuilder.addState(newStateBunch.name, newStateBunch.hasAnyFinalState())
        }

        this.dfaBuilder.addEdge(currentBunch.name, symbol, newStateBunch.name)
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
    name:string;

    constructor(states: NFAState[], nfa:NFA) {
        this.states = states;
        this.nfa = nfa;
        this.name = this.stateName(states)
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
        let res = states.map(s => "{"+s.name+"}")
            .sort((a, b) => a.localeCompare(b)).join('');
        return res.trim() === "" ? "dead-state" : res;
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