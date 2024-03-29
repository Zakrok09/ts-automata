import {DFA, Symbol} from "../src";

/**
 * Returns a set of symbols representing a generic alphabet.
 *
 * @returns {Set<Symbol>} - A set of symbols representing the generic alphabet.
 */
function genericAlphabet():Set<Symbol> {
    const alphabet = new Set<Symbol>();
    alphabet.add('a' as Symbol)
    alphabet.add('b' as Symbol)

    return alphabet;
}

/**
 * Creates a valid DFA fixture
 *
 * @constructor
 * @return the created DFA fixture
 */
function genericValidDFA():DFA {
    const dfa = new DFA(genericAlphabet(), "start", false);

    dfa.addStates("1", "2");
    dfa.addState("end", true);

    dfa.addEdge("start", 'a' as Symbol, "start");
    dfa.addEdge("start", 'b' as Symbol, "1");

    dfa.addEdge("1", 'a' as Symbol, "2");
    dfa.addEdge("1", 'b' as Symbol, "1");

    dfa.addEdge("2", 'a' as Symbol, "end");
    dfa.addEdge("2", 'b' as Symbol, "start");

    dfa.addEdge("end", 'a' as Symbol, "end");
    dfa.addEdge("end", 'b' as Symbol, "1");

    return dfa;
}

/**
 * Creates a valid DFA fixture with a single state.
 *
 * @constructor
 * @returns {DFA} - The created DFA fixture.
 */
function genericSingleStateValidDFA():DFA {
    const dfa = new DFA(genericAlphabet(), "start", false);
    dfa.addEdge("start", 'a' as Symbol, "start");
    dfa.addEdge("start", 'b' as Symbol, "start");

    return dfa;
}

/**
 * Generates an invalid DFA fixture.
 *
 * @constructor
 * @returns {DFA} The generated DFA fixture.
 */
function genericInvalidDFA():DFA {
    const dfa = new DFA(genericAlphabet(), "start", false);

    dfa.addStates("1", "2");
    dfa.addState("3", true);

    dfa.addEdge("start", 'a' as Symbol, "3");
    dfa.addEdge("start", 'b' as Symbol, "1");
    dfa.addEdge("1", 'a' as Symbol, "2");
    dfa.addEdge("2", 'b' as Symbol, "start");
    dfa.addEdge("3", 'b' as Symbol, "1");

    return dfa;
}

export default {genericValidDFA, genericSingleStateValidDFA, genericInvalidDFA, genericAlphabet}
