import { char, EPSILON } from "../../types";
import { CFGState, CFGTerminal, CFGVariable } from "../../states/CFGState";
import { IllegalArgument } from "../../exceptions/exceptions";

export class CFG{
    public readonly variables : Map<string,CFGVariable>
    public readonly terminals : Map<string,CFGTerminal>
    public startVariable : CFGVariable
    
    public constructor(startVariable : char){
        this.variables = new Map()
        this.terminals = new Map()
        this.terminals.set(EPSILON,new CFGTerminal(EPSILON))
        this.variables.set(startVariable,new CFGVariable(startVariable))
        this.startVariable = this.variables.get(startVariable)!

    }

    public removeEmptyStringTransition(from : string){
        let fromVariable = this.variables.get(from)
        if(fromVariable){
            fromVariable.removeTransition([this.terminals.get(EPSILON)!])
        }else{
            throw new IllegalArgument("Variable doesn't exist!")
        }
    }
    public removeTransition(from : string, to :string){
        if (from.length!=1){
            throw new IllegalArgument("symbol has to be of length 1!")
        }
        let fromVariable = this.variables.get(from)
        if(fromVariable){
            fromVariable.removeTransition(Array.from(to).map(nextState => this.getFromSymbol(nextState)))
        }else{
            throw new IllegalArgument("Variable doesn't exist!")
        }
    }
    public addTransitionToEmptyString(from : string){
        this.addTransition(from,EPSILON)
    }
    public addTransition(from : string, to : string):void{
        if (from.length!=1){
            throw new IllegalArgument("symbol has to be of length 1!")
        }
        
        let fromVariable = this.variables.get(from)
        if(fromVariable){
            fromVariable.addTransition(...Array.from(to).map(nextState => this.getFromSymbol(nextState as char)))
        }else{
            throw new IllegalArgument("Variable doesn't exist!")
        }
    }
    private getFromSymbol(symbol : string) : CFGState{
        if (symbol.length!=1){
            throw new IllegalArgument("symbol has to be of length 1!")
        }
        let nextState : CFGState | undefined = this.variables.get(symbol)
        if (!nextState){
            nextState = this.terminals.get(symbol)
        }
        if(!nextState){
            throw new IllegalArgument("Symbol doesn't exist!")
        }
        return nextState

    }
    public addVariable(symbol : string): void {
        if(symbol == EPSILON){
            throw new IllegalArgument("Cannot have "+EPSILON+" as variable symbol")
        }
        if (symbol.length!=1){
            throw new IllegalArgument("symbol has to be of length 1!")
        }
        if(this.terminals.get(symbol)){
            throw new IllegalArgument("A terminal and a variable can't have the same symbol!")
        }
        if(!this.variables.get(symbol)){
            this.variables.set(symbol,new CFGVariable(symbol as char))
        }
    }
    public addTerminal(symbol : string): void {
        if (symbol.length!=1){
            throw new IllegalArgument("symbol has to be of length 1!")
        }
        if(symbol == EPSILON){
            throw new IllegalArgument("Cannot have "+EPSILON+" as terminal symbol")
        }
        if(this.variables.get(symbol)){
            throw new IllegalArgument("A terminal and a variable can't have the same symbol!")
        }
        if(!this.terminals.get(symbol)){
            this.terminals.set(symbol,new CFGTerminal(symbol as char))
        }
    }
    public getVariable(symbol : string) : CFGVariable{
        if (symbol.length!=1){
            throw new IllegalArgument("symbol has to be of length 1!")
        }
        return this.variables.get(symbol as char)!
    }
    public getTerminal(symbol : string) : CFGTerminal{
        if (symbol.length!=1){
            throw new IllegalArgument("symbol has to be of length 1!")
        }
        return this.terminals.get(symbol as char )!
    }
    public toString(){
        let rows = [
            "CFG {",
            "Starting Variable -> "+ this.startVariable.symbol+"\n",
                        "Variables : "+ this.variables.values().map(x=> x.symbol).toArray().toSorted().join(" , "),
                        "Terminals: " + this.terminals.values().map(x=> x.symbol).toArray().toSorted().join(" , "),
                        "Transitions: ",
                        ...this.variables.values().map(x=>" "+x.toString()).toArray(),
                    "}"]
        return rows.join("\n      ")
    }
}