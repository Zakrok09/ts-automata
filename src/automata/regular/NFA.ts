import {FiniteAutomaton} from "./FiniteAutomaton";
import {EPSILON, toChar} from "../../types";
import {DFA} from "./DFA";
import {DFAState, NFAState} from "../../states/RegularStates";
import {IllegalArgument} from "../../exceptions/exceptions";
import {Alphabet} from "../Alphabet";

/**
 * Class representation of a non-deterministic finite automaton.
 *
 * @extends FiniteAutomaton with NFAState.
 */
export class NFA extends FiniteAutomaton<NFAState> {

    /**
     * Constructs a finite automaton given an alphabet and a starting state. Applies to
     * all types of finite automatas defined: DFA, NFA and GNFA.
     *
     * @param alphabetString the alphabet of the automaton. Should not change throughout execution.
     * @param startState the name of the starting state.
     * @param startingAccept whether the starting state should accept.
     */
    public constructor(alphabetString: string, startState: string, startingAccept: boolean) {
        let start:NFAState = new NFAState(startState);
        super(Alphabet.fromString(alphabetString), start);

        if (startingAccept) {
            this._startState.accepting = true;
            this._acceptStates.add(start);
        }
    }

    /**
     * Adds a state to the NFA.
     *
     * @param {string} name the name of the state.
     * @param {boolean} [final] optional parameter to specify if the state is final.
     */
    addState(name: string, final?: boolean): void {
        super.insertState(new NFAState(name), final);
    }

    /**
     * Adds an epsilon edge from the specified state to the specified state.
     *
     * @param {string} stateName - The name of the state from which the epsilon edge originates.
     * @param {string} to - The name of the state to which the epsilon edge leads.
     * @return {boolean} - Returns true if the epsilon edge is successfully added, false otherwise.
     */
    public addEpsilonEdge(stateName:string, to:string):boolean {
        const state = this.states.get(stateName);
        if (!state) throw new IllegalArgument(`State ${stateName} does not exist!`);

        const toState = this.states.get(to);
        if (!toState) throw new IllegalArgument(`State ${to} does not exist!`);

        state.insertTransition(EPSILON, toState);
        return true;
    }

    /**
     * Remove an edge from the NFA.
     *
     * @param stateName the name of the state from which the edge shall be removed
     * @param input the symbol to specify the edge.
     * @param to the destination state as in a NFA there can be multiple edges with the
     * same input symbol and state from which they come out of.
     */
    public removeEdge(stateName:string, input:string, to:string) {
        let char = toChar(input)
        this.testSymbolAgainstAlphabet(char);

        const state = this.states.get(stateName);
        if (!state) throw new IllegalArgument(`State ${stateName} does not exist!`);

        const dest = this.states.get(to);
        if (!dest) throw new IllegalArgument(`State ${stateName} does not exist!`);

        return state.removeTransition(char, dest);
    };

    /**
     * Runs the given string against the finite state machine.
     *
     * @abstract
     * @param str The string to be evaluated.
     * @returns Returns true if the string is accepted by the finite state machine, otherwise false.
     */
    public runString(str: string): boolean {
        let activeStates = this.epsilonClosure([this._startState]);

        while (str.length > 0 && activeStates.length > 0) {
            const symbol = toChar(str[0]);
            str = str.slice(1);
            const nextStates: NFAState[] = [];
            for (const state of activeStates) {
                const transitions = state.transition(symbol);
                nextStates.push(...transitions);
            }
            activeStates = this.epsilonClosure(nextStates);
        }

        return activeStates.some(state => this._acceptStates.has(state));
    }

    /**
     * Calculates the epsilon closure of the given states in an NFA.
     *
     * @param {NFAState[]} states - The initial states for which to calculate the epsilon closure.
     * @return {NFAState[]} - An array of NFAStates representing the epsilon closure of the given states.
     */
    public epsilonClosure(states: NFAState[]): NFAState[] {
        const stack = [...states];
        const closureSet = new Set<NFAState>(stack);
        while (stack.length > 0) {
            const currentState = stack.pop()!;
            const followingStates = currentState.transition(EPSILON);
            followingStates.forEach(state => {
                if (!closureSet.has(state)) {
                    closureSet.add(state);
                    stack.push(state);
                }
            });
        }
        return Array.from(closureSet);
    }

    /**
     * Convert a NFA to a DFA.
     * Conversion is done
     * using the algorithm described by Micheal Sipser in his book "Introduction to the Theory of Computation"
     *
     * @return a DFA of the NFA using Sipper's algorithm.
     */
    public toDFA(): DFA {
        class StateBunch {
            states:NFAState[];

            constructor(states: NFAState[]) {
                this.states = states;
            }
        }

        // Helper function to give us a string 'name' for a DFA state.
        function stateName(states: NFAState[]) {
            let res = states.map(s => s.name)
                .sort((a, b) => a.localeCompare(b)).join('-');
            return res.trim() === "" ? "dead-state" : res;
        }

        // Create the start state.
        const startStateBunch = new StateBunch(this.epsilonClosure([this._startState]));
        const statesToProcess: StateBunch[] = [startStateBunch];

        let alphabet = '';
        this.alphabet.chars.forEach(c => alphabet+=c)
        let dfa:DFA|undefined = undefined;

        while (statesToProcess.length > 0) {
            const currentBunch = statesToProcess.pop()!;
            const currentStateName = stateName(currentBunch.states);

            let isFinal =
                currentBunch.states.some(nfaState => this.acceptStates.has(nfaState));

            // Add the 'current' state to the 'all states' set.
            let dfaState = new DFAState(currentStateName);

            if (dfa === undefined) {
                dfa = new DFA(alphabet, dfaState.name, isFinal)
            } else if (!dfa.getState(currentStateName))
                dfa.addState(currentStateName, isFinal)

            for (const symbol of this.alphabet.chars) {
                // The next state is the epsilon-closure of the set of all states we can reach
                // on this symbol from any active NFA state.
                let nextStates:NFAState[] = []
                for (const state of currentBunch.states) {
                    nextStates.push(...state.transition(symbol))
                }
                nextStates = this.epsilonClosure(nextStates);

                // We call it the combination of all the states
                const nextStateName = stateName(nextStates);

                // Look to see if we've already encountered this set of NFA states as a DFA state.
                let nextDFAState = dfa?.getState(nextStateName);

                // If we haven't, make it a new state in the DFA and remember to process it later.
                if (!nextDFAState) {
                    nextDFAState = new DFAState(nextStateName);
                    statesToProcess.push(new StateBunch(nextStates));
                    dfa?.addState(nextStateName, nextStates.some(nfaState => this.acceptStates.has(nfaState)))
                }

                dfa?.addEdge(currentStateName, symbol, nextStateName)
            }
        }

        return dfa!;
    }

    /**
     * Returns a string representation of the NFA.
     * @returns The string representation of the NFA.
     */
    public toString() {
        let alphabet:string = "";
        this.alphabet.chars.forEach(sym => alphabet += `${sym}, `);
        alphabet = alphabet.trim().slice(0, alphabet.length-2)

        let states:string = "";
        this.states.forEach(state => states += `${state.name}, `);
        states = states.trim().slice(0, states.length-2)

        let transitions:string = "";
        this.states.forEach(state => {
            let currState = `\n\t\tState: ${state.name}`;

            for (const [input, nextStates] of state.transitions) {
                let nextString = "";
                nextStates.forEach(nextState => nextString += `${nextState.name}, `)
                nextString = nextString.trim().slice(0, nextString.length-2)
                currState += `\n\t\t\t${input} => ${nextString}`
            }

            transitions+=currState;
        })

        return `NFA: {\n\tAlphabet: [${alphabet}]\n\tStates: [${states}]\n\tStarting State: ${this._startState.name}\n\tTransitions:${transitions}\n}`
    }

    /**
     *
     */
    isValid(): boolean {
        return true;
    }
}