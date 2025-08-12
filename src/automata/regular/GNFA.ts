import {Alphabet, Automaton, EPSILON} from "../../automata";
import {GNFAState} from "../../states/RegularStates";

/**
 * Represents a Generalized Non-Deterministic Finite Automaton (GNFA).
 * @extends Automaton with GNFAState.
 * @classdesc a GNFA is a 5-tuple of its states, alphabet, transition function, starting state
 * and a set of accepting states.
 * It has equivalent power to DFAs and NFAs.
 * Decides Regular languages.
 * @link https://en.wikipedia.org/wiki/Generalized_nondeterministic_finite_automaton
 * @since 0.5.0
 */
export class GNFA extends Automaton<GNFAState> {
    public copy(): GNFA {
        const newGNFA = new GNFA(this.alphabet.joinToString(),this.startState.name,this.finalState.name)
        this.states.forEach(state => {if (!newGNFA.getState(state.name)){newGNFA.addState(state.name)}})
        this.states.forEach(state => state.outgoing
                            .forEach((nextState,sym)=> newGNFA.addEdge(state.name,sym,nextState.name)))
        return newGNFA;
    }

    private readonly finalState: GNFAState;

    /**
     * Constructs a generalised non-deterministic finite automaton given an alphabet and a starting state.
     *
     * @param alphabetString the alphabet of the automaton. Should not change throughout execution.
     * @param startState the name of the starting state.
     * @param finalState the name of the final state.
     */
    public constructor(alphabetString: string, startState: string, finalState:string) {
        const start: GNFAState = new GNFAState(startState);
        super(Alphabet.fromString(alphabetString), start);

        this.finalState = new GNFAState(finalState);
        this.finalState.accepting = true;
        this.states.set(finalState, this.finalState);
        this.acceptStates.add(start);
    }

    /**
     * Checks the validity of the GNFA.
     * @returns true if the GNFA is valid, false otherwise.
     */
     
    public isValid(): boolean {
        throw new Error("Method not implemented.");
    }

    /**
     * Adds a state to the GNFA.
     * @param name the name of the state to add.
     */
    public addState(name: string): void {
        this.states.set(name, new GNFAState(name));
    }

    /**
     * Inserts states into the GNFA.
     * @param names the names of the states to insert.
     */
    public insertStates(...names:string[]) {
        super.addStates(false, ...names);
    }

    /**
     * Rips a state from the GNFA.
     * Uses Sipser's algorithm to rip a state from the GNFA.
     * @param stateName the name of the state to rip.
     */
    public ripState(stateName:string): void {
        const ripState = this.states.get(stateName);
        if (!ripState) throw new Error(`State ${stateName} does not exist!`);

        if (ripState === this.startState || ripState === this.finalState) {
            throw new Error("Cannot rip start or final state!");
        }

        let midRegex = "";

        for (const [reg, state] of ripState.outgoing) {
            if (state === this.finalState) {
                midRegex = reg;
                break;
            }
        }

        ripState.incoming.forEach(({regex: fromRegex, state}) => {
            if (state === ripState) return;
            state.removeTransition(fromRegex, ripState);


            ripState.outgoing.forEach((toState, toRegex) => {
                if (toState === ripState) return;
                let compoundRegex = (fromRegex === EPSILON) ? "" : `(${fromRegex})`;
                if (midRegex !== "" || midRegex !== EPSILON) compoundRegex += `(${midRegex})*`;
                if (toRegex !== EPSILON) compoundRegex += `(${toRegex})`;

                let altRegex = "";

                state.incoming.forEach(({regex: alt, state: fromState}) => {
                    if (fromState === state) altRegex = alt;
                });

                if (altRegex !== "") {
                    compoundRegex = `${compoundRegex}|`;
                }
                state.insertTransition(compoundRegex, toState);
            });
        });

        this.states.delete(stateName);
    }

    /**
     * Adds an edge to the GNFA.
     * @param from the name of the state to add the edge from.
     * @param to the name of the state to add the edge to.
     * @param over the symbol over which the edge is.
     */
    public addEdge(from: string, to: string, over: string): void {
        const fromState = this.states.get(from);
        const toState = this.states.get(to);

        if (!fromState || !toState) throw new Error("State does not exist!");

        if (over === EPSILON) over = "";

        fromState.insertTransition(over, toState);
    }

    /**
     * Runs a string on the GNFA.
     * @param str the string to run.
     * @returns true if the string is accepted, false otherwise.
     */
    public runString(str: string): boolean {
        this.states.forEach(state => {
            if (state !== this.finalState && state !== this.startState) this.ripState(state.name);
        });

        return new RegExp(this.finalState.getRegexForState(this.startState)).test(str);
    }

    /**
     * Gets the type of the machine.
     */
     
    public get machineType(): string {
        return "GNFA";
    }
}