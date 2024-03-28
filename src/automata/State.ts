import {char} from "../index";
import {IllegalArgument} from "../exceptions/exceptions";

/**
 * Represents a state in an automaton.
 */
export abstract class State {
    protected readonly _name:string;
    protected _accepting:boolean;

    protected constructor(name: string) {
        this._name = name;
        this._accepting = false;
    }

    public get name(): string {
        return this._name;
    }

    public get accepting(): boolean {
        return this._accepting;
    }

    public set accepting(value: boolean) {
        this._accepting = value;
    }
}

/**
 * Represents a state in a Deterministic Finite Automaton (DFA).
 *
 * @extends State
 */
export class DFAState extends State {
    private _transitions: Map<char, DFAState>

    constructor(name: string) {
        super(name);
        this._transitions = new Map<char, DFAState>();
    }

    /**
     * Gives the set of characters this state accepts. These are the
     * characters that are bound to an outgoing edge of this graph.
     *
     * @return {Set<char>} the char inputs this state takes without
     * the state it reaches. Used to see what input can this state recognise
     */
    public getInputAlphabet():Set<char> {
        return new Set<char>(this._transitions.keys());
    }

    /**
     * Adds a transition to the DFAState.
     *
     * @param input the input symbol for the transition.
     * @param to the destination state for the transition.
     */
    public insertTransition(input:char, to:DFAState):void {
        this._transitions.set(input, to);
    }

    /**
     * Removes a transition from the collection.
     *
     * @param input the input character representing the transition to remove.
     * @return true if the transition was successfully removed, false otherwise.
     */
    public removeTransition(input:char):boolean {
        return this._transitions.delete(input);
    }

    /**
     * Get the next state given input
     *
     * @param input the input to be given
     * @return the DFAState
     */
    public transition(input:char) {
        let res = this._transitions.get(input);

        if (res === undefined) throw IllegalArgument;

        return res;
    }
}