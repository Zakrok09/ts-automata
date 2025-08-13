import { DFAUtil } from "./DFA-util";
import { EPSILON } from "../../../types";
import { NFA } from "../../regular/NFA";
import { NFAConverter } from "../NFAConverter";
import { NFAState } from "~/states/RegularStates";
import { RegularAutomatonUtil } from "./finite-automata-util";
import { NFACombinator } from "../NFACombinationToDFA";
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
        return new NFACombinator(automaton, other, "OR").toDFA().toNFA();
    }

    /**
     * Creates an NFA that recognizes the words that both NFAs recognize
     * @param automaton Automaton that recognizes a language L1
     * @param other Automaton that recognizes a language L2
     * @param util DFA util object
     * @returns Automaton that recognizes L1 intersection L2
     */
    public intersection(automaton: NFA, other: NFA, util = new DFAUtil()): NFA {
        return new NFACombinator(automaton, other, "AND").toDFA().toNFA();
    }
    /**
     * Function to change the names of the states of an NFA
     * @param automaton The NFA
     * @param func The function to do the change with for each state name
     * @returns The nfa with the function applied to all state names
     */
    public mapStateNames(automaton: NFA, func: (name: string) => string): NFA {
        const statesOfThisNFA = this.dfs(automaton);
        const newNFA = new NFA(
            automaton.alphabet.joinToString(),
            func(automaton.startState.name),
            automaton.startState.accepting
        );
        for (const state of statesOfThisNFA) {
            newNFA.addState(func(state.name), state.accepting);
        }
        statesOfThisNFA.forEach(state =>
            state.transitions.forEach((nextStates, symbol) =>
                nextStates.forEach(nextState => {
                    const toWithPrefix = func(nextState.name);
                    const fromWithPrefix = func(state.name);
                    if (symbol === EPSILON) {
                        newNFA.addEpsilonEdge(fromWithPrefix, toWithPrefix);
                    } else {
                        newNFA.addEdge(fromWithPrefix, symbol, toWithPrefix);
                    }
                })
            )
        );

        return newNFA;
    }
    /**
     * Method to add the states and transitions of an nfa to another
     * WARNING: State names must be unique otherwise may give weird behaviour
     * @param automaton The NFA
     * @param other The other NFA
     * @returns An NFA that has the states and transitions of both. The start state is of the first NFA
     */
    public addToNFA(automaton: NFA, other: NFA): NFA {
        const newNFA = automaton.copy();
        const statesOfOtherNFA = this.dfs(other);
        statesOfOtherNFA.forEach(state => newNFA.addState(state.name, state.accepting));
        statesOfOtherNFA.forEach(state =>
            state.transitions.forEach((nextStates, symbol) =>
                nextStates.forEach(nextState => {
                    this.addEdgeWithPossibleEpsilon(newNFA, state.name, nextState.name, symbol);
                })
            )
        );
        return newNFA;
    }
    /**
     * Helper method to add edges without caring about EPSILON rules
     * @param automaton The automaton
     * @param from The state the edge is from
     * @param to The state the edge is to
     * @param symbol The symbol, can be EPSILON.
     */
    private addEdgeWithPossibleEpsilon(automaton: NFA, from: string, to: string, symbol: string) {
        if (symbol === EPSILON) {
            automaton.addEpsilonEdge(from, to);
        } else {
            automaton.addEdge(from, symbol, to);
        }
    }
}
