import { AutomatonUtil } from "./automata-util";
import { TM } from "../../../automata/non-context-free/TM";
import { UndecidableProblem } from "../../../exceptions/exceptions";

export class TMUtil extends AutomatonUtil<TM> {
    /**
     * Checks if the language of the Turing Machine is empty.
     * A Turing Machine's language is empty if there are no accepting states reachable from the start state.
     * @param automaton The TM to check
     * @throws an exception as the problem is undecidable
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public isLanguageEmpty(automaton: TM): boolean {
        throw new UndecidableProblem(
            "The problem of determining whether a Turing machine's language is empty is undecidable."
        );
    }

    /**
     * Checks if the language of the Turing Machine contains all strings (sigma star).
     * @param automaton The TM to check
     * @throws an exception as the problem is undecidable
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public isLanguageAllStrings(automaton: TM): boolean {
        throw new UndecidableProblem(
            "The problem of determining whether a Turing machine's language is all strings is undecidable."
        );
    }

    /**
     * Checks if the language of the Turing Machine contains a specific string.
     * @param automaton the automaton to check
     * @param word the string to be checked
     * @throws an exception as the problem is undecidable
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public doesLanguageContainString(automaton: TM, word: string): boolean {
        throw new UndecidableProblem(
            "The problem of determining whether a Turing machine's language contains a specific string is undecidable."
        );
    }

    /**
     * Checks if the language of the Turing Machine contains a specific string.
     * @param automaton the initial automaton
     * @param other the other Turing machine to compare with
     * @throws an exception as the problem is undecidable
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public equal(automaton: TM, other: TM): boolean {
        throw new UndecidableProblem(
            "The problem of determining whether two Turing machines recognize the same language is undecidable."
        );
    }
}
