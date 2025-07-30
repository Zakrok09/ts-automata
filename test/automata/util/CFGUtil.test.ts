import {describe, it, expect,beforeEach} from "vitest";
import { CFGBuilder } from "../../../src/automata/util/builders/automata/CFGBuilder";
import {CFGUtil} from "../../../src/automata/util/automata/CFGUtil"
import { CFG } from "../../../src/automata/context-free/CFG";
describe("CFGUtil: Empty CFG",()=>{
    let util : CFGUtil
    beforeEach(()=>{
        util = new CFGUtil();
    })
    it("should return false for simple CFG", ()=>{
        let cfg = new CFGBuilder("ab")
                          .withVariables("XY")
                          .withTransitions.from("X").to("XX","a")
                          .withTransitions.from("Y").to("Y")
                          .getResult()  
        expect(util.isLanguageEmpty(cfg)).toBe(false)
    })

    it("should return true for simple CFG", ()=>{
        let cfg = new CFGBuilder("ab")
                          .withVariables("XY")
                          .withTransitions.from("X").to("XX","X")
                          .withTransitions.from("Y").to("Y")
                          .getResult()  
        expect(util.isLanguageEmpty(cfg)).toBe(true)
    })
    it("should return false for simple CFG with Epsilon Edge", ()=>{
        let cfg = new CFGBuilder("ab")
                          .withVariables("XY")
                          .withTransitions.from("X").to("XX","X")
                          .withEpsilonTransition("X")
                          .withTransitions.from("Y").to("Y")
                          .getResult()  
        expect(util.isLanguageEmpty(cfg)).toBe(false)
    })
    it("should return false for simple CFG with Epsilon Edge, two layers", ()=>{
        let cfg = new CFGBuilder("ab")
                          .withVariables("XY")
                          .withTransitions.from("X").to("XX","Y")
                          .withEpsilonTransition("Y")
                          .withTransitions.from("Y").to("Y")
                          .getResult()  
        expect(util.isLanguageEmpty(cfg)).toBe(false)
    })
    it("should return false for simple CFG with non-epsilon Edge, two layers", ()=>{
        let cfg = new CFGBuilder("ab")
                          .withVariables("XYZ")
                          .withTransitions.from("X").to("XX","Y")
                          .withTransitions.from("Y").to("Z")
                          .withTransitions.from("Z").to("a")
                          .getResult()  
        expect(util.isLanguageEmpty(cfg)).toBe(false)
    })

    it("should return true for simple CFG with unreachable variable", ()=>{
        let cfg = new CFGBuilder("ab")
                          .withVariables("XY")
                          .withTransitions.from("X").to("XX")
                          .withEpsilonTransition("Y")
                          .withTransitions.from("Y").to("Y")
                          .getResult()  
        expect(util.isLanguageEmpty(cfg)).toBe(true)
    })

    it("should return false for simple CFG with no non-terminals", ()=>{
        let cfg = new CFGBuilder("")
                          .withVariables("XY")
                          .withTransitions.from("X").to("YY")
                          .withEpsilonTransition("Y")
                          .withTransitions.from("Y").to("Y")
                          .getResult()  
        expect(util.isLanguageEmpty(cfg)).toBe(false)
    })
    it("should return false complex example", ()=>{
        let cfg = new CFGBuilder("abcdef")
                          .withVariables("XYZE")
                          .withTransitions.from("X").to("YZ")
                          .withEpsilonTransition("Y")
                          .withTransitions.from("Z").to("EY")
                          .withTransitions.from("E").to("a")
                          .getResult()  
        expect(util.isLanguageEmpty(cfg)).toBe(false)
    })
    it("should return true complex example", ()=>{
        let cfg = new CFGBuilder("abcdef")
                          .withVariables("XYZE")
                          .withTransitions.from("X").to("YZ")
                          .withEpsilonTransition("Y")
                          .withTransitions.from("Z").to("EY")
                          .withTransitions.from("E").to("X")
                          .getResult()  
        expect(util.isLanguageEmpty(cfg)).toBe(true)
    })
})