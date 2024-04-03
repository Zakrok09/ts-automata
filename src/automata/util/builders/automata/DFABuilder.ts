import {DFA} from "../../../regular/DFA";
import {IllegalArgument} from "../../../../exceptions/exceptions";
import {AutomataBuilder} from "./AutomataBuilder";

/**
 * Represents a builder for creating a Deterministic Finite Automaton (DFA).
 */
export class DFABuilder extends AutomataBuilder<DFA> {
    constructor(alphabet:string) {
        super(alphabet)
    }

    /**
     * Build the DFA with all the stored information so far.
     */
    public getResult():DFA {
        if(!this._startingState) throw new IllegalArgument("cannot build a DFA without any states!")

        const dfa = new DFA(this._alphabetString, this._startingState.name, this._startingState.isFinal)

        for (let {name, isFinal} of this._stateMap.values()) {
            if (name != this._startingState.name)
                dfa.addState(name, isFinal)
        }

        for (let {from, over, to} of this._edges) {
            dfa.addEdge(from, over, to);
        }

        return dfa;
    }
}


