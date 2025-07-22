import { NFAState } from "~/states/RegularStates";
import { DFAState } from "~/states/RegularStates";
import { AutomatonUtil } from "./automata-util";
import {NFA} from "../../regular/NFA";
import { DFA } from "~/automata/regular/DFA";
import { NFAConverter } from "../NFAConverter";
import { Alphabet } from "../../Alphabet";
import {DFAUtil} from "./DFA-util";
import { off } from "process";
export class NFAUtil extends AutomatonUtil<NFAState> {

    constructor(automaton: NFA) {
        super(automaton);
    }
    /**
     * Performs a depth-first search to find all states reachable from the start state.
     * @returns Returns a set of all states reachable from the start state.
     */
    private dfs() : Set<NFAState> {
        let stack: NFAState[] = [];
        stack.push(this._automaton._startState);
        let visited : Set<NFAState> = new Set<NFAState>();
        // Perform a depth-first search to check if there is any accepting state reachable from the start state.
        // If we find an accepting state, the language is not empty.
        while (stack.length > 0) {
            let state = stack.pop()!;
            if (visited.has(state)) continue;
            visited.add(state);
            for (let neighbours of state.transitions.values()) {
                stack.push(...neighbours);
            }
        }
        return visited;
    }
    /**
     * Checks if the language of the DFA is empty.
     * A DFA's language is empty if there are no accepting states reachable from the start state
     * @returns Returns true if the language of the DFA is empty, otherwise false.
     */
    public isLanguageEmpty(): boolean {
        let visited = this.dfs();
        return Array.from(visited).some(state => state.accepting);
    }
    /**
     * Checks if the language of the DFA contains all strings(sigma star).
     * A DFA's language contains all strings if all states reachable from the start are accepting state.
     * @returns Returns true if the language of the DFA contains all strings, otherwise false.
     */
    public isLanguageAllStrings(): boolean {
        let transformedToDFA = new NFAConverter(this._automaton as NFA).toDFA();
        return new DFAUtil(transformedToDFA).isLanguageAllStrings();
    }
    /**
     * Checks if the language of the DFA contains a specific string.
     * @param word the string to be checked
     * @returns Returns true if the language of the DFA contains the string, otherwise false.
     */
    public doesLanguageContainString(word : string ): boolean {
        return this._automaton.runString(word);
    }
    /**
     * Checks if the language of the DFA is equal to the language of another DFA.
     * @param other the other DFA to compare with
     * @returns Returns true if the languages are equal, otherwise false.
     */
    public equal(other: NFA): boolean {
        return false;
    }
    public union(other: NFA): NFA {
        let thisNFA = this._automaton as NFA
        let combinedAlphabet = (thisNFA.alphabet.joinToString()+other.alphabet.joinToString());
        let newStartStateName = "union["+thisNFA.startState.name+":"+other.startState.name+"]";
        let newNFA = new NFA(combinedAlphabet, newStartStateName,false);

        let statesOfThisNFA = this.dfs();
        
        for(let state of statesOfThisNFA) {
            newNFA.addState("1-" + state.name);
        }
        let statesOfOtherNFA = new NFAUtil(other).dfs();
        for(let state of statesOfOtherNFA) {
            newNFA.addState("2-" + state.name);
        }
        // Procedure from Sipser
        newNFA.addEpsilonEdge(newStartStateName, "1-" + thisNFA.startState.name);
        newNFA.addEpsilonEdge(newStartStateName, "2-" + other.startState.name);


        for( let state of statesOfThisNFA){
            let transitions = state.transitions.entries();
            for (let [symbol, nextStates] of transitions){
                for (let nextState of nextStates) {
                    newNFA.addEdge("1-"+state.name, symbol, "1-"+nextState.name);
                }
            }
        }

        for( let state of statesOfOtherNFA){
            let transitions = state.transitions.entries();
            for (let [symbol, nextStates] of transitions){
                for (let nextState of nextStates) {
                    newNFA.addEdge("2-"+state.name, symbol, "2-"+nextState.name);
                }
            }
        }
        return newNFA;
    }

    

}