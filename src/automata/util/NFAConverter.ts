import { DFA } from "../regular/DFA";
import { DFABuilder } from "./builders/automata/DFABuilder";
import { NFA } from "../regular/NFA";
import { NFAState } from "../../states/RegularStates";
import { char } from "../../types";
import { NFACombinator } from "./NFACombinationToDFA";

/**
 * @class Method object for converting NFAs to DFAs
 * @link https://refactoring.guru/replace-method-with-method-object
 */
export class NFAConverter {
    private readonly nfaCombinator: NFACombinator;

    /**
     * Constructs a new instance of the class.
     *
     * @param {NFA} nfa - The NFA object to assign to the instance.
     */
    constructor(nfa: NFA) {
        const placeHolderNFA = new NFA("", "", false);
        const operation = "OR";
        this.nfaCombinator = new NFACombinator(nfa, placeHolderNFA, operation);
    }

    /**
     * Convert a NFA to a DFA.
     * Conversion is done
     * using the algorithm described by Micheal Sipser in his book "Introduction to the Theory of Computation"
     *
     * @return a DFA of the NFA using Sipper's algorithm.
     */
    public toDFA(): DFA {
        return this.nfaCombinator.toDFA();
    }
}
