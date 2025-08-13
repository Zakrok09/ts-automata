import Fixtures from "../../fixtures";
import { describe, expect, it } from "vitest";
import { DFAUtil } from "../../../src/automata/util/automata/DFA-util";
import { DFA } from "../../../src/automata/regular/DFA";
import { DFABuilder } from "../../../src";

describe("DFAUtil: Empty", () => {
    it("should return true for non-empty DFA", () => {
        const dfa = Fixtures.genericValidDFA();
        const util = new DFAUtil();
        expect(util.isLanguageEmpty(dfa)).toBe(false);
    });
    it("should return true for empty DFA", () => {
        const dfa = Fixtures.genericValidDFA();
        dfa.getState("end")!.accepting = false;
        const util = new DFAUtil();
        expect(util.isLanguageEmpty(dfa)).toBe(true);
    });

    it("should return true for empty DFA, with unreachable accept state", () => {
        const dfa = Fixtures.genericValidDFA();
        dfa.getState("end")!.accepting = false;
        const util = new DFAUtil();
        dfa.addStates(true, "unreachable");
        dfa.addEdges("unreachable", "ab", "unreachable");
        expect(util.isLanguageEmpty(dfa)).toBe(true);
        expect(dfa.isValid()).toBe(true);
    });

    it("one state - non-empty language", () => {
        const dfa = new DFA("ab", "start", true);
        dfa.addEdges("start", "ab", "start");
        const util = new DFAUtil();
        expect(util.isLanguageEmpty(dfa)).toBe(false);
        expect(dfa.isValid()).toBe(true);
    });

    it("one state - empty language", () => {
        const dfa = new DFA("ab", "start", false);
        dfa.addEdges("start", "ab", "start");
        const util = new DFAUtil();
        expect(util.isLanguageEmpty(dfa)).toBe(true);
        expect(dfa.isValid()).toBe(true);
    });

    it("non-empty language, empty alphabet", () => {
        const dfa = new DFA("", "start", true);
        dfa.addState("unreachable", true);
        const util = new DFAUtil();
        expect(util.isLanguageEmpty(dfa)).toBe(false);
        expect(dfa.isValid()).toBe(true);
    });

    it("empty language, empty alphabet", () => {
        const dfa = new DFA("", "start", false);
        dfa.addState("unreachable", true);

        const util = new DFAUtil();
        expect(util.isLanguageEmpty(dfa)).toBe(true);
        expect(dfa.isValid()).toBe(true);
    });

    it("genericValidDFA, negation and intersection should be empty", () => {
        const dfa = Fixtures.genericValidDFA();
        const util = new DFAUtil();
        expect(util.isLanguageEmpty(util.intersection(util.negation(dfa), dfa))).toBe(true);
    });
});

describe("DFAUtil: All Strings", () => {
    it("genericValidDFA case", () => {
        const dfa = Fixtures.genericValidDFA();
        const util = new DFAUtil();
        expect(util.isLanguageAllStrings(dfa)).toBe(false);
    });

    it("genericValidDFA, negation and union should be sigma star", () => {
        const dfa = Fixtures.genericValidDFA();
        const util = new DFAUtil();
        expect(util.isLanguageAllStrings(util.union(util.negation(dfa), dfa))).toBe(true);
    });

    it("should return false for empty DFA", () => {
        const dfa = Fixtures.genericValidDFA();
        dfa.getState("end")!.accepting = false;
        const util = new DFAUtil();
        expect(util.isLanguageAllStrings(dfa)).toBe(false);
    });

    it("should return false for empty DFA, trickier", () => {
        const dfa = new DFA("ab", "start", false);
        // Unreachable state
        dfa.addState("unreachable", true);
        dfa.addEdges("start", "ab", "start");
        dfa.addEdges("unreachable", "ab", "unreachable");

        const util = new DFAUtil();
        expect(util.isLanguageAllStrings(dfa)).toBe(false);
        expect(dfa.isValid()).toBe(true);
    });
    it("should return true for trivial DFA", () => {
        const dfa = new DFA("ab", "start", true);
        // Unreachable state
        dfa.addState("unreachable", false);
        dfa.addEdges("start", "ab", "start");
        dfa.addEdges("unreachable", "ab", "unreachable");

        const util = new DFAUtil();
        expect(util.isLanguageAllStrings(dfa)).toBe(true);
        expect(dfa.isValid()).toBe(true);
    });

    it("should return true for trivial DFA", () => {
        const dfa = new DFA("ab", "start", true);
        // Unreachable state
        dfa.addState("reachable", false);
        dfa.addEdges("start", "a", "start");
        dfa.addEdges("start", "b", "reachable");
        dfa.addEdges("reachable", "ab", "reachable");
        const util = new DFAUtil();
        expect(util.isLanguageAllStrings(dfa)).toBe(false);
        expect(dfa.isValid()).toBe(true);
    });
});
describe("DFAUtil: intersection", () => {
    it("simple case", () => {
        const automaton = Fixtures.genericValidDFA();
        const other = new DFABuilder("abcde")
            .withFinalStates("{q0}")
            .withEdges.from("{q0}")
            .to("{q0}")
            .over("abcde")
            .getResult();
        const util = new DFAUtil();
        const intersection = util.intersection(automaton, other);
        expect(util.doesLanguageContainString(intersection, "baaaa")).toBe(true);
        expect(util.doesLanguageContainString(intersection, "bbbb")).toBe(false);
    });
});

describe("DFAUtil: equal", () => {
    it("genericDFA: Negation of itself", () => {
        const automaton = Fixtures.genericValidDFA();
        const util = new DFAUtil();
        expect(util.equal(automaton, util.negation(automaton))).toBe(false);
    });

    it("genericDFA: With different DFA", () => {
        const automaton = Fixtures.genericValidDFA();
        const other = new DFABuilder("abcde")
            .withFinalStates("{q0}")
            .withEdges.from("{q0}")
            .to("{q0}")
            .over("abcde")
            .getResult();
        const util = new DFAUtil();
        expect(util.equal(automaton, other)).toBe(false);
        expect(util.equal(other, automaton)).toBe(false);
    });

    it("Two theoretically equal DFA different DFA", () => {
        // DFAs from https://www.geeksforgeeks.org/theory-of-computation/equivalence-of-f-s-a-finite-state-automata/

        const automaton = new DFABuilder("dc")
            .withFinalStates("q1")
            .withNotFinalStates("q2", "q3")
            .withEdges.from("q1")
            .to("q1")
            .over("c")
            .withEdges.from("q1")
            .to("q2")
            .over("d")
            .withEdges.from("q2")
            .to("q1")
            .over("d")
            .withEdges.from("q2")
            .to("q3")
            .over("c")
            .withEdges.from("q3")
            .to("q2")
            .over("c")
            .withEdges.from("q3")
            .to("q3")
            .over("d")
            .getResult();
        const other = new DFABuilder("cd")
            .withFinalStates("q4")
            .withNotFinalStates("q5", "q6", "q7", "q8")
            .withEdges.from("q4")
            .to("q4")
            .over("c")
            .withEdges.from("q4")
            .to("q5")
            .over("d")

            .withEdges.from("q5")
            .to("q4")
            .over("d")
            .withEdges.from("q5")
            .to("q6")
            .over("c")

            .withEdges.from("q6")
            .to("q6")
            .over("d")
            .withEdges.from("q6")
            .to("q7")
            .over("c")

            .withEdges.from("q7")
            .to("q6")
            .over("c")
            .withEdges.from("q7")
            .to("q4")
            .over("d")
            .getResult();

        const util = new DFAUtil();
        expect(util.equal(automaton, other)).toBe(true);
        expect(util.equal(other, automaton)).toBe(true);
    });
});

describe("DFAUtil: extend Alphabet", () => {
    it("extended to bigger should still be the same DFA", () => {
        const dfas = [
            Fixtures.genericValidDFA(),
            new DFABuilder("abcde").withFinalStates("{q0}").withEdges.from("{q0}").to("{q0}").over("abcde").getResult(),
            new DFABuilder("dc")
                .withFinalStates("q1")
                .withNotFinalStates("q2", "q3")
                .withEdges.from("q1")
                .to("q1")
                .over("c")
                .withEdges.from("q1")
                .to("q2")
                .over("d")
                .withEdges.from("q2")
                .to("q1")
                .over("d")
                .withEdges.from("q2")
                .to("q3")
                .over("c")
                .withEdges.from("q3")
                .to("q2")
                .over("c")
                .withEdges.from("q3")
                .to("q3")
                .over("d")
                .getResult(),
            new DFABuilder("cd")
                .withFinalStates("q4")
                .withNotFinalStates("q5", "q6", "q7", "q8")
                .withEdges.from("q4")
                .to("q4")
                .over("c")
                .withEdges.from("q4")
                .to("q5")
                .over("d")

                .withEdges.from("q5")
                .to("q4")
                .over("d")
                .withEdges.from("q5")
                .to("q6")
                .over("c")

                .withEdges.from("q6")
                .to("q6")
                .over("d")
                .withEdges.from("q6")
                .to("q7")
                .over("c")

                .withEdges.from("q7")
                .to("q6")
                .over("c")
                .withEdges.from("q7")
                .to("q4")
                .over("d")
                .getResult()
        ];
        const util = new DFAUtil();
        dfas.forEach(dfa => expect(util.equal(util.extendAlphabet(dfa, `${dfa.alphabet.joinToString()  }zgmçğ`), dfa)));
    });
});
