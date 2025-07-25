import Fixtures from "../../fixtures";
import {describe, it, expect} from "vitest";
import {DFAUtil} from "../../../src/automata/util/automata/DFA-util";
import {DFA} from "../../../src/automata/regular/DFA";

describe("DFAUtil: Empty", () => {
    it("should return true for non-empty DFA", () => {
        let dfa = Fixtures.genericValidDFA();
        let util = new DFAUtil();
        expect(util.isLanguageEmpty(dfa)).toBe(false);
    });
    it("should return true for empty DFA", () => {
        let dfa = Fixtures.genericValidDFA();
        dfa.getState("end")!.accepting = false;
        let util = new DFAUtil();
        expect(util.isLanguageEmpty(dfa)).toBe(true);
    });

    it("should return true for empty DFA, with unreachable accept state", () => {
        let dfa = Fixtures.genericValidDFA();
        dfa.getState("end")!.accepting = false;
        let util = new DFAUtil();
        dfa.addStates(true, "unreachable");
        dfa.addEdges("unreachable", "ab","unreachable")
        expect(util.isLanguageEmpty(dfa)).toBe(true);
        expect(dfa.isValid()).toBe(true);

    });

    it("one state - non-empty language", () => {
        let dfa = new DFA("ab", "start", true)
        dfa.addEdges("start", "ab", "start");
        let util = new DFAUtil();
        expect(util.isLanguageEmpty(dfa)).toBe(false);
        expect(dfa.isValid()).toBe(true);
    });

    it("one state - empty language", () => {
        let dfa = new DFA("ab", "start", false)
        dfa.addEdges("start", "ab", "start");
        let util = new DFAUtil();
        expect(util.isLanguageEmpty(dfa)).toBe(true);
        expect(dfa.isValid()).toBe(true);
    });

    it("non-empty language, empty alphabet", () => {
        let dfa = new DFA("", "start", true)
        dfa.addState("unreachable",true);
        let util = new DFAUtil();
        expect(util.isLanguageEmpty(dfa)).toBe(false);
        expect(dfa.isValid()).toBe(true);
    });

    it("empty language, empty alphabet", () => {
        let dfa = new DFA("", "start", false)
        dfa.addState("unreachable",true);

        let util = new DFAUtil();
        expect(util.isLanguageEmpty(dfa)).toBe(true);
        expect(dfa.isValid()).toBe(true);
    });
});

describe("DFAUtil: All Strings", () => {
    it("genericValidDFA case", () => {
        let dfa = Fixtures.genericValidDFA();
        let util = new DFAUtil();
        expect(util.isLanguageAllStrings(dfa)).toBe(false);
    });

    it("should return false for empty DFA", () => {
        let dfa = Fixtures.genericValidDFA();
        dfa.getState("end")!.accepting = false;
        let util = new DFAUtil();
        expect(util.isLanguageAllStrings(dfa)).toBe(false);
    });

    it("should return false for empty DFA", () => {
        let dfa = new DFA("ab", "start", false)
        // unreachable state
        dfa.addState("unreachable", true);
        dfa.addEdges("start", "ab", "start");
        dfa.addEdges("unreachable", "ab", "unreachable");

        let util = new DFAUtil();
        expect(util.isLanguageAllStrings(dfa)).toBe(false);
        expect(dfa.isValid()).toBe(true);
    });
    it("should return true for trivial DFA", () => {
        let dfa = new DFA("ab", "start", true)
        // unreachable state
        dfa.addState("unreachable", false);
        dfa.addEdges("start", "ab", "start");
        dfa.addEdges("unreachable", "ab", "unreachable");

        let util = new DFAUtil();
        expect(util.isLanguageAllStrings(dfa)).toBe(true);
        expect(dfa.isValid()).toBe(true);
    });



    it("should return true for trivial DFA", () => {
        let dfa = new DFA("ab", "start", true)
        // unreachable state
        dfa.addState("reachable", false);
        dfa.addEdges("start", "a", "start");
        dfa.addEdges("start", "b", "reachable");
        dfa.addEdges("reachable", "ab", "reachable");
        let util = new DFAUtil();
        expect(util.isLanguageAllStrings(dfa)).toBe(false);
        expect(dfa.isValid()).toBe(true);
    });
})
