import { char } from "../../types";
import { CFGState, CFGTerminal, CFGVariable } from "../../states/CFGState";

export class CFG{
    public readonly variables : Map<char,CFGVariable>
    public readonly terminals : Map<char,CFGTerminal>
    
    public constructor(variables : char[],terminals: char[]){
        this.variables = new Map()
        this.terminals = new Map()
        variables.forEach(x => this.variables.set(x,new CFGVariable(x)))
        terminals.forEach(x => this.terminals.set(x,new CFGTerminal(x)))

    }
    public addVariable(symbol : char): void {
        if(!this.variables.get(symbol)){
            this.variables.set(symbol,new CFGVariable(symbol))
        }
    }
    public addTerminal(symbol : char): void {
        if(!this.terminals.get(symbol)){
            this.terminals.set(symbol,new CFGTerminal(symbol))
        }
    }
    public getVariable(symbol : char) : CFGTerminal{
        return this.variables.get(symbol)!
    }
    public getTerminal(symbol : char) : CFGTerminal{
        return this.terminals.get(symbol)!
    }
}