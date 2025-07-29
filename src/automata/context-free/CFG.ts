import { char, EPSILON } from "../../types";
import { CFGState, CFGTerminal, CFGVariable } from "../../states/CFGState";
import { IllegalArgument } from "~/exceptions/exceptions";

export class CFG{
    public readonly variables : Map<char,CFGVariable>
    public readonly terminals : Map<char,CFGTerminal>
    public startVariable : CFGVariable
    
    public constructor(startVariable : char){
        this.variables = new Map()
        this.terminals = new Map()
        this.terminals.set(EPSILON,new CFGTerminal(EPSILON))
        this.startVariable = this.variables.get(startVariable)!

    }

    public removeEmptyStringTransition(from : char){
        let fromVariable = this.variables.get(from)
        if(fromVariable){
            fromVariable.removeTransition([this.terminals.get(EPSILON)!])
        }else{
            throw new IllegalArgument("Variable doesn't exist!")
        }
    }
    public removeTransition(from : char, to :string){
        let fromVariable = this.variables.get(from)
        if(fromVariable){
            fromVariable.removeTransition(Array.from(to).map(nextState => this.getFromSymbol(nextState as char)))
        }else{
            throw new IllegalArgument("Variable doesn't exist!")
        }
    }
    public addTransitionToEmptyString(from : char){
        this.addTransition(from,EPSILON)
    }
    public addTransition(from : char, to : string):void{
        let fromVariable = this.variables.get(from)
        if(fromVariable){
            fromVariable.addTransition(...Array.from(to).map(nextState => this.getFromSymbol(nextState as char)))
        }else{
            throw new IllegalArgument("Variable doesn't exist!")
        }
    }
    private getFromSymbol(symbol : char) : CFGState{
        
        let nextState : CFGState | undefined = this.variables.get(symbol)
        if (!nextState){
            nextState = this.terminals.get(symbol)
        }
        if(!nextState){
            throw new IllegalArgument("Symbol doesn't exist!")
        }
        return nextState

    }
    public addVariable(symbol : char): void {
        if(symbol == EPSILON){
            throw new IllegalArgument("Cannot have "+EPSILON+" as variable symbol")
        }
        if(!this.terminals.get(symbol)){
            throw new IllegalArgument("A terminal and a variable can't have the same symbol!")
        }
        if(!this.variables.get(symbol)){
            this.variables.set(symbol,new CFGVariable(symbol))
        }
    }
    public addTerminal(symbol : char): void {
        if(symbol == EPSILON){
            throw new IllegalArgument("Cannot have "+EPSILON+" as terminal symbol")
        }
        if(!this.variables.get(symbol)){
            throw new IllegalArgument("A terminal and a variable can't have the same symbol!")
        }
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