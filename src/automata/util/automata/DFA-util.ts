import { DFA } from "../../regular/DFA";
import { DFAState } from "~/states/RegularStates";
import { NFA } from "../../regular/NFA";
import { NFAUtil } from "./NFA-util";
import { RegularAutomatonUtil } from "./finite-automata-util";
import { NFACombinator } from "../NFACombinationToDFA";

export class DFAUtil extends RegularAutomatonUtil<DFA> {
    /**
     * Performs a depth-first search to find all states reachable from the start state.
     * @param automaton the automaton to DFS on
     * @returns Returns a set of all states reachable from the start state.
     */
    public dfs(automaton: DFA): Set<DFAState> {
        const stack: string[] = [];
        stack.push(automaton.startState.name);
        const visited: Set<DFAState> = new Set<DFAState>();
        // Perform a depth-first search to check if there is any accepting state reachable from the start state.
        // If we find an accepting state, the language is not empty.
        while (stack.length > 0) {
            const state = automaton.getState(stack.pop()!)!;
            if (visited.has(state)) continue;
            visited.add(state);
            for (const neighbour of state.transitions.values()) {
                stack.push(neighbour.name);
            }
        }
        return visited;
    }

    /**
     * Checks if the language of the DFA is empty.
     * A DFA's language is empty if there are no accepting states reachable from the start state
     * @param automaton the automaton to check
     * @returns Returns true if the language of the DFA is empty, otherwise false.
     */
    public isLanguageEmpty(automaton: DFA): boolean {
        const visited = this.dfs(automaton);
        return Array.from(visited).every(state => !state.accepting);
    }

    /**
     * Checks if the language of the DFA contains all strings(sigma star).
     * A DFA's language contains all strings if all states reachable from the start are accepting state.
     * @param automaton the automaton to check
     * @returns Returns true if the language of the DFA contains all strings, otherwise false.
     */
    public isLanguageAllStrings(automaton: DFA): boolean {
        const visited = this.dfs(automaton);
        return Array.from(visited).every(state => state.accepting);
    }

    /**
     * Checks if the language of the DFA contains a specific string.
     * @param automaton the automaton to check for
     * @param word the string to be checked
     * @returns Returns true if the language of the DFA contains the string, otherwise false.
     */
    public doesLanguageContainString(automaton: DFA, word: string): boolean {
        return automaton.runString(word);
    }

    /**
     * Checks if the language of the DFA is equal to the language of another DFA.
     * @param automaton the first DFA
     * @param other the other DFA to compare with
     * @returns Returns true if the languages are equal, otherwise false.
     */
    public equal(automaton: DFA, other: DFA): boolean {
        const AminB = this.intersection(this.negation(automaton), other);
        const BminA = this.intersection(automaton, this.negation(other));

        return this.isLanguageEmpty(this.union(AminB, BminA));
    }

    /**
     * Return a DFA that accepts the complement of the language of the given DFA
     * @param automaton the dfa to be negated
     * @returns the negated DFA
     */
    public negation(automaton: DFA): DFA {
        const newDFA = automaton.copy();
        this.dfs(newDFA).forEach(state => newDFA.setAccepting(state.name, !state.accepting));
        return newDFA;
    }

    /**
     * Creates an NFA that recognizes the words that either of the DFAs recognize
     * @param automaton Automaton that recognizes a language L1
     * @param other Automaton that recognizes a language L2
     * @param util NFA util object
     * @returns Automaton that recognizes L1 union L2
     */
    public union(automaton: DFA, other: DFA, nfaUtil = new NFAUtil()): DFA {
        return new NFACombinator(automaton.toNFA(), other.toNFA(), "OR").toDFA();
    }

    /**
     * Return a DFA that accepts the intersection of the two languages
     * @param automaton DFA that recognizes a language R1
     * @param other DFA that recognizes a language R2
     * @returns DFA that recognizes words both in R1 and R2
     */
    public intersection(automaton: DFA, other: DFA): DFA {
        return new NFACombinator(automaton.toNFA(), other.toNFA(), "AND").toDFA();
    }

    /**
     * Extend the Alphabet of the DFA
     * @param automaton The DFA
     * @param extendAlphabet the Extened alphabet
     * @param util NFA util
     * @returns The same DFA with the extended alphabet
     */
    public extendAlphabet(automaton: DFA, extendAlphabet: string, util = new NFAUtil()): DFA {
        return util.extendAlphabet(automaton.toNFA(), automaton.alphabet.joinToString() + extendAlphabet).toDFA();
    }

    /**
     * Converts the DFA to an NFA.
     * @param automaton the DFA to be converted
     * @return the converted DFA as NFA
     */
    public toNFA(automaton: DFA): NFA {
        return automaton.toNFA();
    }
}
