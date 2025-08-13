import Fixtures from "../../fixtures";
import { describe, it, expect } from "vitest";
import { NFAUtil } from "../../../src/automata/util/automata/NFA-util";
import { NFA } from "../../../src/automata/regular/NFA";
import { NFABuilder } from "../../../src";
import { EPSILON } from "../../../src/types";

describe("NFAUtil: Union", () => {
    it("union two simple nfa", () => {
        let automaton1 = new NFABuilder("a")
            .withNotFinalStates("start")
            .withFinalStates("end")
            .withEdges.from("start")
            .to("end")
            .over("a")
            .getResult();
        let automaton2 = new NFABuilder("ab")
            .withNotFinalStates("start")
            .withFinalStates("end")
            .withEdges.from("start")
            .to("end")
            .over("b")
            .getResult();
        const util = new NFAUtil();
        let unionOfBoth = util.union(automaton1, automaton2);
        expect(unionOfBoth.runString("a")).toBe(true);
        expect(unionOfBoth.runString("b")).toBe(true);
        expect(unionOfBoth.runString("ba")).toBe(false);
    });

    it("negation and union with self equal to sigma *", () => {
        let automaton1 = new NFABuilder("a")
            .withNotFinalStates("start")
            .withFinalStates("end")
            .withEdges.from("start")
            .to("end")
            .over("a")
            .getResult();
        const util = new NFAUtil();
        let unionOfBoth = util.union(automaton1, util.negation(automaton1));
        expect(util.isLanguageAllStrings(unionOfBoth)).toBe(true);
    });
    it("set differenece", () => {
        const util = new NFAUtil();

        let automaton1 = new NFABuilder("a")
            .withNotFinalStates("start")
            .withFinalStates("end")
            .withEdges.from("start")
            .to("end")
            .over("a")
            .getResult();
        automaton1 = util.extendAlphabet(automaton1, "ab");
        let automaton2 = new NFABuilder("ab")
            .withFinalStates("start")
            .withEdges.from("start")
            .to("start")
            .over("ab")
            .getResult();
        let AminusB = util.intersection(automaton2, util.negation(automaton1));
        expect(util.doesLanguageContainString(AminusB, "a")).toBe(false);
        expect(util.doesLanguageContainString(AminusB, "")).toBe(true);
        expect(util.doesLanguageContainString(AminusB, "aa")).toBe(true);
        expect(util.doesLanguageContainString(AminusB, "aba")).toBe(true);
    });
    it("set differenece to empty language", () => {
        let automaton1 = new NFABuilder("a")
            .withNotFinalStates("start")
            .withFinalStates("end")
            .withEdges.from("start")
            .to("end")
            .over("a")
            .getResult();
        let automaton2 = new NFABuilder("a")
            .withFinalStates("start")
            .withEdges.from("start")
            .to("start")
            .over("a")
            .getResult();
        const util = new NFAUtil();
        let AminusB = util.intersection(automaton1, util.negation(automaton2));
        expect(util.doesLanguageContainString(AminusB, "a")).toBe(false);
        expect(util.doesLanguageContainString(AminusB, "")).toBe(false);
        expect(util.doesLanguageContainString(AminusB, "aa")).toBe(false);
        expect(util.isLanguageEmpty(AminusB)).toBe(true);
    });
});

describe("NFAUtil: Intersection", () => {
    it("simple intersection", () => {
        let automaton1 = new NFABuilder("ab")
            .withNotFinalStates("q0", "q1")
            .withFinalStates("q2")
            .withEdges.from("q0")
            .to("q1")
            .over("a")
            .withEdges.from("q1")
            .to("q2")
            .over("a")
            .getResult();
        let automaton2 = new NFABuilder("ab")
            .withNotFinalStates("q0")
            .withFinalStates("q1")
            .withEdges.from("q0")
            .to("q0")
            .over("a")
            .withEdges.from("q0")
            .to("q1")
            .over("a")
            .getResult();
        const util = new NFAUtil();
        let intersected = util.intersection(automaton1, automaton2);

        expect(util.doesLanguageContainString(intersected, "aa")).toBe(true);
        expect(util.doesLanguageContainString(intersected, "aaa")).toBe(false);
    });

    it("complex intersection", () => {
        let automaton1 = Fixtures.genericEpsilonNFALargerAlphabet();
        let automaton2 = Fixtures.genericEpsilonNFA();
        const util = new NFAUtil();
        let intersected = util.intersection(automaton1, automaton2);

        expect(util.doesLanguageContainString(intersected, "ba")).toBe(true);
        expect(util.doesLanguageContainString(intersected, "aaa")).toBe(false);
    });
});
describe("NFAUtil: Empty", () => {
    it("should return true for non-empty NFA", () => {
        const nfa = Fixtures.genericEpsilonNFA();
        const util = new NFAUtil();
        expect(util.isLanguageEmpty(nfa)).toBe(false);
    });
    it("should return true for empty NFA", () => {
        const nfa = Fixtures.genericEpsilonNFA();
        nfa.getState("end")!.accepting = false;
        nfa.getState("3")!.accepting = false;
        nfa.getState("33")!.accepting = false;

        const util = new NFAUtil();
        expect(util.isLanguageEmpty(nfa)).toBe(true);
    });

    it("should return true for smaller language NFA", () => {
        const nfa = Fixtures.genericEpsilonNFA();
        nfa.getState("end")!.accepting = false;
        nfa.getState("33")!.accepting = false;

        const util = new NFAUtil();
        expect(util.isLanguageEmpty(nfa)).toBe(false);
    });

    it("should return true for empty NFA, with unreachable accept state", () => {
        const nfa = Fixtures.genericEpsilonNFA();
        nfa.getState("end")!.accepting = false;
        nfa.getState("3")!.accepting = false;
        nfa.getState("33")!.accepting = false;
        const util = new NFAUtil();
        nfa.addStates(true, "unreachable");
        nfa.addEdges("unreachable", "ab", "unreachable");
        expect(util.isLanguageEmpty(nfa)).toBe(true);
        expect(nfa.isValid()).toBe(true);
    });
    it("should return false for generic NFA", () => {
        const nfa = Fixtures.genericEpsilonNFA();
        const util = new NFAUtil();
        expect(util.isLanguageEmpty(nfa)).toBe(false);
    });

    it("one state - non-empty language", () => {
        const nfa = new NFA("ab", "start", true);
        nfa.addEdges("start", "ab", "start");
        const util = new NFAUtil();
        expect(util.isLanguageEmpty(nfa)).toBe(false);
        expect(nfa.isValid()).toBe(true);
    });

    it("one state - empty language", () => {
        const nfa = new NFA("ab", "start", false);
        nfa.addEdges("start", "ab", "start");
        const util = new NFAUtil();
        expect(util.isLanguageEmpty(nfa)).toBe(true);
        expect(nfa.isValid()).toBe(true);
    });

    it("non-empty language, empty alphabet", () => {
        const nfa = new NFA("", "start", true);
        nfa.addState("unreachable", true);
        const util = new NFAUtil();
        expect(util.isLanguageEmpty(nfa)).toBe(false);
        expect(nfa.isValid()).toBe(true);
    });

    it("empty language, empty alphabet", () => {
        const nfa = new NFA("", "start", false);
        nfa.addState("unreachable", true);

        const util = new NFAUtil();
        expect(util.isLanguageEmpty(nfa)).toBe(true);
        expect(nfa.isValid()).toBe(true);
    });

    it("connected by one epsilon transition", () => {
        const nfa = new NFA("abcdef", "start", false);

        nfa.addState("end", true);
        nfa.addEpsilonEdge("start", "end");
        const util = new NFAUtil();
        expect(util.isLanguageEmpty(nfa)).toBe(false);
        expect(nfa.isValid()).toBe(true);
    });
});

describe("NFAUtil: All", () => {
    it("should return false for generic NFA", () => {
        const nfa = Fixtures.genericEpsilonNFA();
        const util = new NFAUtil();
        expect(util.isLanguageAllStrings(nfa)).toBe(false);
    });

    it("should return true for trivial NFA", () => {
        const nfa = new NFABuilder("abcdef")
            .withFinalStates("start")
            .withNotFinalStates("unreachable")
            .withEdges.from("start")
            .to("start")
            .over("abcdef")
            .getResult();
        const util = new NFAUtil();
        expect(util.isLanguageAllStrings(nfa)).toBe(true);
    });

    it("should return false for trivial NFA", () => {
        const nfa = new NFABuilder("abcdef")
            .withNotFinalStates("start")
            .withFinalStates("unreachable")
            .addEpsilonEdge("unreachable", "start")
            .withEdges.from("start")
            .to("start")
            .over("abcdef")
            .getResult();
        const util = new NFAUtil();
        expect(util.isLanguageAllStrings(nfa)).toBe(false);
    });

    it("should return true for epsilon edge", () => {
        const nfa = new NFABuilder("abcdef")
            .withNotFinalStates("start", "reachable", "unreachable")
            .withFinalStates("end")
            .withEdges.from("start")
            .to("start")
            .over("abcdef")
            .addEpsilonEdge("start", "end")
            .addEpsilonEdge("start", "reachable")
            .getResult();
        const util = new NFAUtil();
        expect(util.isLanguageAllStrings(nfa)).toBe(true);
    });

    it("should return true for always stay at start", () => {
        const nfa = new NFABuilder("abcdef")
            .withFinalStates("start")
            .withNotFinalStates("q0", "q1", "q2")
            .withEdges.from("start")
            .to("start")
            .over("abcdef")
            .withEdges.from("start")
            .to("q1")
            .over("a")
            .withEdges.from("q1")
            .to("q2")
            .over("bc")
            .getResult();
        const util = new NFAUtil();
        expect(util.isLanguageAllStrings(nfa)).toBe(true);
    });
});

describe("NFAUtil: Negation", () => {
    it("empty language", () => {
        const nfa = new NFABuilder("abcdef")
            .withNotFinalStates("start")
            .withFinalStates("unreachable")
            .addEpsilonEdge("unreachable", "start")
            .withEdges.from("start")
            .to("start")
            .over("abcdef")
            .getResult();
        const util = new NFAUtil();
        let negated = util.negation(nfa);
        expect(util.isLanguageAllStrings(negated)).toBe(true);
    });
    it("accepts new string with unused character", () => {
        const nfa = new NFABuilder("abcdef")
            .withNotFinalStates("start")
            .withFinalStates("unreachable")
            .addEpsilonEdge("unreachable", "start")
            .withEdges.from("start")
            .to("start")
            .over("abcde")
            .getResult();
        const util = new NFAUtil();
        let negated = util.negation(nfa);
        expect(util.doesLanguageContainString(negated, "f")).toBe(true);
    });

    it("empty language - complicated", () => {
        const nfa = new NFABuilder("abcdef")
            .withNotFinalStates("start")
            .withNotFinalStates("q0")
            .addEpsilonEdge("q0", "start")
            .addEpsilonEdge("start", "q0")
            .withEdges.from("start")
            .to("start")
            .over("abcdef")
            .getResult();
        const util = new NFAUtil();
        let negated = util.negation(nfa);
        expect(util.isLanguageAllStrings(negated)).toBe(true);
    });

    it("should return empty for negation of all ", () => {
        const nfa = new NFABuilder("abcdef")
            .withNotFinalStates("start", "reachable", "unreachable")
            .withFinalStates("end")
            .withEdges.from("start")
            .to("start")
            .over("abcdef")
            .addEpsilonEdge("start", "end")
            .addEpsilonEdge("start", "reachable")
            .getResult();
        const util = new NFAUtil();
        expect(util.isLanguageEmpty(util.negation(nfa))).toBe(true);
    });

    it("should double negation should be equal to itself", () => {
        const nfa = new NFABuilder("abcdef")
            .withNotFinalStates("start", "reachable", "unreachable")
            .withFinalStates("end")
            .withEdges.from("start")
            .to("start")
            .over("abcdef")
            .addEpsilonEdge("start", "end")
            .addEpsilonEdge("start", "reachable")
            .getResult();
        const util = new NFAUtil();
        expect(util.equal(util.negation(util.negation(nfa)), nfa)).toBe(true);
    });

    it("negation and intersection withself is empty", () => {
        const nfa = Fixtures.genericEpsilonNFALargerAlphabet();
        const util = new NFAUtil();
        let finalNFA = util.intersection(nfa, util.negation(nfa));
        expect(util.isLanguageEmpty(finalNFA)).toBe(true);
    });

    it("negation and union withself is sigma star", () => {
        const nfa = Fixtures.genericNFA();
        const util = new NFAUtil();
        let finalNFA = util.union(nfa, util.negation(nfa));
        expect(util.isLanguageAllStrings(finalNFA)).toBe(true);
    });

    it("should accept words it didn't before and vice versa", () => {
        const nfa = Fixtures.genericEpsilonNFALargerAlphabet();
        const util = new NFAUtil();
        let negated = util.negation(nfa);
        let wordsAccepted = ["c", "ca", "cb"];
        for (let word of wordsAccepted) {
            expect(util.doesLanguageContainString(negated, word)).toBe(true);
            expect(util.doesLanguageContainString(nfa, word)).toBe(false);
        }
        let wordsRejected = ["a", "b", "ba"];
        for (let word of wordsRejected) {
            expect(util.doesLanguageContainString(negated, word)).toBe(false);
            expect(util.doesLanguageContainString(nfa, word)).toBe(true);
        }
    });
});

describe("equals", () => {
    it("copy should be equal to itself", () => {
        let automatons = [
            Fixtures.genericNFA(),
            Fixtures.genericEpsilonNFA(),
            Fixtures.genericEpsilonNFALargerAlphabet()
        ];
        const util = new NFAUtil();
        for (let automaton of automatons) {
            expect(util.equal(automaton, automaton.copy()));
        }
    });
    it("intersection with itself be equal to itself", () => {
        let automatons = [
            Fixtures.genericNFA(),
            Fixtures.genericEpsilonNFA(),
            Fixtures.genericEpsilonNFALargerAlphabet()
        ];
        const util = new NFAUtil();
        for (let automaton of automatons) {
            expect(util.equal(automaton, util.intersection(automaton, automaton.copy())));
        }
    });

    it("should recogonize theoretically not equivalent automata", () => {
        let automaton1 = new NFABuilder("ab")
            .withFinalStates("end")
            .withEdges.from("end")
            .to("end")
            .over("ab")
            .getResult();
        let automaton2 = new NFABuilder("abcdefghi")
            .withFinalStates("q0", "q1")
            .withEdges.from("q0")
            .to("q1")
            .over("a")
            .addEpsilonEdge("q0", "q1")
            .withEdges.from("q1")
            .to("q0")
            .over("b")
            .getResult();
        const util = new NFAUtil();
        expect(util.equal(automaton1, automaton2)).toBe(false);
    });
    it("should recogonize theoretically not equivalent automata ", () => {
        let automaton1 = new NFABuilder("ab")
            .withFinalStates("end")
            .withEdges.from("end")
            .to("end")
            .over("ab")
            .getResult();
        let automaton2 = new NFABuilder("abcdefghi")
            .withFinalStates("q0", "q1")
            .withNotFinalStates("q2")
            .withEdges.from("q0")
            .to("q1")
            .over("a")
            .withEdges.from("q1")
            .to("q0")
            .over("b")
            .withEdges.from("q1")
            .to("q2")
            .over("a")

            .getResult();
        const util = new NFAUtil();
        expect(util.equal(automaton1, automaton2)).toBe(false);
    });
    it("should recogonize theoretically not equivalent automata - small ", () => {
        let automaton1 = new NFABuilder("ab").withFinalStates("a").withEdges.from("a").to("a").over("ab").getResult();
        let automaton2 = new NFABuilder("a")
            .withFinalStates("b", "c")
            .withEdges.from("b")
            .to("c")
            .over("a")
            .getResult();
        const util = new NFAUtil();

        expect(util.equal(automaton1, automaton2)).toBe(false);
    });
    it("should recogonize itself after two transformations", () => {
        let automaton1 = new NFABuilder("ab")
            .withFinalStates("end")
            .withEdges.from("end")
            .to("end")
            .over("ab")
            .getResult();
        const util = new NFAUtil();

        expect(util.equal(automaton1, automaton1.toDFA().toNFA())).toBe(true);
    });
});
