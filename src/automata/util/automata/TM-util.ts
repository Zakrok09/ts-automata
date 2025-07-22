import { TM } from "../../../automata/non-context-free/TM";
import { TMState } from "../../../states/TMState";
import { AutomatonUtil } from "./automata-util";
import { UndecidableProblem } from "../../../exceptions/exceptions";
export class TMUtil extends AutomatonUtil<TMState> {
    
    constructor(automaton: TM) {
        super(automaton);
    }

    /**
     * Checks if the language of the Turing Machine is empty.
     * A Turing Machine's language is empty if there are no accepting states reachable from the start state.
     * @returns Returns true if the language of the Turing Machine is empty, otherwise false.
     */
    public isLanguageEmpty(): boolean {
        throw new UndecidableProblem("The problem of determining whether a Turing machine's language is empty is undecidable.");
    }
    /**
     * Checks if the language of the Turing Machine contains all strings (sigma star).
     */
    public isLanguageAllStrings(): boolean {
        throw new UndecidableProblem("The problem of determining whether a Turing machine's language is all strings is undecidable.");
    }
    /**
     * Checks if the language of the Turing Machine contains a specific string.
     * @param word the string to be checked
     */
    public doesLanguageContainString(word: string): boolean {
        throw new UndecidableProblem("The problem of determining whether a Turing machine's language contains a specific string is undecidable.");
    }
    /**
     * Checks if the language of the Turing Machine contains a specific string.
     * @param other the other Turing machine to compare with
     */
    public equal(other: TM): boolean {
        throw new UndecidableProblem("The problem of determining whether two Turing machines recognize the same language is undecidable.");
    }


}