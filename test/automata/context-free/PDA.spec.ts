import {describe, it, expect, beforeEach} from "vitest";
import {PDA} from "../../../src/automata/context-free/PDA";
import Fixtures from "../../fixtures";

describe("PDA: Running string on PDA", () => {

    let pda:PDA;

    beforeEach(() => {
        pda = Fixtures.genericPDA();
    })

    it("should correctly run for the language 0^n1^n", () => {
        expect(pda.epsilonClosure([{stateName: "q1", stackContents: []}])).toStrictEqual(
            [{stateName: "q1", stackContents: []}, {stateName: "q2", stackContents: ["$"]}]
        )
        expect(pda.runString("")).toBe(true);

        expect(pda.runString("001")).toBe(false);
        expect(pda.runString("111")).toBe(false);
        expect(pda.runString("00")).toBe(false);
        expect(pda.runString("011")).toBe(false);

        for(let i = 0; i <= 10; i++) {
            expect(pda.runString("0".repeat(i) + "1".repeat(i))).toBe(true)
        }
    })

})