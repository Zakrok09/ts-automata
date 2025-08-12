import {IllegalArgument} from "../exceptions/exceptions";
import {State} from "./State";
import {char} from "../types";

export interface RegularState extends State {
    insertTransition(input:char, to:RegularState):void
}

export class NFAState extends State implements RegularState {
    public readonly transitions: Map<char, Set<NFAState>>

    constructor(name: string) {
        super(name);
        this.transitions = new Map<char, Set<NFAState>>();
    }

    /**
     * Gives the set of characters this state accepts.
     * These are the characters that are bound to an outgoing edge of this graph.
     *
     * @return {Set<char>} the char inputs this state takes without
     * the state it reaches.
     * Used to see what input can this state recognise
     */
    public getInputAlphabet():Set<char> {
        return new Set<char>(this.transitions.keys());
    }

    /**
     * Adds a transition to the DFAState.
     *
     * @param input the input symbol for the transition.
     * @param to the destination state for the transition.
     */
    public insertTransition(input:char, to:NFAState):void {
        let bucket = this.transitions.get(input)
        if (!bucket) {
            bucket = new Set<NFAState>();
            this.transitions.set(input, bucket);
        }

        if (!bucket.has(to)) bucket.add(to);
    }

    /**
     * Removes a transition from the collection.
     *
     * @param input the input character representing the transition to remove.
     * @param state the state to be removed (since, there can be more than one outgoing state on that input)
     * @return true if the transition was successfully removed, false otherwise.
     */
    public removeTransition(input:char, state:NFAState):boolean {
        const bucket = this.transitions.get(input)
        if (!bucket) return false;

        return bucket.delete(state);
    }

    /**
     * Get the next state given input
     *
     * @param input the input to be given
     * @return the set of NFA States
     */
    public transition(input:char) {
        const res = this.transitions.get(input);

        if (!res) return new Set<NFAState>();

        return res;
    }
}


/**
 * Represents a state in a Deterministic Finite Automaton (DFA).
 *
 * @extends State
 */
export class DFAState extends State implements RegularState {
    public readonly transitions: Map<char, DFAState>

    constructor(name: string) {
        super(name);
        this.transitions = new Map<char, DFAState>();
    }

    /**
     * Gives the set of characters this state accepts. These are the
     * characters that are bound to an outgoing edge of this graph.
     *
     * @return {Set<char>} the char inputs this state takes without
     * the state it reaches. Used to see what input can this state recognise
     */
    public getInputAlphabet():Set<char> {
        return new Set<char>(this.transitions.keys());
    }

    /**
     * Adds a transition to the DFAState.
     *
     * @param input the input symbol for the transition.
     * @param to the destination state for the transition.
     */
    public insertTransition(input:char, to:DFAState):void {
        this.transitions.set(input, to);
    }

    /**
     * Removes a transition from the collection.
     *
     * @param input the input character representing the transition to remove.
     * @return true if the transition was successfully removed, false otherwise.
     */
    public removeTransition(input:char):boolean {
        return this.transitions.delete(input);
    }

    /**
     * Get the next state given input
     *
     * @param input the input to be given
     * @return the DFAState
     */
    public transition(input:char) {
        const res = this.transitions.get(input);

        if (!res) throw IllegalArgument;

        return res;
    }
}

type StateRegexTuple = { regex:string, state:GNFAState };

/**
 * Represents a state in a Generalized Non-Deterministic Finite Automaton (GNFA).
 */
export class GNFAState extends State {
    private readonly transitions: Map<string, GNFAState>
    public readonly incoming: Set<StateRegexTuple>

    /**
     * Creates a new GNFAState object.
     * @param name the name of the state.
     */
    constructor(name: string) {
        super(name);
        this.transitions = new Map<string, GNFAState>();
        this.incoming = new Set<StateRegexTuple>();
    }

    /**
     * Retrieves the transitions of the GNFAState.
     *
     * @return {Map<string, GNFAState>} The transitions of the GNFAState.
     */
    getInputAlphabet(): Set<string> {
        return new Set<string>(this.transitions.keys());
    }

    /**
     * Gives the set of characters this state accepts.
     * These are the characters that are bound to an outgoing edge of this graph.
     *
     * @return {Set<char>} the char inputs this state takes without
     * the state it reaches.
     * Used to see what input can this state recognise
     */
    public insertTransition(regex: string, to: GNFAState): void {
        this.transitions.set(regex, to);
        if (!to.incoming.has({regex, state:this})) to.incoming.add({regex, state:this});
    }

    /**
     * Removes a transition for this GNFAState.
     * @param regex the input character representing the transition to remove.
     * @param state the state to be removed (since, there can be more than one outgoing state on that input)
     */
    public removeTransition(regex:string, state:GNFAState):boolean {
        state.incoming.delete({regex, state});
        return this.transitions.delete(regex);
    }

    public getRegexForState(state:GNFAState):string {
        for (const {regex, state: st} of this.incoming) {
            if (st === state) return regex;
        }
        throw new IllegalArgument("State not found");
    }

    get outgoing(): Map<string, GNFAState> {
        return this.transitions;
    }
}