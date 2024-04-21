import {describe, it, expect, beforeEach} from "vitest";
import {PDA} from "../../../src/automata/context-free/PDA";
import Fixtures from "../../fixtures";

describe("PDA: Running string on PDA", () => {

    let pda:PDA;

    beforeEach(() => {
        pda = Fixtures.genericPDA();
    })

    it("should run correctly", () => {
        expect(pda.epsilonClosure([{stateName: "q1", stackContents: []}])).toStrictEqual(
            [{stateName: "q1", stackContents: []}, {stateName: "q2", stackContents: ["$"]}]
        )
        expect(pda.runString("0011")).toBe(true);
        expect(pda.runString("01")).toBe(true);
        expect(pda.runString("")).toBe(true);
        expect(pda.runString("001")).toBe(false);
        expect(pda.runString("111")).toBe(false);
        expect(pda.runString("00")).toBe(false);
        expect(pda.runString("011")).toBe(false);
        expect(pda.runString("00001111")).toBe(true);
    })

})