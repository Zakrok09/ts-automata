import { DFAUtil } from "./DFA-util";
import { EPSILON } from "../../../types";
import { NFA } from "../../regular/NFA";
import { NFAConverter } from "../NFAConverter";
import { NFAState } from "~/states/RegularStates";
import { RegularAutomatonUtil } from "./finite-automata-util";

export class NFAUtil extends RegularAutomatonUtil<NFA> {
    /**
     * Performs a depth-first search to find all states reachable from the start state.
     * @param automaton the automaton to do DFS on
     * @returns Returns a set of all states reachable from the start state.
     */
    public dfs(automaton: NFA): Set<NFAState> {
        const stack: NFAState[] = [];
        stack.push(automaton.startState);
        const visited: Set<NFAState> = new Set<NFAState>();
        // Perform a depth-first search to check if there is any accepting state reachable from the start state.
        // If we find an accepting state, the language is not empty.
        while (stack.length > 0) {
            const state = stack.pop()!;
            if (visited.has(state)) continue;
            visited.add(state);
            for (const neighbours of state.transitions.values()) {
                stack.push(...neighbours);
            }
        }
        return visited;
    }

    /**
     * Checks if the language of the DFA is empty.
     * A DFA's language is empty if there are no accepting states reachable from the start state
     * @param automaton automaton to check
     * @returns Returns true if the language of the DFA is empty, otherwise false.
     */
    public isLanguageEmpty(automaton: NFA): boolean {
        const visited = this.dfs(automaton);
        return !Array.from(visited).some(state => state.accepting);
    }

    /**
     * Checks if the language of the DFA contains all strings(sigma star).
     * A DFA's language contains all strings if all states reachable from the start are accepting state.
     * @param automaton automaton to check
     * @param dfaUtil the DFA util
     * @returns Returns true if the language of the DFA contains all strings, otherwise false.
     */
    public isLanguageAllStrings(automaton: NFA, dfaUtil = new DFAUtil()): boolean {
        const transformedToDFA = new NFAConverter(automaton).toDFA();
        return dfaUtil.isLanguageAllStrings(transformedToDFA);
    }

    /**
     * Checks if the language of the DFA contains a specific string.
     * @param automaton the automaton to check
     * @param word the string to be checked
     * @returns Returns true if the language of the DFA contains the string, otherwise false.
     */
    public doesLanguageContainString(automaton: NFA, word: string): boolean {
        return automaton.runString(word);
    }

    /**
     * Get an NFA that recognizes the complement of the language
     * @param automaton An automaton that recognizes a language L1
     * @param util DFA util object
     * @returns An automaton that recognizes all words not in L1
     */
    public negation(automaton: NFA, util = new DFAUtil()): NFA {
        const negated = util.negation(automaton.toDFA());
        return util.toNFA(negated);
    }

    /**
     * Checks if the language of the nFA is equal to the language of another NFA.
     * @param automaton the first NFA
     * @param other the other NFA to compare with
     * @returns Returns true if the languages are equal, otherwise false.
     */
    public equal(automaton: NFA, other: NFA): boolean {
        // First Automaton recgonize a language A and the second a language B
        // If Symmetric difference of A and B is empty, they are equal
        const commonAlphabet = automaton.alphabet.joinToString() + other.alphabet.joinToString();
        const automatonExtendedAlphabet = this.extendAlphabet(automaton, commonAlphabet);
        const otherExtendedAlphabet = this.extendAlphabet(other, commonAlphabet);

        const AminB = this.intersection(automatonExtendedAlphabet, this.negation(otherExtendedAlphabet));
        const BminA = this.intersection(this.negation(automatonExtendedAlphabet), otherExtendedAlphabet);
        const intersection = this.union(AminB, BminA);
        return this.isLanguageEmpty(intersection);
    }

    /**
     * Extending the alphabet of an NFA
     * @param automaton An NFA with an alphabet A
     * @param newAlphabet The new alphabet to extend to
     * @returns The same NFA with a larger alphabet
     */
    public extendAlphabet(automaton: NFA, newAlphabet: string) {
        const resAutomaton = new NFA(newAlphabet, automaton.startState.name, automaton.startState.accepting);
        const states = this.dfs(automaton);
        states.forEach(state => {
            if (!resAutomaton.getState(state.name)) {
                resAutomaton.addState(state.name, state.accepting);
            }
        });
        states.forEach(state => {
            automaton.getState(state.name)!.transitions.forEach((possibleTo, key) =>
                possibleTo.forEach(to => {
                    if (key === EPSILON) {
                        resAutomaton.addEpsilonEdge(state.name, to.name);
                    } else {
                        resAutomaton.addEdge(state.name, key, to.name);
                    }
                })
            );
        });
        return resAutomaton;
    }

    /**
     * Get an NFA that recognizes the union of two NFAs
     * @param automaton Automaton that recognizes a language L1
     * @param other Automaton that recognizes a language L2
     * @returns NFA that recognizes L1 union L2
     */
    public union(automaton: NFA, other: NFA): NFA {
        const thisNFA = automaton;
        const combinedAlphabet = thisNFA.alphabet.joinToString() + other.alphabet.joinToString();
        // Create new start node
        const newStartStateName = "U";
        const newNFA = new NFA(combinedAlphabet, newStartStateName, false);

        const statesOfThisNFA = this.dfs(automaton);
        // All states from the first NFA are marked with 1- and similarly 2- for the other
        // ...this prevents issues with states with same names
        for (const state of statesOfThisNFA) {
            newNFA.addState(`1-${state.name}`, state.accepting);
        }
        const statesOfOtherNFA = this.dfs(other);
        for (const state of statesOfOtherNFA) {
            newNFA.addState(`2-${state.name}`, state.accepting);
        }

        // Procedure from Sipser 2 epsilon edhes
        newNFA.addEpsilonEdge(newStartStateName, `1-${thisNFA.startState.name}`);
        newNFA.addEpsilonEdge(newStartStateName, `2-${other.startState.name}`);

        // Recreate the original edges
        statesOfThisNFA.forEach(state =>
            state.transitions.forEach((nextStates, symbol) =>
                nextStates.forEach(nextState => {
                    if (symbol === EPSILON) {
                        newNFA.addEpsilonEdge(`1-${state.name}`, `1-${nextState.name}`);
                    } else {
                        newNFA.addEdge(`1-${state.name}`, symbol, `1-${nextState.name}`);
                    }
                })
            )
        );
        // Recreate the original edges
        statesOfOtherNFA.forEach(state =>
            state.transitions.forEach((nextStates, symbol) =>
                nextStates.forEach(nextState => {
                    if (symbol === EPSILON) {
                        newNFA.addEpsilonEdge(`2-${state.name}`, `2-${nextState.name}`);
                    } else {
                        newNFA.addEdge(`2-${state.name}`, symbol, `2-${nextState.name}`);
                    }
                })
            )
        );

        return newNFA;
    }

    /**
     * Creates an NFA that recognizes the words that both NFAs recognize
     * @param automaton Automaton that recognizes a language L1
     * @param other Automaton that recognizes a language L2
     * @param util DFA util object
     * @returns Automaton that recognizes L1 intersection L2
     */
    public intersection(automaton: NFA, other: NFA, util = new DFAUtil()): NFA {
        const newDFA = util.intersection(automaton.toDFA(), other.toDFA());
        const newDFAasNFA = util.toNFA(newDFA);
        return newDFAasNFA;
    }
}
