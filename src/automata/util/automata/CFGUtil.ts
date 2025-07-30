import { UndecidableProblem } from "~/exceptions/exceptions";
import { CFG } from "../../../automata/context-free/CFG";

export class CFGUtil {
    public constructor() {
        
    }

    public  isLanguageEmpty(cfg : CFG): boolean{
        return true;
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