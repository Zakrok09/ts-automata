import { UndecidableProblem } from "../../../exceptions/exceptions";
import { CFG } from "../../../automata/context-free/CFG";
import { char, EPSILON } from "../../../types";
import { CFGEdge, CFGVariable } from "../../../states/CFGState";
import { table } from "console";

export class CFGUtil {
    private delimeter = ".."
    public constructor() {
        
    }

    /**
     * Checks if the language of the CFG is empty. Using procedure from Sipser's proof of theorem 4.8
     * @param cfg The CFG to check
     * @returns True if the language is empty, false otherwise
     */
    public  isLanguageEmpty(cfg : CFG): boolean{
        let marked  : Set<string>= new Set()
        for(let [symbol,terminal] of cfg.terminals){
            marked.add(symbol)
        }
        marked.add(EPSILON)

        let newMarkedCnt = marked.size+1
        while (newMarkedCnt > 0){
            let currentCounter = 0;
            for(let [symbol,variable] of cfg.variables){
                if(marked.has(symbol)){
                    continue;
                }
                
                let isFullyMarked = Array.from(variable.transitions)
                                        .some(transition => 
                                            transition.map(x=> x.symbol).every(x=>
                                                                        marked.has(x)))
                if (isFullyMarked){
                    currentCounter++;
                    marked.add(symbol)
                }
            }
            newMarkedCnt = currentCounter
        }

        return !marked.has(cfg.startVariable.symbol);
    }
    /**
     * Converts to Chomsky Normal form using procedure from Sipser
     * @param cfg The cfg
     * @returns Equivallent CFG in Chomsky Normal Form (CNF)
     */
    public toChomskyNormalForm(cfg :CFG) : CFG{
        
        let newCFG = this.prependToCFGSymbols(cfg,"-")
        // Add new Start State
        newCFG.addVariable("S0")
        newCFG.addTransition("S0",newCFG.startVariable.symbol)
        newCFG.changeStartVariable("S0")
        newCFG = this.terminalToVariableConverter(newCFG)
        newCFG = this.removeEpsilonTransitions(newCFG)
        newCFG = this.removeAllUnitRules(newCFG)
        newCFG = this.allRulesProperForm(newCFG)
        return newCFG;
    }
    /**
     * Ensures no transitions of more than 2 terminals+variables is remaining
     * From Sipser's method. X-> XYZ => X-> XU1, U1 -> YZ
     * @param cfg The CFG
     * @returns The same CFG in proper form
     */
    private allRulesProperForm(cfg : CFG) : CFG{
        // maintain a counter of variables to not run into name collisions
        let counter = 0;
        let allTransitions = this.getTransitionsInMap(cfg);
        let newTransitions : Map<string,string[][]>= new Map()
        // Change the transitions
        for(let [from , toTransitions] of allTransitions){
            newTransitions.set(from,[])
            for(let to of toTransitions){
                if(to.length>2){
                    let size = to.length;
                    // Do the non-terminal chaining
                    allTransitions.set("(U"+counter++ +")",[[to[size-2],to[size-1]]])
                    for(let i = size-3; i>=1;--i){
                        allTransitions.set("(U"+counter++ +")",[[to[i],"(U"+(counter-2) +")"]])
                    }
                    allTransitions.get(from)!.push([to[0],"(U"+(counter-1)+")"])
                }else{
                    newTransitions.get(from)!.push(to)
                }
            }
        }
        
        // ADd the new terminals generated
        for(let name of newTransitions.keys()){
            if(!cfg.getVariable(name)){
                cfg.addVariable(name)
            }
        }
        return this.refreshTheEdges(cfg,newTransitions)
        
    }
    /**
     * Method to remove the old edges and put the new ones
     * @param cfg The old CFG
     * @param allTransitions The new transitions
     * @returns Refreshed CFG
     */
    private refreshTheEdges(cfg : CFG, allTransitions : Map<string,string[][]>) : CFG{
        this.removeAllTransitions(cfg);
        for(let [key,to] of allTransitions){
            allTransitions.set(key,this.uniqueify(to))
        }
        // Add the new transitions
        for(let [sym,toTransitions] of allTransitions){
            for(let transition of toTransitions ){
                if(transition.length==1&&transition[0]==EPSILON&&sym!=cfg.startVariable.symbol){
                    continue;
                }
                if(transition.length==1&&transition[0]==EPSILON&&sym==cfg.startVariable.symbol){
                    cfg.addTransitionToEmptyString(cfg.startVariable.symbol)
                    continue;
                }
                // Remove the delimiter from all states
                cfg.addTransition(sym,...transition.map(x=>this.removeDelimiter(x,this.delimeter)))
            }
        }
        return cfg;
    }
    /**
     * Remove all unit rules of the form A->B
     * @param cfg The cfg
     * @returns THe equivallent CFG with all unit rules removed
     */
    private removeAllUnitRules(cfg :CFG) : CFG{
        let allTransitions = this.getTransitionsInMap(cfg)
        // Flag to see if any new changes were done in the CFG
        let flag = true;
        let removed : Set<string> = new Set()
        while(flag){
            let temp : Map<string,string[][]> = new Map()
            flag = false;
            for(let [from,toTransitions] of allTransitions){
                temp.set(from,[]);
                for(let to of toTransitions){
                    // Remove self edges X -> X
                    if(to.length==1&&to[0]==from){
                        flag = true;
                        continue;
                    }
                    // If in the form of X-> Y
                    if(to.length==1&&cfg.variables.has(to[0])){
                        if(removed.has(JSON.stringify([from,to]))){
                            continue
                        }
                        removed.add(JSON.stringify([from,to]))
                        // ... add all of the edges of Y to X
                        temp.get(from)!.push(...allTransitions.get(to[0])!)
                        flag = true;
                    }else{
                        temp.get(from)!.push(to)
                    }
                }
            }
            allTransitions = temp
            // Simplify the CFG for performance
            for(let [key,to] of allTransitions){
                allTransitions.set(key,this.uniqueify(to))
            }
        }
        return this.refreshTheEdges(cfg,allTransitions);
    }
    /**
     * Prepend a string to all non-terminals
     * @param cfg The cfg
     * @param prepend the string to prepend: x -> prepend+x
     * @returns The new CFG
     */
    private prependToCFGSymbols(cfg :CFG,prepend : string) : CFG{
        let copyOfCFG = new CFG(prepend+cfg.startVariable.symbol)
        cfg.terminals.forEach(terminal => copyOfCFG.addTerminal(terminal.symbol))
        cfg.variables.forEach(variable => copyOfCFG.addVariable(prepend+variable.symbol))
        cfg.variables.forEach(variable => variable.transitions.
                        forEach(transition => 
                            { if(transition.length == 1 && transition[0].symbol==EPSILON){
                                copyOfCFG.addTransitionToEmptyString(prepend+variable.symbol)
                            }else{
                                copyOfCFG.addTransition(prepend+variable.symbol,
                                ...transition.map(x=> x instanceof CFGVariable ? prepend+x.symbol: x.symbol))}}))
        return copyOfCFG;
    }
    private terminalToVariableConverter(cfg : CFG) : CFG{
        let counter = 0
        let transitions = this.getTransitionsInMap(cfg)
        let terminalToVariable : Map<string,string> = new Map();
        for(let [sym,terminal] of cfg.terminals){
            let nonTerminalName = "T"+counter++
            terminalToVariable.set(sym,nonTerminalName)
            transitions.set(nonTerminalName,[[sym]])
        }
        for(let [from , toTransitions] of transitions){
            if(terminalToVariable.values().find(x=>x==from)){
                continue
            }
            for(let to of toTransitions){
                for(let i = 0; i <to.length ;++i){
                    if(cfg.terminals.has(to[i])){
                        to[i]=terminalToVariable.get(to[i])!
                    }
                }
            }
        }
        // ADd the new terminals generated
        for(let name of transitions.keys()){
            if(!cfg.getVariable(name)){
                cfg.addVariable(name)
            }
        }
       this.removeAllTransitions(cfg);
        for(let [key,to] of transitions){
            transitions.set(key,this.uniqueify(to))
        }
        // Add the new transitions
        for(let [sym,toTransitions] of transitions){
            for(let transition of toTransitions ){
                if(transition.length==1&&transition[0]==EPSILON){
                    cfg.addTransitionToEmptyString(sym)
                    continue;
                }
                // Remove the delimiter from all states
                cfg.addTransition(sym,...transition.map(x=>this.removeDelimiter(x,this.delimeter)))
            }
        }
        return cfg;
    }
    /**
     * Remove all transitions in the form of X -> EPSILON
     * @param cfg The old CFG
     * @returns Equivallent CFG such that only the start non-terminal has an epsilon transition
     */
    private removeEpsilonTransitions(cfg : CFG) : CFG{

        let transitions = this.getTransitionsInMap(cfg)
        let variablesWithEpsilon = this.getVariablesWithSingleTransition(cfg,EPSILON)
        let flag : boolean = true
        while(flag){
            flag = false;
            let temp : Map<string,string[][]> = new Map()
            for(let [from,toTransitions] of transitions){
                for(let to of toTransitions){
                    if(!temp.get(from)){
                            temp.set(from,[])
                    }
                    // If it can transition to an epsilon non-terminal
                    if(to.find(x=> variablesWithEpsilon.has(x))){
                        flag = true;
                        let removedTransitions = this.removeEpsilonEdge(to,variablesWithEpsilon)
                        // Delimit the edge that has all variables in it such that it doesn't cause an infinite loop
                        temp.get(from)!.push(to.map(x=>this.delimeter+x))
                        temp.get(from)!.push(...removedTransitions)
                    }else{
                        temp.get(from)!.push(to)

                    }
                }
            }
            transitions = temp
            // Some variables may have a new epsilon transition, keep track of it
            for(let [from , toTransitions] of transitions){
                if(toTransitions.filter(x=> x.length==1&&x[0]==EPSILON).length>=1){
                    variablesWithEpsilon.add(from)
                }
            }
        }

        return this.refreshTheEdges(cfg,transitions)

    }

    /**
     * Method to remove redundant transitions
     * @param arrays The list of transitions
     * @returns Simplified list of transitions that are distinct
     */
    private uniqueify(arrays: string[][]): string[][] {
        const seen = new Set<string>();
        const result: string[][] = [];

        for (const array of arrays) {
            const key = JSON.stringify(array);
            if (!seen.has(key)) {
            seen.add(key);
            result.push(array);
            }
        }

        return result;
    }
    /**
     * Get the CFG transitions in map format
     * @param cfg The cfg
     * @returns The transitions in a map
     */
    private getTransitionsInMap(cfg :CFG) : Map<string,string[][]>{

        let transitions : Map<string,string[][]> = new Map()
        for(let [symbol,variable] of cfg.variables){
            transitions.set(symbol,[])
            for(let transition of variable.transitions){
                let mappedTransition = transition.map(x=> x.symbol)
                let toBePushed = transitions.get(symbol)!
                toBePushed.push(mappedTransition)
            }
            transitions.set(symbol,this.uniqueify(transitions.get(symbol)!))
        }
        return transitions

    }
    /**
     * Helper to remove all transitions from the CFG
     * @param cfg the CFG
     */
    private removeAllTransitions(cfg : CFG) : void {

        for(let [sym,variable] of cfg.variables){
            for(let transition of variable.transitions){
                cfg.removeTransition(this.removeDelimiter(sym,this.delimeter),
                    ...transition.map(x=>this.removeDelimiter(x.symbol,this.delimeter)))
            }
        }
    }
    /**
     * Remove prefix from string
     * @param name The original string
     * @param delimeter The delimiter that it _may_ start with
     * @returns The string with the delimiter possible removed, returns original string if not
     */
    private removeDelimiter(name : string,delimeter : string) :string{
        if(name.startsWith(delimeter)){
            return name.slice(delimeter.length)
        }
        return name;
    }
    /**
     * Get variables with a single transition to the symbol
     * @param cfg The CFG
     * @param symbol the symbol a
     * @returns all variables X with the transition X -> a
     */
    private getVariablesWithSingleTransition(cfg : CFG, symbol : string) : Set<string>{
        let res : Set<string> = new Set()
        let variables = cfg.variables;
        for (let [sym,variable] of variables){
            for(let transition of variable.transitions){
                if(transition.length==1 && transition[0].symbol==symbol){
                    res.add(sym)
                    break;
                }
            }
        }
        return res;
    }
    
    /**
     * Remove a single epsilon edge by method described by Sipser
     * @param edge The transition eg: X -> XbX
     * @param epsilonVariables The set of variables in the CFG with an epsilon transition
     * @returns new transitions as decsribed by Sipser
     */
    private removeEpsilonEdge(edge : string[], epsilonVariables : Set<string>) : string[][]{
        let res : string[][] = []
        for(let i = 0 ; i < edge.length;++i){
            if(epsilonVariables.has(edge[i])){
                let arrayToPush = [...edge]
                arrayToPush.splice(i,1)
                if(arrayToPush.length ==0){
                    arrayToPush.push(EPSILON)
                }
                res.push(arrayToPush)
            }
        }
        

        return res
    }
    
    /**
     * Method that (sadly) cannot check if the language is all strings
     * @param cfg The cfg
     */
    public isLanguageAllStrings(cfg : CFG): boolean {
        throw new UndecidableProblem("Universality of CFGs is an undecidable problem!")

    }
    /**
     * Implements Sipser's DP algorithm 
     * @param cfg The cfg
     * @param word The word to check if it is in the language
     * @returns True if the word is in the language
     */
    public  doesLanguageContainString(cfg : CFG,word : string): boolean {
        
        cfg = this.toChomskyNormalForm(cfg)
        if(word ==EPSILON||word==""){
            if(Array.from(cfg.startVariable.transitions).find(x=>x.length==1&&x[0].symbol==EPSILON)){
                return true;
            }else{
                return false;
            }
        }
        let n :number = word.length;
        var dp : string[][][]= [];
        for(let i = 0; i < n; i++) {
            dp.push([])
            for(let j = 0; j < n;++j)[
                dp[i].push([])
            ]
        }
        
        for(let i = 0; i<n;++i){
            dp[i][i].push(...Array.from(this.getVariablesWithSingleTransition(cfg,word[i])))
        }
        let allTransitions = this.getTransitionsInMap(cfg);
        for(let l = 2 ; l <=n; l++){
            for(let i = 0 ; i<=n-l;++i){
                let j = i+l-1;
                for(let k = i; k<=j-1;++k){
                    for(let [A,transitions] of allTransitions){
                        for(let transition of transitions){
                            if(!(transition.length==2 &&
                                 transition.every(x=>allTransitions.has(x)))){
                                continue;
                            }
                            let B = transition[0]
                            let C = transition[1]

                            if(dp[i][k].includes(B)&&dp[k+1][j].includes(C)){
                                dp[i][j].push(A)
                            }
                        }
                    }
                }
            }
        }
        return dp[0][n-1].includes(cfg.startVariable.symbol);
    }
    // Checks if two automata reconize the same language.
    public equal(cfg : CFG, otherCfg:  CFG): boolean {
        throw new UndecidableProblem("Equality of CFGs is an undecidable problem!")
    } 
    /**
     * Check if CFG in Chomsky Normal Form
     * @param cfg The cfg
     * @returns True if the CFg is in Chomsky Normal Form
     */
    public isInChomskyNormalForm(cfg : CFG) : boolean {

        return [this.checkStartRule(cfg),
                this.checkEpsilonRule(cfg),
                this.checkProperFormRule(cfg),
                this.checkUnitRule(cfg)].every(x=>x)

    }
    /**
     * Check if the start variable is in any transition
     * @param cfg The CFG
     * @returns fALSE if the start variable is in any transition
     */
    private checkStartRule(cfg : CFG) : boolean {
        let start = cfg.startVariable.symbol;
        for(let [fromSymbol,variable] of cfg.variables){
            for(let transitions of variable.transitions){
                if(transitions.map(x=>x.symbol).includes(start)){
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * Check the unit rule
     * @param cfg The CFG
     * @returns True if there arent any unit rules
     */
    private checkUnitRule(cfg : CFG) : boolean {
        for(let [fromSymbol,variable] of cfg.variables){
            for(let transition of variable.transitions){
                if(transition.length==1 && transition[0] instanceof CFGVariable){
                    return false;
                }
            }
        }
        return true;

    }
    /**
     * Checks the epsilon rule
     * @param cfg The cfg
     * @returns True if there aren't any other epsilon transitions than in the start state
     */
    private checkEpsilonRule(cfg : CFG) : boolean {
        for(let [fromSymbol,variable] of cfg.variables){
            for(let transition of variable.transitions){
                if(transition.length==1 && transition[0].symbol == EPSILON 
                            && fromSymbol!=cfg.startVariable.symbol){
                    return false;
                }
            }
        }
        return true;

    }
    /**
     * Checks if the transitions are in proper form
     * @param cfg The cfg
     * @returns True if there aren't any transitions with more than 2 symbols
     */
    private checkProperFormRule(cfg : CFG) : boolean {
        for(let [fromSymbol,variable] of cfg.variables){
            for(let transition of variable.transitions){
                if(transition.length>2){
                    return false;
                }
            }
        }
        return true;

    }

}