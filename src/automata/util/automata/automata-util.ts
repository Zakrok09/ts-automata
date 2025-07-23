import { State } from "../../../states/State";
import { Automaton } from "../../../automata/Automaton";

export abstract class AutomatonUtil<T extends Automaton<State>> {
    protected readonly _automaton: T;
    public constructor(automaton: T) {
        this._automaton = automaton;
    }

    public isLanguageEmpty(): boolean {
        return false; // Placeholder for actual implementation
    }
    public isLanguageAllStrings(): boolean {
        return false; // Placeholder for actual implementation
    }
    public doesLanguageContainString(word : string): boolean {
        return false; // Placeholder for actual implementation
    }
    // Checks if two automata reconize the same language.
    public equal(other:  T): boolean {
        return false; // Placeholder for actual implementation
    }
    

}