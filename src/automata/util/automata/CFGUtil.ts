import { UndecidableProblem } from "../../../exceptions/exceptions";
import { CFG } from "../../../automata/context-free/CFG";
import { char, EPSILON } from "../../../types";

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
        let resCFG = new CFG(("S"+1) as char)
        return cfg;
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