import {char} from "../src/types";
import {DFA, NFA} from "../src";
/**
 * Creates a valid DFA fixture
 *
 * @constructor
 * @return the created DFA fixture
 */
function genericValidDFA():DFA {
    const dfa = new DFA("ab", "start", false);

    dfa.addStates("1", "2");
    dfa.addState("end", true);

    dfa.addEdge("start", 'a', "start");
    dfa.addEdge("start", 'b', "1");

    dfa.addEdge("1", 'a', "2");
    dfa.addEdge("1", 'b', "1");

    dfa.addEdge("2", 'a', "end");
    dfa.addEdge("2", 'b', "start");

    dfa.addEdge("end", 'a', "end");
    dfa.addEdge("end", 'b', "1");

    return dfa;
}

/**
 * Creates a valid DFA fixture with a single state.
 *
 * @constructor
 * @returns {DFA} - The created DFA fixture.
 */
function genericSingleStateValidDFA():DFA {
    const dfa = new DFA("ab", "start", false);
    dfa.addEdges("start", 'ab', "start");

    return dfa;
}

/**
 * Generates an invalid DFA fixture.
 *
 * @constructor
 * @returns {DFA} The generated DFA fixture.
 */
function genericInvalidDFA():DFA {
    const dfa = new DFA("ab", "start", false);

    dfa.addStates("1", "2");
    dfa.addState("3", true);

    dfa.addEdge("start", 'a', "3");
    dfa.addEdge("start", 'b', "1");
    dfa.addEdge("1", 'a', "2");
    dfa.addEdge("2", 'b', "start");
    dfa.addEdge("3", 'b', "1");

    return dfa;
}

function genericEpsilonNFALargerAlphabet():NFA {
    const nfa = new NFA("abcd", "start", false);

    nfa.addStates("q1","q3","q4");
    nfa.addState("end",true);
    nfa.addState("q2", true);

    nfa.addEdge("start", 'a', "start");
    nfa.addEpsilonEdge("start","q1");
    nfa.addEpsilonEdge("start","q3");

    nfa.addEdge("q1", 'b', "q3");

    nfa.addEdge("q2", 'c', "q2");
    nfa.addEpsilonEdge("q2", "start");

    nfa.addEdge("q3", 'c', "q4");
    nfa.addEdges("q3", 'ab', "end");

    nfa.addEdge("q4", 'd', "q2");
    nfa.addEdge("q4", 'd', "end");
    nfa.addEdges("q4", 'ab', "q4");

    nfa.addEdges("end", 'abc', "end");

    return nfa;
}

function genericEpsilonNFA():NFA {
    const nfa = new NFA("ab", "start", false);

    nfa.addStates("1", "11", "2", "22")
    nfa.addState("3", true);
    nfa.addState("33", true);
    nfa.addState("end", true);

    nfa.addEpsilonEdge("start", "1");
    nfa.addEpsilonEdge("start", "11");
    nfa.addEpsilonEdge("11", "end");

    nfa.addEdge("1", "a", "2");
    nfa.addEdge("2", "b", "3");

    nfa.addEdge("11", "b", "22");
    nfa.addEdge("22", "a", "22");
    nfa.addEdge("22", "a", "33");

    nfa.addEdge("end", "b", "end");

    return nfa;
}

function genericNFA():NFA {
    const nfa = new NFA("ab", "start", false);
    nfa.addStates("1", "2");
    nfa.addState("end", true);

    nfa.addEdge("start", 'a', "1");
    nfa.addEdge("start", 'a', "2");

    nfa.addEdges("2", 'ab', "2");
    nfa.addEdge("2", 'a', "end");

    return nfa;
}

export default {genericValidDFA, genericSingleStateValidDFA, genericEpsilonNFALargerAlphabet, genericInvalidDFA, genericEpsilonNFA, genericNFA}
