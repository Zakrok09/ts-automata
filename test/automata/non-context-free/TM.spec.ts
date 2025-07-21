import {describe, it, expect, beforeEach} from "vitest";
import {TM} from "../../../src/automata/non-context-free/TM";
import Fixtures from "../../fixtures";



describe("TM: Running string on TM-medium", () => {

    let tm:TM;
    // THIS TM doesn't halt if it doesn't accept the string.
    tm = Fixtures.mediumTM();
    it("should accept all", () => {

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

describe("TM: Running string on NDTM-simple", () => {

    let tm:TM;
    // THIS TM doesn't halt if it doesn't accept the string.
    tm = Fixtures.simpleNDTM();
    it("simple tests", () => {

        expect(tm.runString("")).toBe(false);
        expect(tm.runString("b")).toBe(false);
        expect(tm.runString("a")).toBe(true);
        expect(tm.runString("bbbbbbbbbbbbbbbbbb")).toBe(false);
        expect(tm.runString("bbbbbbbbbbbbbbbbbb")).toBe(false);
        expect(tm.runString("abbbbbbbbbbbbbbbbbba")).toBe(true);




        
    })

})
