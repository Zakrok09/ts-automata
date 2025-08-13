import { DFA } from "../regular/DFA";
import { DFABuilder } from "./builders/automata/DFABuilder";
import { NFA } from "../regular/NFA";
import { NFAState } from "../../states/RegularStates";
import { char, Operator } from "../../types";
import { NFAUtil } from "./automata/NFA-util";

const prefix_for_nfa_one = "1-"
const prefix_for_nfa_two = "2-"
/**
 * @class Method object for converting NFAs to DFAs
 * @link https://refactoring.guru/replace-method-with-method-object
 */
export class NFACombinator {
    private readonly nfa: NFA;
    private readonly other : NFA;
    private readonly combination_operator : Operator
    private readonly nfa_util : NFAUtil
    private dfaBuilder: DFABuilder;

    /**
     * Constructs a new instance of the class.
     *
     * @param {NFA} nfa - The NFA object to assign to the instance.
     */
    constructor(nfa: NFA,other : NFA,combination_operator : Operator, nfa_util  = new NFAUtil()) {
        this.other = other
        this.nfa = nfa;
        this.nfa_util = nfa_util
        this.combination_operator = combination_operator
        this.dfaBuilder = new DFABuilder(nfa.alphabet.joinToString()+other.alphabet.joinToString());
    }

    /**
     * Convert a NFA to a DFA.
     * Conversion is done
     * using the algorithm described by Micheal Sipser in his book "Introduction to the Theory of Computation"
     *
     * @return a DFA of the NFA using Sipper's algorithm.
     */
    public toDFA(): DFA {
        
        const prefix_for_nfa  = this.prefixFunctionGenerator("1-");
        const prefix_for_other  = this.prefixFunctionGenerator("2-");

        const prepended_nfa = this.nfa_util.mapStateNames(this.nfa,prefix_for_nfa);
        const prepended_other = this.nfa_util.mapStateNames(this.other,prefix_for_other);
        
        const combinedAlphabet = this.nfa.alphabet.joinToString()+ this.other.alphabet.joinToString();
        const newStartStateName = "U"
        const startStateAccepting = false;
        let return_nfa = new NFA(combinedAlphabet,newStartStateName,startStateAccepting);
        return_nfa = this.nfa_util.addToNFA(return_nfa,prepended_nfa);
        return_nfa = this.nfa_util.addToNFA(return_nfa,prepended_other);
        const prefixed_nfa_startstate = prefix_for_nfa(this.nfa.startState.name)
        const prefixed_other_startstate = prefix_for_other(this.other.startState.name)

        return_nfa.addEpsilonEdge(newStartStateName,prefixed_nfa_startstate)
        return_nfa.addEpsilonEdge(newStartStateName,prefixed_other_startstate)

        const startStateBunch = new StateBunch(NFA.epsilonClosure([return_nfa.startState]), return_nfa);
        const statesToProcess: StateBunch[] = [startStateBunch];

        while (statesToProcess.length > 0) {
            const currentBunch = statesToProcess.pop()!;
            this.processStateBunch(currentBunch, statesToProcess,return_nfa);
        }

        return this.dfaBuilder.getResult();
    }
    private prefixFunctionGenerator(prefix : string) : (arg0: string) => string {
        return (x=>`${prefix}${x}`)  
    }

    /**
     * Process the next StateBunch according to the Sipser's algorithm.
     * Extracted method for toDFA conversion.
     *
     * @param currentBunch the currently active set of states in the NFA.
     * @param statesToProcess reference to the stack of states to be processed.
     * @param nfa the final nfa to base the transformation upon
     * 
     * @link https://refactoring.guru/extract-method
     */
    private processStateBunch(currentBunch: StateBunch, statesToProcess: StateBunch[],nfa:NFA): void {
        const isFinal = currentBunch.hasAnyFinalState(this.combination_operator);
        if (!this.dfaBuilder.getState(currentBunch.name)) this.dfaBuilder.addState(currentBunch.name, isFinal);

        for (const symbol of nfa.alphabet.chars) {
            this.processNextStateBunch(currentBunch, symbol, statesToProcess,nfa);
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
     * @param nfa the final nfa to base the transformation uğon
     */
    private processNextStateBunch(currentBunch: StateBunch, symbol: char, statesToProcess: StateBunch[],nfa : NFA): void {
        const nextStates: NFAState[] = currentBunch.giveNextStates(symbol);
        const newStateBunch = new StateBunch(nextStates, nfa);

        // Look to see if we've already encountered this set of NFA states as a DFA state.
        const nextDFAState = this.dfaBuilder.getState(newStateBunch.name);

        // If we haven't, make it a new state in the DFA and remember to process it later.
        if (!nextDFAState) {
            statesToProcess.push(new StateBunch(nextStates, nfa));
            this.dfaBuilder.addState(newStateBunch.name, newStateBunch.hasAnyFinalState(this.combination_operator));
        }

        this.dfaBuilder.addEdge(currentBunch.name, symbol, newStateBunch.name);
    }
}

/**
 * @class Util class for dealing with groups of active states.
 * A StateBunch is a group of active states in the traversal of a NFA conversion to a DFA
 * using Sipser's algorithm.
 */
class StateBunch {
    states: NFAState[];
    nfa: NFA;
    name: string;

    constructor(states: NFAState[], nfa: NFA) {
        this.states = states;
        this.nfa = nfa;
        this.name = this.stateName(states);
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
        const res = states
            .map(s => `{${s.name}}`)
            .sort((a, b) => a.localeCompare(b))
            .join("");
        return res.trim() === "" ? "dead-state" : res;
    }

    /**
     * Checks if any of the states in the state bunch is accepting.
     */
    hasAnyFinalState(operator : Operator): boolean {
        const statesFromNFA1 = this.states.filter(x=>x.name.startsWith(prefix_for_nfa_one))
        const statesFromNFA2 = this.states.filter(x=>x.name.startsWith(prefix_for_nfa_two))
        const NFA1_accepting = statesFromNFA1.some(nfaState => nfaState.accepting);
        const NFA2_accepting = statesFromNFA2.some(nfaState => nfaState.accepting);

        switch(operator){
            case "AND" :
                return NFA1_accepting&&NFA2_accepting;
            case  "OR" :
                return NFA1_accepting||NFA2_accepting;
            case "XOR" :
                return NFA1_accepting !== NFA2_accepting;

        }
    }

    /**
     * Gives an array with all the states reachable from any current state.
     * Epsilon closure is applied.
     *
     * @param symbol the input on which to look for.
     * @returns an array with the states reachable from any of the current states,
     * given this input (incl. epsilon closure)
     */
    giveNextStates(symbol: char): NFAState[] {
        const nextStates: NFAState[] = [];
        for (const state of this.states) {
            nextStates.push(...state.transition(symbol));
        }

        return NFA.epsilonClosure(nextStates);
    }
}
