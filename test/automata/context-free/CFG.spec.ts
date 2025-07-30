import {describe, it, expect, beforeEach} from "vitest";
import {CFGBuilder} from "../../../src/automata/util/builders/automata/CFGBuilder"
import { IllegalArgument } from "../../../src/exceptions/exceptions";
import { EPSILON } from "../../../src/types";
import { CFGVariable } from "../../../src/states/CFGState";

describe("CFG: Correct CRUD",()=>{

    
    it("adding terminals",()=>{
        let cfg = new CFGBuilder("ab")
                    .withVariables("XY")
                    .withTransitions.from("X").to("XX","aX")
                    .withTransitions.from("Y").to("Y")
                    .getResult()
        expect(cfg.getVariable("X").symbol).toBe("X")
        expect(cfg.getVariable("Y").symbol).toBe("Y")
        expect(cfg.getTerminal("a").symbol).toBe("a")
        expect(cfg.getTerminal("b").symbol).toBe("b")
        expect(cfg.getTerminal("X")).toThrow(Error)
        expect(cfg.getVariable("X")).toThrow(Error)
        expect(()=>cfg.getTerminal("aksks")).toThrow(IllegalArgument)
        expect(()=>cfg.addTerminal("aksks")).toThrow(IllegalArgument)
        expect(()=>cfg.addTransition("a","X")).toThrow(IllegalArgument)
        expect(()=>cfg.addTransition("X","H")).toThrow(IllegalArgument) 
        let X = cfg.getVariable("X")
        let Y = cfg.getVariable("Y")
        let a = cfg.getTerminal("a")
        expect(X.transitions.size).toBe(2)
        cfg.removeTransition("X","XX")
        expect(X.transitions.size).toBe(1)


    
    })

})