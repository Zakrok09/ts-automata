import Fixtures from "../../fixtures";
import { describe, expect, it } from "vitest";

describe("NFA to DFA converter", () => {
    it("should correctly convert NFA with no present epsilons to DFA", () => {
        const nfa = Fixtures.genericNFA();
        const dfa = nfa.toDFA();

        expect(dfa.isValid()).toBe(true);

        expect(dfa.runString("a")).toBe(false);
        expect(dfa.runString("aa")).toBe(true);
        expect(dfa.runString("ba")).toBe(false);
        expect(dfa.runString("aabbb")).toBe(false);
        expect(dfa.runString("abbbba")).toBe(true);
    });

    it("should correctly convert NFA with epsilons to DFA", () => {
        const enfa = Fixtures.genericEpsilonNFA();
        const dfa = enfa.toDFA();

        expect(dfa.isValid()).toBe(true);

        expect(dfa.runString("")).toBe(true);
        expect(dfa.runString("ab")).toBe(true);
        expect(dfa.runString("aba")).toBe(false);
        expect(dfa.runString("a")).toBe(false);
        expect(dfa.runString("b")).toBe(true);
        expect(dfa.runString("ba")).toBe(true);
        expect(dfa.runString("baa")).toBe(true);
    });

    it("should correctly convert NFA with epsilons to DFA with larger alphabet", () => {
        const enfa = Fixtures.genericEpsilonNFALargerAlphabet();
        const dfa = enfa.toDFA();

        expect(dfa.isValid()).toBe(true);
        expect(dfa.runString("")).toBe(false);
        expect(dfa.runString("ba")).toBe(true);
        expect(dfa.runString("abcdccaa")).toBe(true);
        expect(dfa.runString("acadabc")).toBe(true);
        expect(dfa.runString("acad")).toBe(true);
        expect(dfa.runString("cab")).toBe(false);
    });
});
