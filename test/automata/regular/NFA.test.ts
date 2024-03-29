import {NFA} from "../../../src/automata/regular/NFA";
import {Alphabet} from "../../../src/automata/Alphabet";

describe("NFA acceptance testing", () => {
    let alphabet:Alphabet;
    let nfa:NFA;

    beforeEach(() => {
        alphabet = Alphabet.fromString('ab')

        nfa = new NFA(alphabet, "start", false);
        nfa.addStates("1", "2");
        nfa.addState("end", true);

        nfa.addEdge("start", 'a', "1");
        nfa.addEdge("start", 'a', "2");

        nfa.addEdge("2", 'a', "2");
        nfa.addEdge("2", 'b', "2");
        nfa.addEdge("2", 'a', "end");
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
})