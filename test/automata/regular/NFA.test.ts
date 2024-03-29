import {Symbol, toChar} from "../../../src";
import {NFA} from "../../../src/automata/regular/NFA";

describe("NFA acceptance testing", () => {

    it("Should correctly accept a working NFA", () => {
        const alphabet = new Set<Symbol>();

        alphabet.add(toChar('a'))
        alphabet.add(toChar('b'))

        const nfa = new NFA(alphabet, "start", false);

        nfa.addStates("1", "2");
        nfa.addState("end", true);

        nfa.addEdge("start", toChar('a'), "1");
        nfa.addEdge("start", toChar('a'), "2");

        nfa.addEdge("2", toChar('a'), "2");
        nfa.addEdge("2", toChar('b'), "2");
        nfa.addEdge("2", toChar('a'), "end");

        expect(nfa.runString("a")).toBe(false);
        expect(nfa.runString("aa")).toBe(true);
        expect(nfa.runString("ba")).toBe(false);
        expect(nfa.runString("aabbb")).toBe(false);
        expect(nfa.runString("abbbba")).toBe(true);
    })
})