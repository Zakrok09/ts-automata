import { State } from "../../../states/State";
import { Automaton } from "../../../automata/Automaton";

export abstract class AutomatonUtil<T extends Automaton<State>> {
    public constructor() {
        
    }

    public isLanguageEmpty(automaton : T): boolean {
        return false; // Placeholder for actual implementation
    }
    public isLanguageAllStrings(automaton : T): boolean {
        return false; // Placeholder for actual implementation
    }
    public doesLanguageContainString(automaton : T,word : string): boolean {
        return false; // Placeholder for actual implementation
    }
    // Checks if two automata reconize the same language.
    public equal(automaton : T, other:  T): boolean {
        return false; // Placeholder for actual implementation
    }
    

}