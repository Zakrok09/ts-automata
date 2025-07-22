import { DFAState } from "~/states/RegularStates";
import { AutomatonUtil } from "./automata-util";
import {DFA} from "../../regular/DFA";

export class DFAUtil extends AutomatonUtil<DFAState> {

    constructor(automaton: DFA) {
        super(automaton);
    }
    public isLanguageEmpty(): boolean {
        return false;
    }
    public isLanguageAllStrings(): boolean {
        return false;
    }
    public doesLanguageContainString(word : string ): boolean {
        return this._automaton.runString(word);
    }
    public equal(other: DFA): boolean {
        return false;
    }

}