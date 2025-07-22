import { State } from "../../../states/State";
import { Automaton } from "../../../automata/Automaton";

export abstract class AutomatonUtil<TState extends State> {
    protected readonly _automaton: Automaton<TState>;
    public constructor(automaton: Automaton<TState>) {
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
    public equal(other:  Automaton<TState>): boolean {
        return false; // Placeholder for actual implementation
    }
     

}