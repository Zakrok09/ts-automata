import { describe, it, expect, beforeEach } from "vitest";
import { CFGBuilder } from "../../../src/automata/util/builders/automata/CFGBuilder";
import { CFGUtil } from "../../../src/automata/util/automata/CFGUtil";
import { CFG } from "../../../src/automata/context-free/CFG";
import { test, fc } from "@fast-check/vitest";
import { cfgArbitrary } from "./CFGArbitrary";
import { reverse } from "dns";

describe("CFGUtil: Chomsky", () => {
    let util: CFGUtil;
    beforeEach(() => {
        util = new CFGUtil();
    });
    test.prop([cfgArbitrary])(
        "correct method",
        cfg => {
            expect(util.isInChomskyNormalForm(util.toChomskyNormalForm(cfg))).toBe(true);
        },
        1000
    );

    test("test chomskty checker- false", () => {
        const cfg = new CFGBuilder("ab")
            .withVariables("S", "X", "Y", "Z")
            .withTransitions.from("S")
            .to(["Z"])
            .withTransitions.from("Z")
            .to(["Y", "Y"])
            .withTransitions.from("X")
            .to(["X", "b", "X"], ["a"])
            .withEpsilonTransition("X")
            .withTransitions.from("Y")
            .to(["X"], ["Y"])
            .getResult();
        expect(util.isInChomskyNormalForm(cfg)).toBe(false);
    });
    it("test chomskty checker- true ", () => {
        const cfg = new CFGBuilder("ab")
            .withVariables("S", "X", "Y", "Z")
            .withTransitions.from("S")
            .to(["Z"])
            .withTransitions.from("Z")
            .to(["Y", "Y"])
            .withTransitions.from("X")
            .to(["X", "b", "X"], ["a"])
            .withEpsilonTransition("X")
            .withTransitions.from("Y")
            .to(["X"], ["Y"])
            .getResult();

        expect(util.isInChomskyNormalForm(util.toChomskyNormalForm(cfg))).toBe(true);
    });
});
const anbnArb = fc.nat({ max: 40 }).map(n => "a".repeat(n) + "b".repeat(n));
const aOrBStringArb = fc.array(fc.constantFrom("a", "b"), { maxLength: 100 }).map(arr => arr.join(""));

describe("CFGUtil: A_CFG", () => {
    let util: CFGUtil;
    beforeEach(() => {
        util = new CFGUtil();
    });
    test.prop([anbnArb])("correct method", word => {
        const cfg = new CFGBuilder("ab")
            .withVariables("X")
            .withTransitions.from("X")
            .to(["a", "X", "b"])
            .withEpsilonTransition("X")
            .getResult();
        expect(util.doesLanguageContainString(cfg, word)).toBe(true);
    });

    test.prop([aOrBStringArb])("correct method palindrome", word => {
        const cfg = new CFGBuilder("ab")
            .withVariables("X")
            .withTransitions.from("X")
            .to(["a", "X", "a"], ["b", "X", "b"], ["a"], ["b"])
            .withEpsilonTransition("X")
            .getResult();
        expect(util.doesLanguageContainString(cfg, word + Array.from(word).reverse().join(""))).toBe(true);
    });

    it("should return false for not in language", () => {
        const cfg = new CFGBuilder("ab")
            .withVariables("X")
            .withTransitions.from("X")
            .to(["a", "X", "b"])
            .withEpsilonTransition("X")
            .getResult();
        expect(util.doesLanguageContainString(cfg, "a")).toBe(false);
        expect(util.doesLanguageContainString(cfg, "b")).toBe(false);
        expect(util.doesLanguageContainString(cfg, "ba")).toBe(false);
        expect(util.doesLanguageContainString(cfg, "bbaa")).toBe(false);
        expect(util.doesLanguageContainString(cfg, "bbcaa")).toBe(false);
    });
});
describe("CFGUtil: Union", () => {
    let util: CFGUtil;
    beforeEach(() => {
        util = new CFGUtil();
    });

    it("should return false for not in language", () => {
        let cfg = new CFGBuilder("ab")
            .withVariables("X")
            .withTransitions.from("X")
            .to(["a", "X", "a"], ["b", "X", "b"], ["a"], ["b"])
            .withEpsilonTransition("X")
            .getResult();
        const cfg2 = new CFGBuilder("ab")
            .withVariables("X")
            .withTransitions.from("X")
            .to(["a", "X", "b"])
            .withEpsilonTransition("X")
            .getResult();
        cfg = util.union(cfg, cfg2);
        expect(util.doesLanguageContainString(cfg, "a")).toBe(true);
        expect(util.doesLanguageContainString(cfg, "b")).toBe(true);
        expect(util.doesLanguageContainString(cfg, "ba")).toBe(false);
        expect(util.doesLanguageContainString(cfg, "babab")).toBe(true);
        expect(util.doesLanguageContainString(cfg, "bbcaa")).toBe(false);
    });
});
describe("CFGUtil: Empty CFG", () => {
    let util: CFGUtil;
    beforeEach(() => {
        util = new CFGUtil();
    });
    it("should return false for simple CFG", () => {
        const cfg = new CFGBuilder("ab")
            .withVariables("X", "Y")
            .withTransitions.from("X")
            .to(["X", "X"], ["a"])
            .withTransitions.from("Y")
            .to(["Y"])
            .getResult();
        expect(util.isLanguageEmpty(cfg)).toBe(false);
    });

    it("should return true for simple CFG", () => {
        const cfg = new CFGBuilder("ab")
            .withVariables("X", "Y")
            .withTransitions.from("X")
            .to(["X", "X"], ["X"])
            .withTransitions.from("Y")
            .to(["Y"])
            .getResult();
        expect(util.isLanguageEmpty(cfg)).toBe(true);
    });
    it("should return false for simple CFG with Epsilon Edge", () => {
        const cfg = new CFGBuilder("ab")
            .withVariables("X", "Y")
            .withTransitions.from("X")
            .to(["X", "X"], ["X"])
            .withEpsilonTransition("X")
            .withTransitions.from("Y")
            .to(["Y"])
            .getResult();
        expect(util.isLanguageEmpty(cfg)).toBe(false);
    });
    it("should return false for simple CFG with Epsilon Edge, two layers", () => {
        const cfg = new CFGBuilder("ab")
            .withVariables("X", "Y")
            .withTransitions.from("X")
            .to(["X", "X"], ["Y"])
            .withEpsilonTransition("Y")
            .withTransitions.from("Y")
            .to(["Y"])
            .getResult();
        expect(util.isLanguageEmpty(cfg)).toBe(false);
    });
    it("should return false for simple CFG with non-epsilon Edge, two layers", () => {
        const cfg = new CFGBuilder("ab")
            .withVariables("X", "Y", "Z")
            .withTransitions.from("X")
            .to(["X", "X"], ["Y"])
            .withTransitions.from("Y")
            .to(["Z"])
            .withTransitions.from("Z")
            .to(["a"])
            .getResult();
        expect(util.isLanguageEmpty(cfg)).toBe(false);
    });

    it("should return true for simple CFG with unreachable variable", () => {
        const cfg = new CFGBuilder("ab")
            .withVariables("X", "Y")
            .withTransitions.from("X")
            .to(["X", "X"])
            .withEpsilonTransition("Y")
            .withTransitions.from("Y")
            .to(["Y"])
            .getResult();
        expect(util.isLanguageEmpty(cfg)).toBe(true);
    });

    it("should return false for simple CFG with no non-terminals", () => {
        const cfg = new CFGBuilder("")
            .withVariables("X", "Y")
            .withTransitions.from("X")
            .to(["Y", "Y"])
            .withEpsilonTransition("Y")
            .withTransitions.from("Y")
            .to(["Y"])
            .getResult();
        expect(util.isLanguageEmpty(cfg)).toBe(false);
    });
    it("should return false complex example", () => {
        const cfg = new CFGBuilder("abcdef")
            .withVariables("X", "Y", "Z", "E")
            .withTransitions.from("X")
            .to(["Y", "Z"])
            .withEpsilonTransition("Y")
            .withTransitions.from("Z")
            .to(["E", "Y"])
            .withTransitions.from("E")
            .to(["a"])
            .getResult();
        expect(util.isLanguageEmpty(cfg)).toBe(false);
    });
    it("should return true complex example", () => {
        const cfg = new CFGBuilder("abcdef")
            .withVariables("X", "Y", "Z", "E")
            .withTransitions.from("X")
            .to(["Y", "Z"])
            .withEpsilonTransition("Y")
            .withTransitions.from("Z")
            .to(["E", "Y"])
            .withTransitions.from("E")
            .to(["X"])
            .getResult();
        expect(util.isLanguageEmpty(cfg)).toBe(true);
    });
});
