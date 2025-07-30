import { State } from "../../../states/State";
import { Automaton } from "../../../automata/Automaton";

export abstract class AutomatonUtil<T extends Automaton<State>> {
    public constructor() {
        
    }

    public abstract isLanguageEmpty(automaton : T): boolean
    public abstract isLanguageAllStrings(automaton : T): boolean 
    public abstract doesLanguageContainString(automaton : T,word : string): boolean 
    // Checks if two automata reconize the same language.
    public abstract equal(automaton : T, other:  T): boolean 

}