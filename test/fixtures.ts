import {DFA, DFABuilder, NFA} from "../src";
import {NFABuilder} from "../src/automata/util/builders/automata/NFABuilder";

/**
 * Creates a valid DFA fixture
 *
 * @constructor
 * @return the created DFA fixture
 */
function genericValidDFA():DFA {
    return new DFABuilder("ab")
        .withNotFinalStates("start", "1", "2")
        .withFinalStates("end")

        .withEdges.from("start").toSelf().over("a")
        .withEdges.from("start").to("1").over("b")

        .withEdges.from("1").to("2").over("a")
        .withEdges.from("1").toSelf().over("b")

        .withEdges.from("2").to("end").over("a")
        .withEdges.from("2").to("start").over("b")

        .withEdges.from("end").toSelf().over("a")
        .withEdges.from("end").to("1").over("b")
        .getResult();
}

/**
 * Creates a valid DFA fixture with a single state.
 *
 * @constructor
 * @returns {DFA} - The created DFA fixture.
 */
function genericSingleStateValidDFA():DFA {
    return new DFABuilder("ab")
        .withNotFinalStates("start")
        .withEdges.from("start").toSelf().over("ab")
        .getResult()
}

/**
 * Generates an invalid DFA fixture.
 *
 * @constructor
 * @returns {DFA} The generated DFA fixture.
 */
function genericInvalidDFA():DFA {
    return new DFABuilder("ab")
        .withNotFinalStates("start", "1", "2", "3")
        .withEdges.from("start").to("3").over("a")
        .withEdges.from("start").to("1").over("b")
        .withEdges.from("1").to("2").over("a")
        .withEdges.from("2").to("start").over("b")
        .withEdges.from("3").to("1").over("b")
        .getResult()
}

function genericEpsilonNFALargerAlphabet():NFA {
    return new NFABuilder("abcd")
        .withNotFinalStates("start", "q1", "q3", "q4")
        .withFinalStates("end","q2")

        .withEdges.from("start").toSelf().over("a")
        .withEdges.from("start").to("q1").epsilon()
        .withEdges.from("start").to("q3").epsilon()

        .withEdges.from("q1").to("q3").over("b")

        .withEdges.from("q2").toSelf().over("c")
        .withEdges.from("q2").to("start").epsilon()

        .withEdges.from("q3").to("q4").over("c")
        .withEdges.from("q3").to("end").over("ab")

        .withEdges.from("q4").to("q2").over("d")
        .withEdges.from("q4").to("end").over("d")
        .withEdges.from("q4").toSelf().over("ab")

        .withEdges.from("end").to("end").over("abc")

        .getResult()
}

function genericEpsilonNFA():NFA {
    return new NFABuilder("ab")
        .withNotFinalStates("start", "1", "11", "2", "22")
        .withFinalStates("3","33","end")

        .withEdges.from("start").to("1").epsilon()
        .withEdges.from("start").to("11").epsilon()
        .withEdges.from("11").to("end").epsilon()

        .withEdges.from("1").to("2").over("a")
        .withEdges.from("2").to("3").over("b")

        .withEdges.from("11").to("22").over("b")
        .withEdges.from("22").toSelf().over("a")
        .withEdges.from("22").to("33").over("a")

        .withEdges.from("end").toSelf().over("b")
        .getResult()
}

function genericNFA():NFA {
    return new NFABuilder("ab")
        .withNotFinalStates("start", "1", "2")
        .withFinalStates("end")
        .withEdges.from("start").to("1").over("a")
        .withEdges.from("start").to("2").over("a")
        .withEdges.from("2").toSelf().over("ab")
        .withEdges.from("2").to("end").over("a")
        .getResult()
}

export default {genericValidDFA, genericSingleStateValidDFA, genericEpsilonNFALargerAlphabet, genericInvalidDFA, genericEpsilonNFA, genericNFA}
