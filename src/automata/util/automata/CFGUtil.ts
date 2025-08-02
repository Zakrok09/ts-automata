import { UndecidableProblem } from "../../../exceptions/exceptions";
import { CFG } from "../../../automata/context-free/CFG";
import { char, EPSILON } from "../../../types";
import { CFGEdge, CFGVariable } from "../../../states/CFGState";

export class CFGUtil {
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
    public toChomskyNormalForm(cfg :CFG) : CFG{
        let newCFG = this.prependToCFGSymbols(cfg,"-")
        newCFG.addVariable("S")
        newCFG.addTransition("S",newCFG.startVariable.symbol)
        newCFG.changeStartVariable("S")
        newCFG = this.removeEpsilonTransitions(newCFG)
        newCFG = this.removeAllUnitRules(newCFG)
        newCFG = this.allRulesProperForm(newCFG)
        return newCFG;
    }
    private allRulesProperForm(cfg : CFG) : CFG{
        let counter = 0;
        let allTransitions = this.getTransitionsInMap(cfg);
        let newTransitions : Map<string,string[][]>= new Map()
        for(let [from , toTransitions] of allTransitions){
            newTransitions.set(from,[])
            for(let to of toTransitions){
                if(to.length>2){
                    let size = to.length;
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
        for(let name of newTransitions.keys()){
            if(!cfg.getVariable(name)){
                cfg.addVariable(name)
            }
        }
        allTransitions = newTransitions
        this.removeAllTransitions(cfg);
        for(let [key,to] of allTransitions){
            allTransitions.set(key,this.uniqueify(to))
        }
        for(let [sym,toTransitions] of allTransitions){
            for(let transition of toTransitions ){
                if(transition.length==1&&transition[0]==EPSILON&&sym==cfg.startVariable.symbol){
                    cfg.addTransitionToEmptyString(cfg.startVariable.symbol)
                    continue;
                }
                cfg.addTransition(sym,...transition.map(x=>this.removeDelimiter(x,".")))
            }
        }
        return cfg;
    }
    private removeAllUnitRules(cfg :CFG) : CFG{
        let allTransitions = this.getTransitionsInMap(cfg)
        let flag = true;
        while(flag){
            let temp : Map<string,string[][]> = new Map()
            flag = false;
            for(let [from,toTransitions] of allTransitions){
                temp.set(from,[]);
                for(let to of toTransitions){
                    if(to.length==1&&to[0]==from){
                        flag = true;
                        continue;
                    }
                    if(to.length==1&&cfg.variables.has(to[0])){
                        temp.get(from)!.push(...allTransitions.get(to[0])!)
                        flag = true;
                    }else{
                        temp.get(from)!.push(to)
                    }
                }
            }
            allTransitions = temp
            for(let [key,to] of allTransitions){
                allTransitions.set(key,this.uniqueify(to))
            }
        }
        this.removeAllTransitions(cfg);
        for(let [key,to] of allTransitions){
            allTransitions.set(key,this.uniqueify(to))
        }
        for(let [sym,toTransitions] of allTransitions){
            for(let transition of toTransitions ){
                if(transition.length==1&&transition[0]==EPSILON&&sym==cfg.startVariable.symbol){
                    cfg.addTransitionToEmptyString(cfg.startVariable.symbol)
                    continue;
                }
                cfg.addTransition(sym,...transition.map(x=>this.removeDelimiter(x,".")))
            }
        }
        return cfg;
    }

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
                    if(to.find(x=> variablesWithEpsilon.has(x))){
                        flag = true;
                        let removedTransitions = this.removeEpsilonEdge(to,variablesWithEpsilon)
                        temp.get(from)!.push(to.map(x=>"."+x))
                        temp.get(from)!.push(...removedTransitions)
                    }else{
                        temp.get(from)!.push(to)

                    }
                }
            }
            transitions = temp
            for(let [from , toTransitions] of transitions){
                if(toTransitions.filter(x=> x.length==1&&x[0]==EPSILON).length>=1){
                    variablesWithEpsilon.add(from)
                }
            }
        }
        this.removeAllTransitions(cfg);
        for(let [key,to] of transitions){
            transitions.set(key,this.uniqueify(to))
        }
        for(let [sym,toTransitions] of transitions){
            for(let transition of toTransitions ){
                if(transition.length==1&&transition[0]==EPSILON&&sym!=cfg.startVariable.symbol){
                    continue;
                }
                if(transition.length==1&&transition[0]==EPSILON&&sym==cfg.startVariable.symbol){
                    cfg.addTransitionToEmptyString(cfg.startVariable.symbol)
                    continue;
                }
                cfg.addTransition(sym,...transition.map(x=>this.removeDelimiter(x,".")))
            }
        }
        return cfg;

    }

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
    private getTransitionsInMap(cfg :CFG) : Map<string,string[][]>{

        let transitions : Map<string,string[][]> = new Map()
        for(let [symbol,variable] of cfg.variables){
            transitions.set(symbol,[])
            for(let transition of variable.transitions){
                let mappedTransition = transition.map(x=> x.symbol)
                let toBePushed = transitions.get(symbol)!
                toBePushed.push(mappedTransition)
            }
        }
        return transitions

    }
    private removeAllTransitions(cfg : CFG) {

        for(let [sym,variable] of cfg.variables){
            for(let transition of variable.transitions){
                cfg.removeTransition(this.removeDelimiter(sym,"."),
                    ...transition.map(x=>this.removeDelimiter(x.symbol,".")))
            }
        }
    }
    private removeDelimiter(name : string,delimeter : string){
        if(name.startsWith(delimeter)){
            return name.slice(delimeter.length)
        }
        return name;
    }
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
    private getUnitRulesOfVariable(cfg : CFG,variable : string): string[]{
        return Array.from(cfg.getVariable(variable)!.transitions)
                                .map(x=>x.map(y=>y.symbol))
                                .filter(x=>x.length==1&&x[0]!=EPSILON)
                                .flat()
    }
    
    public  isLanguageAllStrings(cfg : CFG): boolean {
        throw new UndecidableProblem("Universality of CFGs is an undecidable problem!")

    }
    public  doesLanguageContainString(cfg : CFG,word : string): boolean {
        return false;
    }
    // Checks if two automata reconize the same language.
    public equal(cfg : CFG, otherCfg:  CFG): boolean {
        throw new UndecidableProblem("Equality of CFGs is an undecidable problem!")
    } 

}