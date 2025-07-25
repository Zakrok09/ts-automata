import Fixtures from "../../fixtures";
import {describe, it, expect} from "vitest";
import {NFAUtil} from "../../../src/automata/util/automata/NFA-util";
import {NFA} from "../../../src/automata/regular/NFA";
import { NFABuilder } from "../../../src";

describe("NFAUtil: Empty", () => {
    it("should return true for non-empty NFA", () => {
        let nfa = Fixtures.genericEpsilonNFA();
        let util = new NFAUtil();
        expect(util.isLanguageEmpty(nfa)).toBe(false);
    });
    it("should return true for empty NFA", () => {
        let nfa = Fixtures.genericEpsilonNFA();
        nfa.getState("end")!.accepting = false;
        nfa.getState("3")!.accepting = false;
        nfa.getState("33")!.accepting = false;

        let util = new NFAUtil();
        expect(util.isLanguageEmpty(nfa)).toBe(true);
    });

    it("should return true for smaller language NFA", () => {
        let nfa = Fixtures.genericEpsilonNFA();
        nfa.getState("end")!.accepting = false;
        nfa.getState("33")!.accepting = false;

        let util = new NFAUtil();
        expect(util.isLanguageEmpty(nfa)).toBe(false);
    });


    it("should return true for empty NFA, with unreachable accept state", () => {
        let nfa = Fixtures.genericEpsilonNFA();
        nfa.getState("end")!.accepting = false;
        nfa.getState("3")!.accepting = false;
        nfa.getState("33")!.accepting = false;
        let util = new NFAUtil();
        nfa.addStates(true, "unreachable");
        nfa.addEdges("unreachable", "ab","unreachable")
        expect(util.isLanguageEmpty(nfa)).toBe(true);
        expect(nfa.isValid()).toBe(true);

    });
    it("should return false for generic NFA", () => {
        let nfa = Fixtures.genericEpsilonNFA();
        let util = new NFAUtil();
        expect(util.isLanguageEmpty(nfa)).toBe(false);
    });
    
    it("one state - non-empty language", () => {
        let nfa = new NFA("ab", "start", true)
        nfa.addEdges("start", "ab", "start");
        let util = new NFAUtil();
        expect(util.isLanguageEmpty(nfa)).toBe(false);
        expect(nfa.isValid()).toBe(true);
    });

    it("one state - empty language", () => {
        let nfa = new NFA("ab", "start", false)
        nfa.addEdges("start", "ab", "start");
        let util = new NFAUtil();
        expect(util.isLanguageEmpty(nfa)).toBe(true);
        expect(nfa.isValid()).toBe(true);
    });

    it("non-empty language, empty alphabet", () => {
        let nfa = new NFA("", "start", true)
        nfa.addState("unreachable",true);
        let util = new NFAUtil();
        expect(util.isLanguageEmpty(nfa)).toBe(false);
        expect(nfa.isValid()).toBe(true);
    });

    it("empty language, empty alphabet", () => {
        let nfa = new NFA("", "start", false)
        nfa.addState("unreachable",true);

        let util = new NFAUtil();
        expect(util.isLanguageEmpty(nfa)).toBe(true);
        expect(nfa.isValid()).toBe(true);
    });

    it("connected by one epsilon transition", () => {
        let nfa = new NFA("abcdef", "start", false)
        
        nfa.addState("end",true);
        nfa.addEpsilonEdge("start", "end");
        let util = new NFAUtil();
        expect(util.isLanguageEmpty(nfa)).toBe(false);
        expect(nfa.isValid()).toBe(true);
    });
});

describe("NFAUtil: All", () => {
    it("should return false for generic NFA", () => {
        let nfa = Fixtures.genericEpsilonNFA();
        let util = new NFAUtil();
        expect(util.isLanguageAllStrings(nfa)).toBe(false);
    });

    it("should return true for trivial NFA", () => {
        let nfa = new NFABuilder("abcdef")
                    .withFinalStates("start")
                    .withNotFinalStates("unreachable")
                    .withEdges.from("start").to("start").over("abcdef")
                    .getResult()
        let util = new NFAUtil();
        expect(util.isLanguageAllStrings(nfa)).toBe(true);
    });

    it("should return false for trivial NFA", () => {
        let nfa = new NFABuilder("abcdef")
                    .withNotFinalStates("start")
                    .withFinalStates("unreachable")
                    .addEpsilonEdge("unreachable","start")
                    .withEdges.from("start").to("start").over("abcdef")
                    .getResult()
        let util = new NFAUtil();
        expect(util.isLanguageAllStrings(nfa)).toBe(false);
    });
    
    it("should return true for epsilon edge", () => {
        let nfa = new NFABuilder("abcdef")
                    .withNotFinalStates("start","reachable","unreachable")
                    .withFinalStates("end")
                    .withEdges.from("start").to("start").over("abcdef")
                    .addEpsilonEdge("start","end")
                    .addEpsilonEdge("start","reachable")
                    .getResult()
        let util = new NFAUtil();
        expect(util.isLanguageAllStrings(nfa)).toBe(true);
    });

    it("should return true for always stay at start", () => {
        let nfa = new NFABuilder("abcdef")
                    .withFinalStates("start")
                    .withNotFinalStates("q0","q1","q2")
                    .withEdges.from("start").to("start").over("abcdef")
                    .withEdges.from("start").to("q1").over("a")
                    .withEdges.from("q1").to("q2").over("bc")
                    .getResult()
        let util = new NFAUtil();
        expect(util.isLanguageAllStrings(nfa)).toBe(true);
    });
});

describe(("NFAUtil: Negation"), () =>   {
    it("empty language",()=>{
        let nfa = new NFABuilder("abcdef")
                    .withNotFinalStates("start")
                    .withFinalStates("unreachable")
                    .addEpsilonEdge("unreachable","start")
                    .withEdges.from("start").to("start").over("abcdef")
                    .getResult()
        let util = new NFAUtil()
        let negated = util.negation(nfa)
        expect(util.isLanguageAllStrings(negated)).toBe(true)
    })


    it("empty language - complicated",()=>{
        let nfa = new NFABuilder("abcdef")
                    .withNotFinalStates("start")
                    .withNotFinalStates("q0")
                    .addEpsilonEdge("q0","start")
                    .addEpsilonEdge("start","q0")
                    .withEdges.from("start").to("start").over("abcdef")
                    .getResult()
        let util = new NFAUtil()
        let negated = util.negation(nfa)
        expect(util.isLanguageAllStrings(negated)).toBe(true)
    })

    it("should return empty for negation of all ", () => {
        let nfa = new NFABuilder("abcdef")
                    .withNotFinalStates("start","reachable","unreachable")
                    .withFinalStates("end")
                    .withEdges.from("start").to("start").over("abcdef")
                    .addEpsilonEdge("start","end")
                    .addEpsilonEdge("start","reachable")
                    .getResult()
        let util = new NFAUtil();
        expect(util.isLanguageEmpty(util.negation(nfa))).toBe(true);
    });

    it("should double negation should be equal to itself", () => {
        let nfa = new NFABuilder("abcdef")
                    .withNotFinalStates("start","reachable","unreachable")
                    .withFinalStates("end")
                    .withEdges.from("start").to("start").over("abcdef")
                    .addEpsilonEdge("start","end")
                    .addEpsilonEdge("start","reachable")
                    .getResult()
        let util = new NFAUtil();
        expect(util.equal(util.negation(util.negation(nfa)),nfa)).toBe(true);
    });
    
    it("negation and intersection withself is empty", () => {
        let nfa = Fixtures.genericEpsilonNFALargerAlphabet()
        let util = new NFAUtil();
        let finalNFA = util.intersection(nfa,util.negation(nfa))
        console.log(finalNFA)
        expect(util.isLanguageEmpty(finalNFA)).toBe(true);
    });

    it("negation and union withself is sigma star", () => {
        let nfa = Fixtures.genericNFA()
        let util = new NFAUtil();
        let finalNFA = (util.union(nfa,util.negation(nfa)))
        expect(util.isLanguageAllStrings(finalNFA)).toBe(true);
    });

    it("should accept words it didn't before and vice versa",()=>{
        let nfa = Fixtures.genericEpsilonNFALargerAlphabet()
        let util = new NFAUtil()
        let negated = util.negation(nfa)
        let wordsAccepted = ["c","ca","cb"]
        for (let word of wordsAccepted){
            expect(util.doesLanguageContainString(negated,word)).toBe(true)
            expect(util.doesLanguageContainString(nfa,word)).toBe(false)
        }
        let wordsRejected = ["a","b","ba"]
        for (let word of wordsRejected){
            expect(util.doesLanguageContainString(negated,word)).toBe(false)
            expect(util.doesLanguageContainString(nfa,word)).toBe(true)
        }
        

        
    })

    

    
});