/**
 * Represents a state in an automaton.
 */
export abstract class State {
    public readonly name: string;
    public accepting: boolean;

    /**
     * Creates a new instance of the constructor.
     *
     * @param {string} name - The name of the instance.
     */
    protected constructor(name: string) {
        this.name = name;
        this.accepting = false;
    }
}
