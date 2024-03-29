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

    dfa.addEdge("start", 'a' as char, "start");
    dfa.addEdge("start", 'b' as char, "1");

    dfa.addEdge("1", 'a' as char, "2");
    dfa.addEdge("1", 'b' as char, "1");

    dfa.addEdge("2", 'a' as char, "end");
    dfa.addEdge("2", 'b' as char, "start");

    dfa.addEdge("end", 'a' as char, "end");
    dfa.addEdge("end", 'b' as char, "1");

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
    dfa.addEdge("start", 'a' as char, "start");
    dfa.addEdge("start", 'b' as char, "start");

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

    dfa.addEdge("start", 'a' as char, "3");
    dfa.addEdge("start", 'b' as char, "1");
    dfa.addEdge("1", 'a' as char, "2");
    dfa.addEdge("2", 'b' as char, "start");
    dfa.addEdge("3", 'b' as char, "1");

    return dfa;
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

    nfa.addEdge("2", 'a', "2");
    nfa.addEdge("2", 'b', "2");
    nfa.addEdge("2", 'a', "end");

    return nfa;
}

export default {genericValidDFA, genericSingleStateValidDFA, genericInvalidDFA, genericEpsilonNFA, genericNFA}
