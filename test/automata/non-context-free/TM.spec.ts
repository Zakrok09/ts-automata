import {describe, it, expect, beforeEach} from "vitest";
import {TM} from "../../../src/automata/non-context-free/TM";
import Fixtures from "../../fixtures";



describe("TM: Running string on TM", () => {

    let tm:TM;
    // THIS TM doesn't halt if it doesn't accept the string.
    tm = Fixtures.mediumTM();
    it("should correctly run for the language 0^n1^n", () => {

        expect(tm.runString("")).toBe(true);
        expect(tm.runString("a")).toBe(true);
        expect(tm.runString("b")).toBe(true);
        expect(tm.runString("ab")).toBe(true);
        expect(tm.runString("ab")).toBe(true);
        expect(tm.runString("abababab")).toBe(true);
        expect(tm.runString("bbbbbbbabbba")).toBe(true);
        expect(tm.runString("bababbbab")).toBe(true);
        expect(tm.runString("bb")).toBe(true);
    })

})
