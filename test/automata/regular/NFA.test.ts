import {NFA} from "../../../src";
import Fixtures from "../../fixtures";

describe("NFA acceptance testing", () => {
    let nfa:NFA;

    beforeEach(() => {
        nfa = Fixtures.genericNFA();
    })

    it("Should correctly accept a working NFA", () => {
        expect(nfa.runString("a")).toBe(false);
        expect(nfa.runString("aa")).toBe(true);
        expect(nfa.runString("ba")).toBe(false);
        expect(nfa.runString("aabbb")).toBe(false);
        expect(nfa.runString("abbbba")).toBe(true);
    })

    it("should correctly deal with situations where the graph is split", () => {
        expect(nfa.removeEdge("2", 'a', "end")).toBe(true);

        expect(nfa.runString("a")).toBe(false);
        expect(nfa.runString("aa")).toBe(false);
        expect(nfa.runString("ba")).toBe(false);
        expect(nfa.runString("aabbb")).toBe(false);
        expect(nfa.runString("abbbba")).toBe(false);
    })

    it("should correctly deal with epsilon edges", () => {
        let enfa = Fixtures.genericEpsilonNFA();

        expect(enfa.runString("")).toBe(true);

        expect(enfa.runString("ab")).toBe(true);
        expect(enfa.runString("aba")).toBe(false);

        expect(enfa.runString("a")).toBe(false);
        expect(enfa.runString("b")).toBe(true);
        expect(enfa.runString("ba")).toBe(true);
        expect(enfa.runString("baa")).toBe(true);
    })
})

describe("NFA to DFA converter", () => {
    it("should correctly convert NFA with no present epsilons to DFA", () => {
        let nfa = Fixtures.genericNFA();
        let dfa = nfa.toDFA();

        expect(dfa.isValid()).toBe(true);

        expect(dfa.runString("a")).toBe(false);
        expect(dfa.runString("aa")).toBe(true);
        expect(dfa.runString("ba")).toBe(false);
        expect(dfa.runString("aabbb")).toBe(false);
        expect(dfa.runString("abbbba")).toBe(true);
    })

    it("should correctly convert NFA with epsilons to DFA", () => {
        let enfa = Fixtures.genericEpsilonNFA();
        let dfa = enfa.toDFA();

        expect(dfa.isValid()).toBe(true);

        expect(dfa.runString("")).toBe(true);
        expect(dfa.runString("ab")).toBe(true);
        expect(dfa.runString("aba")).toBe(false);
        expect(dfa.runString("a")).toBe(false);
        expect(dfa.runString("b")).toBe(true);
        expect(dfa.runString("ba")).toBe(true);
        expect(dfa.runString("baa")).toBe(true);
    })
})