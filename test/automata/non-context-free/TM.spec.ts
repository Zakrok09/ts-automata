import {describe, it, expect, beforeEach} from "vitest";
import {TM} from "../../../src/automata/non-context-free/TM";
import Fixtures from "../../fixtures";
import {EMPTY,EPSILON} from "../../../src/types";



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

describe("TM: Running string on Equal a's and b's", () => {
    let tm:TM;
    // THIS TM doesn't halt if it doesn't accept the string.
    tm = Fixtures.equalAandB();
    it("general case- TRUE", () => {

        expect(tm.runString("")).toBe(true);
        expect(tm.runString("ab")).toBe(true);
        expect(tm.runString("abab")).toBe(true);
        expect(tm.runString("aabb")).toBe(true);
        expect(tm.runString("aaabbb")).toBe(true);
        expect(tm.runString("aaaabbbb")).toBe(true);
        expect(tm.runString("aaaaabbbbb")).toBe(true);
        expect(tm.runString("aaaaaaabbbbbbb")).toBe(true);
        expect(tm.runString("aaaaaaaabbbbbbbb")).toBe(true);
        expect(tm.runString("bababababa")).toBe(true);

    })
    it("general case- FALSE", () => {
        expect(tm.runString("b")).toBe(false);
        expect(tm.runString("a")).toBe(false);
        expect(tm.runString("abb")).toBe(false);
        expect(tm.runString("abaab")).toBe(false);
        expect(tm.runString("aabbb")).toBe(false);
        expect(tm.runString("aababbb")).toBe(false);
        expect(tm.runString("aaaaabbbb")).toBe(false);
        expect(tm.runString("aaabaabbbbb")).toBe(false);
        expect(tm.runString("aaabaaaabbbbbbb")).toBe(false);
        expect(tm.runString("aaaaaaaaabbbbbbbb")).toBe(false);
        expect(tm.runString("bababababaa")).toBe(false);

    })
    it("Throws Exception on illegal input", () => {  
        expect(() => tm.runString("aabc")).toThrowError("c is not part of the alphabet of this finite automaton");
        expect(() => tm.runString("aaaebb")).toThrowError("e is not part of the alphabet of this finite automaton");
        expect(() => tm.runString("aabbb"+EMPTY)).toThrowError(`${EMPTY} is not part of the alphabet of this finite automaton`);
        expect(() => tm.runString("aaaaaaabbbbbbbb"+EPSILON)).toThrowError(`${EPSILON} is not part of the alphabet of this finite automaton`);
        expect(() => tm.runString("Aa")).toThrowError(`A is not part of the alphabet of this finite automaton`);
        expect(() => tm.runString("ab0")).toThrowError(`0 is not part of the alphabet of this finite automaton`);
        expect(() => tm.runString("ab"+EMPTY)).toThrowError(`${EMPTY} is not part of the alphabet of this finite automaton`);
    })
})
