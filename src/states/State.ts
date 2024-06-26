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
}