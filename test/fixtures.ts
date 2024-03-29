import {char} from "../src/types";
import {DFA} from "../src";
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

export default {genericValidDFA, genericSingleStateValidDFA, genericInvalidDFA}
