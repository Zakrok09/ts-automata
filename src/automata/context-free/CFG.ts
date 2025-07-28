import { char } from "../../types";
import { CFGState, CFGTerminal, CFGVariable } from "../../states/CFGState";

export class CFG{
    public readonly variables : Map<char,CFGVariable>
    public readonly terminals : Map<char,CFGTerminal>
    public startVariable : CFGVariable
    
    public constructor(variables : char[],terminals: char[], startVariable : char){
        this.variables = new Map()
        this.terminals = new Map()
        variables.forEach(x => this.variables.set(x,new CFGVariable(x)))
        terminals.forEach(x => this.terminals.set(x,new CFGTerminal(x)))
        this.startVariable = this.variables.get(startVariable)!

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
    public toString(){
        let rows = [
            "CFG {",
            "Starting Variable -> "+ this.startVariable.symbol+"\n",
                        "Variables : "+ this.variables.values().map(x=> x.symbol).toArray().toSorted().join(" , "),
                        "Terminals: " + this.terminals.values().map(x=> x.symbol).toArray().toSorted().join(" , "),
                        "Transitions: ",
                        ...this.terminals.values().map(x=>" "+x.toString()).toArray(),
                    "}"]
        return rows.join("\n      ")
    
    }
}