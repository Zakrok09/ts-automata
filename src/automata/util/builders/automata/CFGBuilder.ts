import { IllegalArgument } from "../../../../exceptions/exceptions";
import { char, EPSILON } from "../../../../types";
import { CFG } from "../../../context-free/CFG";


export class CFGBuilder {
    protected startVariableName : char | undefined
    protected transitions : Map<char,Set<string>>
    protected terminals : Set<char>
    protected variables : Set<char>

    public constructor(terminals : string) {
        this.terminals = new Set();
        Array.from(terminals).forEach(terminal => this.terminals.add(terminal as char))
        this.variables = new Set()
        this.transitions = new Map()
    }


    /**
     * Stores a state to be added later
     *
     * @param name - The name of the state.
     * @param isFinal - Indicates if the state is final.
     * @returns - The instance of the object.
     */
    public addVariable(name: string):this {
        if (name.length!=1){
            throw new IllegalArgument("from has to be a variable of one symbol")
        }
        this.variables.add(name as char)
        return this;
    }

 
    public addTransition(from:string, to:string):this {

        if (from.length!=1){
            throw new IllegalArgument("from has to be a variable of one symbol")
        }
        let fromAsChar : char  = from as char
        if ( EPSILON in Array.from(to)) throw new IllegalArgument("cannot add EPSILON transitions from general add transition method")

        let bucket = this.transitions.get(fromAsChar)
        if (!bucket){
            this.transitions.set(fromAsChar,new Set())
            bucket = this.transitions.get(fromAsChar)!
        }
        bucket.add(to);
        return this;
    }

    

    
    public get withTransitions(): {
        from: (start: string) => {
            to: (...end: string[]) =>  CFGBuilder 
        }
    } {
        return {
            from: (start: string ) => ({
                to : (...end:string[])=>  {
                    for (let to of end){
                        this.addTransition(start,to)
                    }
                    return this}
            })
        };
        
    }

    public withStartVariable(name : string) : CFGBuilder {
        
        this.startVariableName = name as char;
        this.addVariable(name);
        return this;
    }
    
    public withVariables(names:string):CFGBuilder {
        Array.from(names).forEach(name => {
                if(!this.startVariableName){
                    this.startVariableName = name as char;
                }
                this.addVariable(name as char)});
        return this
    }
    public withEpsilonTransition(from : string) : CFGBuilder{
        this.addTransition(from,EPSILON)
        return this;
    }

    public getResult() : CFG{
        if(!this.startVariableName){
            throw new IllegalArgument("No start variable!")
        }
        let cfg = new CFG(this.startVariableName)
        Array.from(this.variables).forEach(variable => cfg.addVariable(variable))
        Array.from(this.terminals).forEach(terminal => cfg.addTerminal(terminal))
        this.transitions.forEach((to,from) => 
                                to.forEach(state => {if(state==EPSILON){
                                    cfg.addTransitionToEmptyString(from)
                                }else{
                                    cfg.addTransition(from,state)
                                }}
                                    ))
        return cfg;
    }
}

