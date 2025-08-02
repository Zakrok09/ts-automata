import {describe, it, expect,beforeEach} from "vitest";
import { CFGBuilder } from "../../../src/automata/util/builders/automata/CFGBuilder";
import {CFGUtil} from "../../../src/automata/util/automata/CFGUtil"
import { CFG } from "../../../src/automata/context-free/CFG";
describe("CFGUtil: Chomsky", ()=>{
    let util : CFGUtil
    beforeEach(()=>{
        util = new CFGUtil();
    })
    it.only("test chomskt",()=>{
         let cfg = new CFGBuilder("ab")
                          .withVariables("X","Y")
                          .withTransitions.from("X").to(["X","X"],["a"])
                          .withEpsilonTransition("X")
                          .withTransitions.from("Y").to(["X"])
                          .getResult()  
        console.log(util.toChomskyNormalForm(cfg))
    })
})
describe("CFGUtil: Empty CFG",()=>{
    let util : CFGUtil
    beforeEach(()=>{
        util = new CFGUtil();
    })
    it("should return false for simple CFG", ()=>{
        let cfg = new CFGBuilder("ab")
                          .withVariables("X","Y")
                          .withTransitions.from("X").to(["X","X"],["a"])
                          .withTransitions.from("Y").to(["Y"])
                          .getResult()  
        expect(util.isLanguageEmpty(cfg)).toBe(false)
    })

    it("should return true for simple CFG", ()=>{
        let cfg = new CFGBuilder("ab")
                          .withVariables("X","Y")
                          .withTransitions.from("X").to(["X","X"],["X"])
                          .withTransitions.from("Y").to(["Y"])
                          .getResult()  
        expect(util.isLanguageEmpty(cfg)).toBe(true)
    })
    it("should return false for simple CFG with Epsilon Edge", ()=>{
        let cfg = new CFGBuilder("ab")
                          .withVariables("X","Y")
                          .withTransitions.from("X").to(["X","X"],["X"])
                          .withEpsilonTransition("X")
                          .withTransitions.from("Y").to(["Y"])
                          .getResult()  
        expect(util.isLanguageEmpty(cfg)).toBe(false)
    })
    it("should return false for simple CFG with Epsilon Edge, two layers", ()=>{
        let cfg = new CFGBuilder("ab")
                          .withVariables("X","Y")
                          .withTransitions.from("X").to(["X","X"],["Y"])
                          .withEpsilonTransition("Y")
                          .withTransitions.from("Y").to(["Y"])
                          .getResult()  
        expect(util.isLanguageEmpty(cfg)).toBe(false)
    })
    it("should return false for simple CFG with non-epsilon Edge, two layers", ()=>{
        let cfg = new CFGBuilder("ab")
                          .withVariables("X","Y","Z")
                          .withTransitions.from("X").to(["X","X"],["Y"])
                          .withTransitions.from("Y").to(["Z"])
                          .withTransitions.from("Z").to(["a"])
                          .getResult()  
        expect(util.isLanguageEmpty(cfg)).toBe(false)
    })

    it("should return true for simple CFG with unreachable variable", ()=>{
        let cfg = new CFGBuilder("ab")
                          .withVariables("X","Y")
                          .withTransitions.from("X").to(["X","X"])
                          .withEpsilonTransition("Y")
                          .withTransitions.from("Y").to(["Y"])
                          .getResult()  
        expect(util.isLanguageEmpty(cfg)).toBe(true)
    })

    it("should return false for simple CFG with no non-terminals", ()=>{
        let cfg = new CFGBuilder("")
                          .withVariables("X","Y")
                          .withTransitions.from("X").to(["Y","Y"])
                          .withEpsilonTransition("Y")
                          .withTransitions.from("Y").to(["Y"])
                          .getResult()  
        expect(util.isLanguageEmpty(cfg)).toBe(false)
    })
    it("should return false complex example", ()=>{
        let cfg = new CFGBuilder("abcdef")
                          .withVariables("X","Y","Z","E")
                          .withTransitions.from("X").to(["Y","Z"])
                          .withEpsilonTransition("Y")
                          .withTransitions.from("Z").to(["E","Y"])
                          .withTransitions.from("E").to(["a"])
                          .getResult()  
        expect(util.isLanguageEmpty(cfg)).toBe(false)
    })
    it("should return true complex example", ()=>{
        let cfg = new CFGBuilder("abcdef")
                          .withVariables("X","Y","Z","E")
                          .withTransitions.from("X").to(["Y","Z"])
                          .withEpsilonTransition("Y")
                          .withTransitions.from("Z").to(["E","Y"])
                          .withTransitions.from("E").to(["X"])
                          .getResult()  
        expect(util.isLanguageEmpty(cfg)).toBe(true)
    })
})