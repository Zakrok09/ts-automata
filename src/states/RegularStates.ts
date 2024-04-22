import {char} from "../types";
import {IllegalArgument} from "../exceptions/exceptions";
import {State} from "./State";

export interface RegularState extends State {
    insertTransition(input:char, to:RegularState):void
}

export class NFAState extends State implements RegularState {
    private readonly _transitions: Map<char, Set<NFAState>>

    constructor(name: string) {
        super(name);
        this._transitions = new Map<char, Set<NFAState>>();
    }

    /**
     * Retrieves the transitions of the NFAState.
     *
     * @return {Map<char, Set<NFAState>>} The transitions of the NFAState.
     */
    get transitions(): Map<char, Set<NFAState>> {
        return this._transitions;
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
        return new Set<char>(this._transitions.keys());
    }

    /**
     * Adds a transition to the DFAState.
     *
     * @param input the input symbol for the transition.
     * @param to the destination state for the transition.
     */
    public insertTransition(input:char, to:NFAState):void {
        let bucket = this._transitions.get(input)
        if (!bucket) {
            bucket = new Set<NFAState>();
            this._transitions.set(input, bucket);
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
        let bucket = this._transitions.get(input)
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
        let res = this._transitions.get(input);

        if (res === undefined) return new Set<NFAState>();

        return res;
    }
}


/**
 * Represents a state in a Deterministic Finite Automaton (DFA).
 *
 * @extends State
 */
export class DFAState extends State implements RegularState {
    private readonly _transitions: Map<char, DFAState>

    constructor(name: string) {
        super(name);
        this._transitions = new Map<char, DFAState>();
    }

    /**
     * Returns the transitions of the DFAState object.
     *
     * @return {Map<char, DFAState>} - A Map object representing the transitions of the DFAState.
     */
    get transitions(): Map<char, DFAState> {
        return this._transitions;
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

type StateRegexTuple = { regex:string, state:GNFAState };

/**
 * Represents a state in a Generalized Non-Deterministic Finite Automaton (GNFA).
 */
export class GNFAState extends State {
    private readonly _transitions: Map<string, GNFAState>
    private readonly _incoming: Set<StateRegexTuple>

    /**
     * Creates a new GNFAState object.
     * @param name the name of the state.
     */
    constructor(name: string) {
        super(name);
        this._transitions = new Map<string, GNFAState>();
        this._incoming = new Set<StateRegexTuple>();
    }

    /**
     * Retrieves the transitions of the GNFAState.
     *
     * @return {Map<string, GNFAState>} The transitions of the GNFAState.
     */
    getInputAlphabet(): Set<string> {
        return new Set<string>(this._transitions.keys());
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
        this._transitions.set(regex, to);
        if (!to._incoming.has({regex, state:this})) to._incoming.add({regex, state:this});
    }

    /**
     * Removes a transition for this GNFAState.
     * @param regex the input character representing the transition to remove.
     * @param state the state to be removed (since, there can be more than one outgoing state on that input)
     */
    public removeTransition(regex:string, state:GNFAState):boolean {
        state._incoming.delete({regex, state});
        return this._transitions.delete(regex);
    }

    public getRegexForState(state:GNFAState):string {
        for (let {regex, state: st} of this._incoming) {
            if (st === state) return regex;
        }
        throw new IllegalArgument("State not found");
    }

    get incoming(): Set<StateRegexTuple> {
        return this._incoming;
    }

    get outgoing(): Map<string, GNFAState> {
        return this._transitions;
    }
}