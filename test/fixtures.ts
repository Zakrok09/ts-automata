import {DFA, DFABuilder, NFA} from "../src";
import {NFABuilder} from "../src/automata/util/builders/automata/NFABuilder";
import {PDA} from "../src/automata/context-free/PDA";
import {PDAState} from "../src/states/PDAState";
import {Alphabet, EPSILON, EMPTY} from "../src/automata";
import {GNFA} from "../src/automata/regular/GNFA";
import {TM} from "../src/automata/non-context-free/TM";
import { TMState } from "../src/states/TMState";
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

function genericPDA():PDA {
    let start = new PDAState("q1")
    start.accepting = true;
    let pda = new PDA(Alphabet.fromString("10"), Alphabet.fromString("10$"), start)

    pda.addStates(false, "q2", "q3")
    pda.addState("q4", true)

    pda.addEdge("q1", EPSILON, EPSILON, "$", "q2")
    pda.addEdge("q2", "0", EPSILON, "0", "q2")
    pda.addEdge("q2", "1", "0", EPSILON, "q3")
    pda.addEdge("q3", "1", "0", EPSILON, "q3")
    pda.addEdge("q3", EPSILON, "$", EPSILON, "q4")

    return pda;
}
function mediumTM(): TM{
    // The language of words that do not have 2 a’s directly following each other.
    // Image of TM in : https://imgur.com/a/LpS5aI3
    // This TM doesn't halt if it doesn't accept the string.
    let start = new TMState("start");
    start.accepting = false;
    let tm = new TM(Alphabet.fromString("ab"), Alphabet.fromString("ab"), start);
    tm.addState("qacc",false,true);
    tm.addState("middle",false,false);
    tm.addEdge("start","a",EMPTY,'L',"start");
    tm.addEdge("start","b","b",'R',"start");
    tm.addEdge("start",EMPTY,EMPTY,'R',"middle");
    tm.addEdge("middle","a","a",'L',"start");
    tm.addEdge("middle","b","b",'R',"start");
    tm.addEdge("middle",EMPTY,EMPTY,'R',"qacc");

    return tm;

}

function simpleNDTM(): TM {
    // Recognizes the language of words with that start with "a".
    // Image of TM in : https://imgur.com/a/uEUgDq2
    let start = new TMState("start");
    start.accepting = false;
    let tm = new TM(Alphabet.fromString("ab"), Alphabet.fromString("ab"), start);
    tm.addState("qacc", false, true);
    tm.addState("qreject", true,false);
    tm.addEdge("start", "a", EMPTY, 'R', "qacc");
    tm.addEdge("start", "a", EMPTY, 'R', "qreject");
    return tm;
}

function equalAandB() : TM {
    // Recognizes the language of words with equal number of a's and b's.
    // TM from : https://www.geeksforgeeks.org/theory-of-computation/design-a-turing-machine-for-equal-number-of-as-and-bs/
    // Changed Slightly because of the fixed tape on the left.
    // Image of TM in : https://imgur.com/a/wwwa56I
    let start = new TMState("q5");
    start.accepting = false;
    let tm = new TM(Alphabet.fromString("ab"), Alphabet.fromString("abXS"), start);
    
    tm.addState("q4", false, true);
    tm.addState("q0", false, false);
    tm.addState("q1", false, false);
    tm.addState("q2", false, false);
    tm.addState("q3", false, false);
    tm.addEdge("q0","X","X",'R',"q0")
    tm.addEdge("q0",EMPTY,EMPTY,'R',"q4")
    tm.addEdge("q0","a","X",'R',"q1")
    tm.addEdge("q0","b","X",'R',"q2")

    tm.addEdge("q1","a","a",'R',"q1")
    tm.addEdge("q1","X","X",'R',"q1")
    tm.addEdge("q1","b","X",'L',"q3")

    tm.addEdge("q2","b","b",'R',"q2")
    tm.addEdge("q2","X","X",'R',"q2")
    tm.addEdge("q2","a","X",'L',"q3")

    tm.addEdge("q3","X","X",'L',"q3")
    tm.addEdge("q3","a","a",'L',"q3")
    tm.addEdge("q3","b","b",'L',"q3")
    tm.addEdge("q3","S","S",'R',"q0")

    tm.addEdge("q5","a","S",'R',"q1")
    tm.addEdge("q5","b","S",'R',"q2")
    tm.addEdge("q5",EMPTY,EMPTY,'R',"q4")


    return tm;
}

function genericGNFA():GNFA {
    let gnfa = new GNFA("ab", "start", "end")

    gnfa.insertStates("q1", "q2")

    gnfa.addEdge("start", "q1", EPSILON)
    gnfa.addEdge("q1", "q1", "a")
    gnfa.addEdge("q1", "q2", "b")
    gnfa.addEdge("q2", "q2", "a|b")
    gnfa.addEdge("q2", "end", EPSILON)

    return gnfa;
}

export default {equalAandB,simpleNDTM,mediumTM,genericValidDFA, genericSingleStateValidDFA, genericEpsilonNFALargerAlphabet, genericInvalidDFA, genericEpsilonNFA, genericNFA, genericPDA, genericGNFA}
