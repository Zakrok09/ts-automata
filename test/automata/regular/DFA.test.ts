import {DFA} from "../../../src";
import {IllegalArgument, IllegalAutomatonState} from "../../../src/exceptions/exceptions";
import Fixtures from "../../fixtures";
import {EPSILON} from "../../../src/types";

describe("DFA: Running string on DFA", () => {
    // states: q0, q1, q2
    let dfa:DFA;

    beforeEach(() => {
        dfa = Fixtures.genericValidDFA()
    })

    it("Should parse words correctly", () => {
        expect(dfa.isValid()).toBe(true);
        expect(dfa.runString("aaabbbbabbbaa")).toBe(true);
        expect(dfa.runString("aaabbbaaaa")).toBe(true);
        expect(dfa.runString("baab")).toBe(false);
    })

    it("Should empty words", () => {
        expect(dfa.isValid()).toBe(true);
        dfa.startState.accepting = true;
        expect(dfa.runString("")).toBe(true);
    })

    it('should throw an exception when asked to run without being valid', () => {
        dfa.removeEdge("2", 'a')

        expect(dfa.isValid()).toBe(false);
        expect(() => dfa.runString("a")).toThrow(IllegalAutomatonState);
    });
})

describe('DFA: Validity checking', () => {
    it('should correctly check validity of valid DFA', () => {
        const dfa = Fixtures.genericValidDFA()
        expect(dfa.isValid()).toBe(true)
    });

    it('should have predictable response to single state dfa', () => {
        const dfa = Fixtures.genericSingleStateValidDFA();
        expect(dfa.isValid()).toBe(true)
    });

    it('should correctly check the validity of a invalid DFA', () => {
        const dfa = Fixtures.genericInvalidDFA();
        expect(dfa.isValid()).toBe(false)
    });
})


describe('DFA: Adding edges', () => {
    const dfa = new DFA("a", "start", false);

    it('throws error when input character is not in the alphabet', () => {
        expect(() => dfa.addEdge("start", 'b', "end")).toThrow(IllegalArgument);
    });

    it('throws error when starting state does not exist', () => {
        expect(() => dfa.addEdge("nonexistent", 'a', "end")).toThrow(IllegalArgument);
    });

    it('throws error when ending state does not exist', () => {
        expect(() => dfa.addEdge("start", 'a', "nonexistent")).toThrow(IllegalArgument);
    });

    it('adds transition successfully when all conditions are met', () => {
        dfa.addState("end");
        expect(dfa.addEdge("start", 'a', "end")).toBe(true);
    });

    it('throws error when adding an epsilon edge', () => {
        dfa.addState("end");
        expect(() => dfa.addEdge("start", EPSILON, "end")).toThrow(IllegalArgument);
    });
});

describe("DFA: Removing edges", () => {
    const dfa = new DFA("ab", "start", true);

    beforeEach(() => {
        dfa.addState("end", true)
        dfa.addEdge("start", 'a', "end");
        dfa.addEdge("start", 'b', "end");

        dfa.addEdge("end", 'a', "start");
        dfa.addEdge("end", 'b', "start");
    })

    it('removes existing edges correctly and returns false if the edge does not exist', () => {
        expect(dfa.removeEdge("start", 'a')).toBe(true);
        expect(dfa.removeEdge("start", 'a')).toBe(false);
    })

    it('throws an exception when the symbol is not part of the alphabet', () => {
        expect(() => dfa.removeEdge("start", 'c'))
            .toThrow(IllegalArgument);
    })

    it('throws an exception when the state is not present in the DFA', () => {
        expect(() => dfa.removeEdge("doesn't exist", 'a'))
            .toThrow(IllegalArgument);
    })
})

describe("DFA to String method", () => {
    it('should correctly represent the DFA in string format', () => {
        const dfa = Fixtures.genericValidDFA()

        expect(dfa.toString()).toBe("DFA: {\n\tAlphabet: [a, b]\n\tStates: [start, 1, 2, end]\n\tStarting State: start\n}")
    });
})