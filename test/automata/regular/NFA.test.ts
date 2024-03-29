import {char, toChar} from "../../../src";
import {NFA} from "../../../src/automata/regular/NFA";

describe("NFA acceptance testing", () => {
    let alphabet:Set<char>;
    let nfa:NFA;

    beforeEach(() => {
        alphabet = new Set<char>();
        alphabet.add(toChar('a'))
        alphabet.add(toChar('b'))

        nfa = new NFA(alphabet, "start", false);
        nfa.addStates("1", "2");
        nfa.addState("end", true);

        nfa.addEdge("start", toChar('a'), "1");
        nfa.addEdge("start", toChar('a'), "2");

        nfa.addEdge("2", toChar('a'), "2");
        nfa.addEdge("2", toChar('b'), "2");
        nfa.addEdge("2", toChar('a'), "end");
    })

    it("Should correctly accept a working NFA", () => {
        expect(nfa.runString("a")).toBe(false);
        expect(nfa.runString("aa")).toBe(true);
        expect(nfa.runString("ba")).toBe(false);
        expect(nfa.runString("aabbb")).toBe(false);
        expect(nfa.runString("abbbba")).toBe(true);
    })

    it("should correctly deal with situations where the graph is split", () => {
        expect(nfa.removeEdge("2", toChar('a'), "end")).toBe(true);

        expect(nfa.runString("a")).toBe(false);
        expect(nfa.runString("aa")).toBe(false);
        expect(nfa.runString("ba")).toBe(false);
        expect(nfa.runString("aabbb")).toBe(false);
        expect(nfa.runString("abbbba")).toBe(false);
    })
})