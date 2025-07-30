import { IllegalArgument } from "../../../../exceptions/exceptions";
import { char, EPSILON } from "../../../../types";
import { CFG } from "../../../context-free/CFG";


export class CFGBuilder {
    protected startVariableName : string | undefined
    protected transitions : Map<string,Set<string[]>>
    protected terminals : Set<string>
    protected variables : Set<string>

    public constructor(terminals : string) {
        this.terminals = new Set();
        Array.from(terminals).forEach(terminal => this.terminals.add(terminal))
        this.variables = new Set()
        this.transitions = new Map()
    }


    /**
     * Stores a state to be added later
     *
     * @param name - The name of the variable.
     * @returns - The instance of the object.
     */
    public addVariable(name: string):this {
        if(!this.startVariableName){
            this.startVariableName = name;
        }
        this.variables.add(name)
        return this;
    }

 
    public addTransition(from:string, ...to:string[]):this {

        

    /**
     * The function to add a transition
     * @param from The non-terminal to add the transition to
     * @param to The string representing the symbols to transform to
     * @returns The instance of the object
     */
    public addTransition(from:string, to:string):this {

        if (from.length!=1){
            throw new IllegalArgument("from has to be a variable of one symbol")
        }
        let fromAsChar : char  = from as char
        if ( EPSILON in Array.from(to)) throw new IllegalArgument("cannot add EPSILON transitions from general add transition method")

        let bucket = this.transitions.get(from)
        if (!bucket){
            this.transitions.set(from,new Set())
            bucket = this.transitions.get(from)!
        }
        bucket.add(to);
        return this;
    }

    

    /**
     * Method for adding multiple transitions
     * @param from The non-terminal to add the transition from
     * @param to The array of strings of symbols to adds transitions to. Can work with more than 1 transition
     */
    public get withTransitions(): {
        from: (start: string) => {
            to: (...end: string[][]) =>  CFGBuilder 
        }
    } {
        return {
            from: (start: string ) => ({
                to : (...end:string[][])=>  {
                    for (let to of end){
                        this.addTransition(start,...to)
                    }
                    return this}
            })
        };
        
    }
    /**
     * Set the start variable
     * @param name The name of the start variable, 1 character
     * @returns The instance of the object
     */
    public withStartVariable(name : string) : CFGBuilder {
        if (name.length!=1){
            throw new IllegalArgument("Start variable name must be 1 character")
        }
        this.startVariableName = name as char;
        this.addVariable(name);
        return this;
    }
    
    public withVariables(...names:string[]):CFGBuilder {
    /**
     * Method for adding variables to the CFG. Sets the first one as the starting variable
     * @param names The string of symbols for each of the variables
     * @returns An instance of the object
     */
    public withVariables(names:string):CFGBuilder {
        Array.from(names).forEach(name => {
                this.addVariable(name)});
        return this
    }
    /**
     * Method to add a transition to the empty string
     * @param from The non-terminal to add the transition from
     * @returns The instance of the object
     */
    public withEpsilonTransition(from : string) : CFGBuilder{
        this.addTransition(from,EPSILON)
        return this;
    }
    /**
     * Method for building the CFG
     * @returns The built CFG
     */
    public getResult() : CFG{
        if(!this.startVariableName){
            throw new IllegalArgument("No start variable!")
        }
        let cfg = new CFG(this.startVariableName)
        Array.from(this.variables).forEach(variable => cfg.addVariable(variable))
        Array.from(this.terminals).forEach(terminal => cfg.addTerminal(terminal))
        this.transitions.forEach((to,from) => 
                                to.forEach(state => {if(this.isEpsilonTransition(state)){
                                    cfg.addTransitionToEmptyString(from)
                                }else{
                                    cfg.addTransition(from,...state)
                                }}
                                    ))
        return cfg;
    }
    private isEpsilonTransition(transition : string[]) : boolean {
        return transition.length == 1 && transition[0] == EPSILON
    }
}

