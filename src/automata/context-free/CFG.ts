import { char, EPSILON } from "../../types";
import { CFGState, CFGTerminal, CFGVariable, CFGEdge } from "../../states/CFGState";
import { IllegalArgument } from "../../exceptions/exceptions";

export class CFG{
    public readonly variables : Map<string,CFGVariable>
    public readonly terminals : Map<string,CFGTerminal>
    public startVariable : CFGVariable
    private epsilon = new CFGTerminal(EPSILON);
    public constructor(startVariable : string){
        this.variables = new Map()
        this.terminals = new Map()
        this.addVariable(startVariable)
        this.startVariable = this.variables.get(startVariable)!

    }
    public changeStartVariable(newStartVariable : string){
        this.startVariable = this.getVariable(newStartVariable);
    }
    /**
     * Method to remove a transition to the empty string
     * @param from The non-terminal to remove the transition from
     */
    public removeEmptyStringTransition(from : string){
        let fromVariable = this.variables.get(from)
        if(fromVariable){
            fromVariable.removeTransition([this.terminals.get(EPSILON)!])
        }else{
            throw new IllegalArgument("Variable doesn't exist!")
        }
    }
    /**
     * Method to remove a transition from the CFG
     * @param from The non-terminal to transition to remove from
     * @param to the string representation of the terminals and nonterminals to remove the transformation of
     */
    public removeTransition(from : string, ...to :string[]){
        
        let fromVariable = this.variables.get(from)
        if(fromVariable){
            fromVariable.removeTransition((to).map(nextState => this.getFromSymbol(nextState)))
        }else{
            throw new IllegalArgument("Variable doesn't exist!")
        }
    }
    /**
     * Method to add transition to empty string from a non-terminal
     * @param from The non-terminal symbol, 1 character
     */
    public addTransitionToEmptyString(from : string){
        // X -> empty string
        
        
        let fromVariable = this.variables.get(from)
        if(fromVariable){
            fromVariable.addTransition(this.epsilon)
        }else{
            throw new IllegalArgument("Variable doesn't exist!")
        }
    }
    /**
     * The method to add a transition from a non-terminal to a collection of terminals and nonterminals
     * @param from the symbol of the terminal, 1 character.
     * @param to The string containing the symbols to transform into
     */
    public addTransition(from : string, ...to : string[]):void{
        // an example would be X -> XXa
        
        if(to.some(x => x.includes(EPSILON))){
            throw new IllegalArgument("Cannot add a direct transition to EPSILON with this method")
        }
        
        let fromVariable = this.variables.get(from)
        if(fromVariable){
            fromVariable.addTransition(...to.map(nextState => this.getFromSymbol(nextState)))
        }else{
            throw new IllegalArgument("Variable doesn't exist!")
        }
    }
    /**
     * To get a state (either terminal or non-terminal) from the CFg
     * @param symbol The symbol of the state, character
     * @returns The state from the CFG, if it exists
     */
    private getFromSymbol(symbol : string) : CFGState{
        let nextState : CFGState | undefined = this.variables.get(symbol)
        if(symbol == EPSILON){
            return this.epsilon;
        }
        if (!nextState){
            nextState = this.terminals.get(symbol)
        }
        if(!nextState){
            throw new IllegalArgument("Symbol "+symbol+" doesn't exist!")
        }
        return nextState

    }
    /**
     * Method to add a non-terminal state to the CFG
     * @param symbol The symbol of the non-terminal. 1 character has to be distinct amongst all terminals and variables
     */
    public addVariable(symbol : string): void {
        if(symbol.includes(EPSILON)|| symbol == ""){
            throw new IllegalArgument("Cannot have "+EPSILON+" as variable symbol")
        }
        
        if(this.terminals.get(symbol)){
            throw new IllegalArgument("A terminal and a variable can't have the same symbol!")
        }
        if(!this.variables.get(symbol)){
            this.variables.set(symbol,new CFGVariable(symbol))
        }
    }
    /**
     * Method to add a terminal state to the CFG
     * @param symbol The symbol of the terminal. 1 character has to be distinct amongst all terminals and variables
     */
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
            this.terminals.set(symbol,new CFGTerminal(symbol))
        }
    }
    /**
     * Method to get a non-terminal state from the CFG
     * @param symbol The symbol of the terminal. 1 character
     * @returns The non-terminal, if it exists.
     */
    public getVariable(symbol : string) : CFGVariable{
        return this.variables.get(symbol)!
    }
    /**
     * Method to get a terminal state from the CFG
     * @param symbol The symbol of the terminal. 1 character
     * @returns The terminal string, if it exists.
     */
    public getTerminal(symbol : string) : CFGTerminal{
        if (symbol.length!=1){
            throw new IllegalArgument("symbol has to be of length 1!")
        }
        return this.terminals.get(symbol )!
    }
    /**
     * Human readable representation of the CFG
     * @returns Human readable string of CFG, in notation from Sipser
     */
    public toString() : string{
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
    /**
     * Create deep copy of this CFG
     * @returns The deep copy of this CFG
     */
    public copy() : CFG{
        let newCFG = new CFG(this.startVariable.symbol);
        this.variables.forEach(x=> {newCFG.addVariable(x.symbol)})
        this.terminals.forEach(x=>newCFG.addTerminal(x.symbol))
        this.variables.forEach(variable => 
                    variable.transitions.forEach(states =>
                        states.length ==1 && states[0].symbol==EPSILON ? 
                        newCFG.addTransitionToEmptyString(variable.symbol): 
                            newCFG.addTransition(variable.symbol,
                                ...states.map(state=>state.symbol))))
        return newCFG;
    }
}