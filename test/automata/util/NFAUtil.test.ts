import Fixtures from "../../fixtures";
import {describe, it, expect} from "vitest";
import {NFAUtil} from "../../../src/automata/util/automata/NFA-util";
import {NFA} from "../../../src/automata/regular/NFA";

describe("NFAUtil: Empty", () => {
    it("should return true for non-empty NFA", () => {
        let nfa = Fixtures.genericEpsilonNFA();
        let util = new NFAUtil(nfa);
        expect(util.isLanguageEmpty()).toBe(false);
    });
    it("should return true for empty NFA", () => {
        let nfa = Fixtures.genericEpsilonNFA();
        nfa.getState("end")!.accepting = false;
        nfa.getState("3")!.accepting = false;
        nfa.getState("33")!.accepting = false;

        let util = new NFAUtil(nfa);
        expect(util.isLanguageEmpty()).toBe(true);
    });

    it("should return true for smaller language NFA", () => {
        let nfa = Fixtures.genericEpsilonNFA();
        nfa.getState("end")!.accepting = false;
        nfa.getState("33")!.accepting = false;

        let util = new NFAUtil(nfa);
        expect(util.isLanguageEmpty()).toBe(false);
    });


    it("should return true for empty NFA, with unreachable accept state", () => {
        let nfa = Fixtures.genericEpsilonNFA();
        nfa.getState("end")!.accepting = false;
        nfa.getState("3")!.accepting = false;
        nfa.getState("33")!.accepting = false;
        let util = new NFAUtil(nfa);
        nfa.addStates(true, "unreachable");
        nfa.addEdges("unreachable", "ab","unreachable")
        expect(util.isLanguageEmpty()).toBe(true);
        expect(nfa.isValid()).toBe(true);

    });

    it("one state - non-empty language", () => {
        let nfa = new NFA("ab", "start", true)
        nfa.addEdges("start", "ab", "start");
        let util = new NFAUtil(nfa);
        expect(util.isLanguageEmpty()).toBe(false);
        expect(nfa.isValid()).toBe(true);
    });

    it("one state - empty language", () => {
        let nfa = new NFA("ab", "start", false)
        nfa.addEdges("start", "ab", "start");
        let util = new NFAUtil(nfa);
        expect(util.isLanguageEmpty()).toBe(true);
        expect(nfa.isValid()).toBe(true);
    });

    it("non-empty language, empty alphabet", () => {
        let nfa = new NFA("", "start", true)
        nfa.addState("unreachable",true);
        let util = new NFAUtil(nfa);
        expect(util.isLanguageEmpty()).toBe(false);
        expect(nfa.isValid()).toBe(true);
    });

    it("empty language, empty alphabet", () => {
        let nfa = new NFA("", "start", false)
        nfa.addState("unreachable",true);

        let util = new NFAUtil(nfa);
        expect(util.isLanguageEmpty()).toBe(true);
        expect(nfa.isValid()).toBe(true);
    });

    it("connected by one epsilon transition", () => {
        let nfa = new NFA("abcdef", "start", false)
        
        nfa.addState("end",true);
        nfa.addEpsilonEdge("start", "end");
        let util = new NFAUtil(nfa);
        expect(util.isLanguageEmpty()).toBe(false);
        expect(nfa.isValid()).toBe(true);
    });
});

describe("NFAUtil: All", () => {
    it("should return true for non-empty NFA", () => {
        let nfa = Fixtures.genericEpsilonNFA();
        let util = new NFAUtil(nfa);
        expect(util.isLanguageAllStrings()).toBe(false);
    });
    
});