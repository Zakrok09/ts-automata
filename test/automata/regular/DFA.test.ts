import {Symbol, DFA, toChar} from "../../../src";
import {IllegalArgument} from "../../../src/exceptions/exceptions";

describe("DFA: Running string on DFA", () => {
    // states: q0, q1, q2
    const alphabet = new Set<Symbol>();
    alphabet.add(toChar("a"));
    alphabet.add(toChar("b"));
    const dfa = new DFA(alphabet, "q0", false)

    beforeEach(() => {
        dfa.addState("q1", false);
        dfa.addState("q2", true)
        dfa.addEdge("q0", 'b' as Symbol, "q0");
        dfa.addEdge("q0", 'a' as Symbol, "q1");
        dfa.addEdge("q1", 'a' as Symbol, "q2");
        dfa.addEdge("q1", 'b' as Symbol, "q0");
        dfa.addEdge("q2", 'a' as Symbol, "q2");
        dfa.addEdge("q2", 'b' as Symbol, "q2");
    })

    it("Should parse words correctly", () => {
        expect(dfa.isValid()).toBe(true);
        expect(dfa.runString("ababababaa")).toBe(true);
        expect(dfa.runString("aa")).toBe(true);
        expect(dfa.runString("abb")).toBe(false);
    })

    it("Should empty words", () => {
        expect(dfa.isValid()).toBe(true);
        dfa.startState.accepting = true;
        expect(dfa.runString("")).toBe(true);
    })

    it("Should check for validity correctly", () => {
        expect(dfa.isValid()).toBe(true);
        expect(dfa.removeEdge("q0", 'a' as Symbol)).toBe(true);
        expect(dfa.isValid()).toBe(false);
    })
})

describe('DFA: Validity checking', () => {
    const alphabet = new Set<Symbol>();
    alphabet.add('a' as Symbol)
    alphabet.add('b' as Symbol)

    it('should correctly check validity of valid DFA', () => {
        const dfa = new DFA(alphabet, "start", false);

        dfa.addStates("1", "2");
        dfa.addState("end", true);

        dfa.addEdge("start", 'a' as Symbol, "start");
        dfa.addEdge("start", 'b' as Symbol, "1");

        dfa.addEdge("1", 'a' as Symbol, "2");
        dfa.addEdge("1", 'b' as Symbol, "1");

        dfa.addEdge("2", 'a' as Symbol, "end");
        dfa.addEdge("2", 'b' as Symbol, "start");

        dfa.addEdge("end", 'a' as Symbol, "end");
        dfa.addEdge("end", 'b' as Symbol, "1");

        expect(dfa.isValid()).toBe(true)
    });

    it('should have predictable response to bad weather input', () => {
        const dfa = new DFA(alphabet, "start", false);

        dfa.addEdge("start", 'a' as Symbol, "start");
        dfa.addEdge("start", 'b' as Symbol, "start");

        expect(dfa.isValid()).toBe(true)
    });
})


describe('DFA: Adding edges', () => {
    it('throws error when input character is not in the alphabet', () => {
        const alphabet = new Set<Symbol>();
        alphabet.add(toChar('a'));
        const dfa = new DFA(alphabet, "start", true);

        expect(() => dfa.addEdge("start", toChar('b'), "end")).toThrow(IllegalArgument);
    });

    it('throws error when starting state does not exist', () => {
        const alphabet = new Set<Symbol>();
        alphabet.add(toChar('a'));
        const dfa = new DFA(alphabet, "start", true);

        expect(() => dfa.addEdge("nonexistent", toChar('a'), "end")).toThrow(IllegalArgument);
    });

    it('throws error when ending state does not exist', () => {
        const alphabet = new Set<Symbol>();
        alphabet.add(toChar('a'));
        const dfa = new DFA(alphabet, "start", false);

        expect(() => dfa.addEdge("start", toChar('a'), "nonexistent")).toThrow(IllegalArgument);
    });

    it('adds transition successfully when all conditions are met', () => {
        const alphabet = new Set<Symbol>();
        alphabet.add(toChar('a'));
        const dfa = new DFA(alphabet, "start", false);
        dfa.addState("end");

        expect(dfa.addEdge("start", toChar('a'), "end")).toBe(true);
    });
});