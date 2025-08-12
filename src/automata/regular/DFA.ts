import {char, toChar} from "../../types";
import {DFAState} from "../../states/RegularStates";
import {IllegalArgument, IllegalAutomatonState} from "../../exceptions/exceptions";
import {Alphabet} from "../Alphabet";
import {FiniteAutomaton} from "./FiniteAutomaton";
import { NFA } from "./NFA";
import { DFAUtil } from "../util/automata/DFA-util";

/**
 * Deterministic finite automaton.
 *
 * @extends FiniteAutomaton with DFAState.
 * @classdesc a DFA is a 5-tuple of its states, alphabet, transition function, starting state
 * and a set of accepting states.
 * It has equivalent power to NFAs and GNFAs.
 * Decides Regular languages.
 * @link https://en.wikipedia.org/wiki/Deterministic_finite_automaton
 * @since 0.0.1
 */
export class DFA extends FiniteAutomaton<DFAState> {

    /**
     * Creates a DFA (Deterministic Finite Automaton) object.
     * Isolates the logic of the alphabet creation as the alphabet object must not be accessible outside the automaton.
     *
     * @param {string} alphabetString - The string representation of the alphabet for the DFA.
     * @param {string} startState - The starting state of the DFA.
     * @param {boolean} startingAccept - Indicates whether the starting state is an accepting state.
     */
    public constructor(alphabetString:string, startState: string, startingAccept: boolean) {
        const start:DFAState = new DFAState(startState);
        super(Alphabet.fromString(alphabetString), start);

        if (startingAccept) {
            this.startState.accepting = true;
            start.accepting = true
            this.acceptStates.add(start);
        }
    }

    /**
     * Checks if the DFA transition diagram is valid.
     *
     * @returns True if the transition diagram is valid, otherwise false.
     */
    public isValid():boolean {
        for (const state of this.states.values()) {
            if (state.getInputAlphabet().size !== this.alphabet.size) {
                return false;
            }
        }
        return true;
    }

    /**
     * Add a state to the DFA
     *
     * @param name The name of the state
     * @param final Whether the state is final or not.
     * Defaults to false.
     */
    addState(name: string, final?: boolean): void {
        super.insertState(new DFAState(name), final);
    }

    /**
     * Removes an edge from a DFA state.
     *
     * @param {string} stateName - The name of the state.
     * @param {char} input - The input character of the edge to be removed.
     *
     * @returns {boolean} - True if the edge is successfully removed, false otherwise.
     *
     * @throws {IllegalArgument} if the input character is not part of the alphabet of this DFA.
     * @throws {IllegalArgument} if the state does not exist.
     */
    public removeEdge(stateName:string, input:string):boolean {
        const inputChar = toChar(input)
        this.testSymbolAgainstAlphabet(inputChar);

        const state = this.states.get(stateName);
        if (!state) throw new IllegalArgument(`State ${stateName} does not exist!`);

        return state.removeTransition(inputChar);
    }

    /**
     * Give an equivallent NFA
     * @param util DFA util
     * @returns an equivallent NFA as this DFA
     */
    public toNFA(util = new DFAUtil()){
        const newNfa = new NFA(this.alphabet.joinToString(),this.startState.name,this.startState.accepting),
            statesThisDFA = util.dfs(this);
        
        statesThisDFA.forEach(state => {
            if(!newNfa.getState(state.name)){
                newNfa.addState(state.name, state.accepting);
            }
        });

        statesThisDFA.forEach(state =>{
            this.getState(state.name)!.transitions.forEach((nextState, symbol) => {
                newNfa.addEdge(state.name, symbol, nextState.name);
            });
        })
        
        return newNfa;
    }
    

    /**
     * Runs the given string against the finite state machine.
     *
     * @param str The string to be evaluated.
     * @returns Returns true if the string is accepted by the finite state machine, otherwise false.
     * @throws IllegalAutomatonState if the DFA is in an invalid state, running any string on it will
     * result in a runtime error being thrown.
     */
    public runString(str:string): boolean {
        if (!this.isValid()) throw new IllegalAutomatonState('The DFA is not valid. Cannot run string.');

        let currentState:DFAState = this.startState;

        for (const inputChar of str) {
            const c: char = toChar(inputChar);
            currentState = currentState.transition(c);
            if (!currentState) return false;
        }

        return currentState.accepting;
    }

    /**
     * Returns a string representation of the DFA.
     * @returns The string representation of the DFA.
     */
    public toString() {
        let transitions:string = "";
        this.states.forEach(state => {
            let currState = `\n\t\tState: ${state.name}`;

            for (const [input, nextState] of state.transitions) {
                currState += `\n\t\t\t${input} => ${nextState.name}`
            }

            transitions+=currState;
        })

        return super.toString(transitions);
    }
    /**
     * Create a copy of the DFA
     * @returns Deep copy of the current DFA
     */
    public copy(){
        const newDFA = new DFA(this.alphabet.joinToString(),this.startState.name,this.startState.accepting)
        this.states.forEach(state => {if(!newDFA.getState(state.name)) {newDFA.addState(state.name,state.accepting)}})
        this.states.forEach(state => state.transitions!.forEach((to,sym) =>   newDFA.addEdge(state.name,sym,to.name)))
        return newDFA;
    }

    /**
     * Returns the machine type of the DFA. The result is always DFA.
     */
     
    get machineType(): string {
        return "DFA";
    }
    
}