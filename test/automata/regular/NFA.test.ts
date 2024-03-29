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

describe("NFA toString", () => {
    it("should correctly print a NFA with no present epsilons", () => {
        let nfa = Fixtures.genericNFA();
        expect(nfa.toString()).toBe("NFA: {\n" +
            "\tAlphabet: [a, b]\n" +
            "\tStates: [start, 1, 2, end]\n" +
            "\tStarting State: start\n" +
            "\tTransitions:\n" +
            "\t\tState: start\n" +
            "\t\t\ta => 1, 2\n" +
            "\t\tState: 1\n" +
            "\t\tState: 2\n" +
            "\t\t\ta => 2, end\n" +
            "\t\t\tb => 2\n" +
            "\t\tState: end\n" +
            "}");
    })

    it("should correctly print a NFA with epsilons", () => {
        let enfa = Fixtures.genericEpsilonNFA();
        expect(enfa.toString()).toBe("NFA: {\n" +
            "\tAlphabet: [a, b]\n" +
            "\tStates: [start, 1, 11, 2, 22, 3, 33, end]\n" +
            "\tStarting State: start\n" +
            "\tTransitions:\n" +
            "\t\tState: start\n" +
            "\t\t\tε => 1, 11\n" +
            "\t\tState: 1\n" +
            "\t\t\ta => 2\n" +
            "\t\tState: 11\n" +
            "\t\t\tε => end\n" +
            "\t\t\tb => 22\n" +
            "\t\tState: 2\n" +
            "\t\t\tb => 3\n" +
            "\t\tState: 22\n" +
            "\t\t\ta => 22, 33\n" +
            "\t\tState: 3\n" +
            "\t\tState: 33\n" +
            "\t\tState: end\n" +
            "\t\t\tb => end\n" +
            "}");
    })
})