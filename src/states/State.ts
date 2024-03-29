import {char} from "../types";

/**
 * Represents a state in an automaton.
 */
export abstract class State {
    protected readonly _name:string;
    protected _accepting:boolean;

    /**
     * Creates a new instance of the constructor.
     *
     * @param {string} name - The name of the instance.
     */
    protected constructor(name: string) {
        this._name = name;
        this._accepting = false;
    }

    /**
     * Retrieve the name value.
     *
     * @returns {string} The name value.
     */
    public get name(): string {
        return this._name;
    }

    /**
     * Retrieves the value of the accepting property.
     *
     * @return The value of the accepting property.
     */
    public get accepting(): boolean {
        return this._accepting;
    }

    /**
     * Sets the accepting value.
     *
     * @param {boolean} value - The new value to set for accepting.
     */
    public set accepting(value: boolean) {
        this._accepting = value;
    }

    /**
     * Gives the set of characters this state accepts.
     * These are the characters that are bound to an outgoing edge of this graph.
     *
     * @return {Set<char>} the char inputs this state takes without
     * the state it reaches.
     * Used to see what input can this state recognise
     */
    public abstract getInputAlphabet():Set<char>;
}