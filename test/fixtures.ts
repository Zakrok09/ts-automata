import {DFA, Char} from "../src";

/**
 * Returns a set of symbols representing a generic alphabet.
 *
 * @returns {Set<Char>} - A set of symbols representing the generic alphabet.
 */
function genericAlphabet():Set<Char> {
    const alphabet = new Set<Char>();
    alphabet.add('a' as Char)
    alphabet.add('b' as Char)

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

    dfa.addEdge("start", 'a' as Char, "start");
    dfa.addEdge("start", 'b' as Char, "1");

    dfa.addEdge("1", 'a' as Char, "2");
    dfa.addEdge("1", 'b' as Char, "1");

    dfa.addEdge("2", 'a' as Char, "end");
    dfa.addEdge("2", 'b' as Char, "start");

    dfa.addEdge("end", 'a' as Char, "end");
    dfa.addEdge("end", 'b' as Char, "1");

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
    dfa.addEdge("start", 'a' as Char, "start");
    dfa.addEdge("start", 'b' as Char, "start");

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

    dfa.addEdge("start", 'a' as Char, "3");
    dfa.addEdge("start", 'b' as Char, "1");
    dfa.addEdge("1", 'a' as Char, "2");
    dfa.addEdge("2", 'b' as Char, "start");
    dfa.addEdge("3", 'b' as Char, "1");

    return dfa;
}

export default {genericValidDFA, genericSingleStateValidDFA, genericInvalidDFA, genericAlphabet}
