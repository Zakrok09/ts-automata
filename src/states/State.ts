import {Symbol} from "../index";
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

    /**
     * Gives the set of characters this state accepts.
     * These are the characters that are bound to an outgoing edge of this graph.
     *
     * @return {Set<Symbol>} the Symbol inputs this state takes without
     * the state it reaches.
     * Used to see what input can this state recognise
     */
    public abstract getInputAlphabet():Set<Symbol>;
}