import { UndecidableProblem } from "../../../exceptions/exceptions";
import { CFG } from "../../../automata/context-free/CFG";
import { char, EPSILON } from "../../../types";
import { CFGEdge } from "../../../states/CFGState";

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
        return cfg;
    }
    private prependToCFGSymbols(cfg :CFG,prepend : string) : CFG{
        let copyOfCFG = new CFG(prepend+cfg.startVariable.symbol)
        cfg.terminals.forEach(terminal => copyOfCFG.addTerminal(terminal.symbol))
        cfg.variables.forEach(variable => copyOfCFG.addVariable(prepend+variable.symbol))
        cfg.variables.forEach(variable => variable.transitions.
                        forEach(transition => 
                            copyOfCFG.addTransition(variable.symbol,...transition.map(x=> prepend+x.symbol))))
        return cfg;


    }
    public removeEpsilonTransitions(cfg : CFG) : CFG{
        let transitions : Map<string,string[][]> = this.getTransitionsInMap(cfg)
        let variablesWithEpsilon = this.getVariablesWithSingleTransition(cfg,EPSILON)
        let flag : boolean = true
        while(flag){
            flag = false;
            let newTransitions : Map<string,string[][]> = new Map()
            for(let [from , toTransitions] of transitions){
                newTransitions.set(from,[])
                for(let transition of toTransitions){
                    let toBeRipped = transition.find(x=>variablesWithEpsilon.has(x))
                    if(toBeRipped){
                        flag = true;
                        newTransitions.get(from)!.push(...this.removeEpsilonEdge(transition,toBeRipped))
                    }else{
                        newTransitions.get(from)!.push([...transition])
                    }
                }
            }
            transitions = newTransitions
        }

        this.removeAllTransitions(cfg);
        for(let [sym,toTransitions] of transitions){
            for(let transition of toTransitions ){
                if(transition.length==0&&transition[0]==EPSILON){
                    continue;
                }
                cfg.addTransition(sym,...transition.map(x=>this.removeDelimiter(x,".")))
            }
        }
        return cfg;

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
                cfg.removeTransition(sym,...transition.map(x=>x.symbol))
            }
        }
    }
    private removeDelimiter(name : string,delimeter : string){
        if(name.startsWith(delimeter)){
            return name.slice(0,delimeter.length)
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
    private removeEpsilonEdge(edge : string[], variable: string) : string[][]{
        let index = edge.indexOf(variable)
        let arrayCopy = [...edge]
        let arrayWithElementRemoved = [...edge]
        arrayCopy[index] = "."+arrayCopy[index]
        arrayWithElementRemoved.splice(index)
        return [arrayCopy,arrayWithElementRemoved]
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