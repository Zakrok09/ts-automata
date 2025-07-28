import { NFAState } from "~/states/RegularStates";
import { DFAState } from "~/states/RegularStates";
import { AutomatonUtil } from "./automata-util";
import {NFA} from "../../regular/NFA";
import { DFA } from "~/automata/regular/DFA";
import { NFAConverter } from "../NFAConverter";
import { Alphabet } from "../../Alphabet";
import {DFAUtil} from "./DFA-util";
import { off } from "process";
import { RegularAutomatonUtil } from "./finite-automata-util";
import { EPSILON } from "../../../types";
export class NFAUtil extends RegularAutomatonUtil<NFA> {

    constructor() {
        super();
    }
    /**
     * Performs a depth-first search to find all states reachable from the start state.
     * @returns Returns a set of all states reachable from the start state.
     */
    public dfs(automaton :NFA) : Set<NFAState> {
        let stack: NFAState[] = [];
        stack.push(automaton._startState);
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
    public isLanguageEmpty(automaton : NFA ): boolean {
        let visited = this.dfs(automaton);
        return !Array.from(visited).some(state => state.accepting);
    }

    /**
     * Checks if the language of the DFA contains all strings(sigma star).
     * A DFA's language contains all strings if all states reachable from the start are accepting state.
     * @returns Returns true if the language of the DFA contains all strings, otherwise false.
     */
    public isLanguageAllStrings(automaton: NFA, dfaUtil = new DFAUtil()): boolean {
        let transformedToDFA = new NFAConverter(automaton).toDFA();
        return dfaUtil.isLanguageAllStrings(transformedToDFA);
    }
    /**
     * Checks if the language of the DFA contains a specific string.
     * @param word the string to be checked
     * @returns Returns true if the language of the DFA contains the string, otherwise false.
     */
    public doesLanguageContainString(automaton : NFA, word : string ): boolean {
        return automaton.runString(word);
    }


    public negation(automaton: NFA, util = new DFAUtil()): NFA {
        let negated = util.negation(automaton.toDFA())
        return util.toNFA(negated);
    }
    /**
     * Checks if the language of the DFA is equal to the language of another DFA.
     * @param other the other DFA to compare with
     * @returns Returns true if the languages are equal, otherwise false.
     */
    public equal(automaton : NFA , other: NFA): boolean {
        // first Automaton recgonize a language A and the second a language B
        // if Symmetric difference of A and B is empty, they are equal
        let commonAlphabet = automaton.alphabet.joinToString()+other.alphabet.joinToString();
        let automatonExtendedAlphabet = this.extendAlphabet(automaton,commonAlphabet)
        let otherExtendedAlphabet = this.extendAlphabet(other,commonAlphabet)

        let AminB = this.intersection(automatonExtendedAlphabet,this.negation(otherExtendedAlphabet));
        let BminA = this.intersection(this.negation(automatonExtendedAlphabet),otherExtendedAlphabet);
        let intersection = this.union(AminB,BminA);
        return this.isLanguageEmpty(intersection);
    }
    public extendAlphabet(automaton : NFA, newAlphabet : string){
        let resAutomaton = new NFA(newAlphabet,automaton.startState.name,automaton._startState.accepting)
        let states = this.dfs(automaton)
        states.forEach(state => {
                if(!resAutomaton.getState(state.name)){
                    resAutomaton.addState(state.name,state.accepting)
                }
        })
        states.forEach(state=> {
            automaton.getState(state.name)!.transitions.
                        forEach((possible_to,key) =>possible_to
                            .forEach(to =>
                                {if (key == EPSILON){
                                    resAutomaton.addEpsilonEdge(state.name,to.name)
                                }else{
                                    resAutomaton.addEdge(state.name,key,to.name)}}))
        })
        return resAutomaton
    }
    public union(automaton : NFA, other: NFA): NFA {
        let thisNFA = automaton
        let combinedAlphabet = (thisNFA.alphabet.joinToString()+other.alphabet.joinToString());
        let newStartStateName = "U";
        let newNFA = new NFA(combinedAlphabet, newStartStateName,false);

        let statesOfThisNFA = this.dfs(automaton);
        
        for(let state of statesOfThisNFA) {
            newNFA.addState("1-" + state.name,state.accepting);
        }
        let statesOfOtherNFA = this.dfs(other);
        for(let state of statesOfOtherNFA) {
            newNFA.addState("2-" + state.name,state.accepting);
        }
        
        // Procedure from Sipser
        newNFA.addEpsilonEdge(newStartStateName, "1-" + thisNFA.startState.name);
        newNFA.addEpsilonEdge(newStartStateName, "2-" + other.startState.name);


        for( let state of statesOfThisNFA){
            let transitions = thisNFA.getState(state.name)!.transitions;
            for (let [symbol,nextStates] of transitions){
                for (let nextState of nextStates) {
                    if(symbol==EPSILON){
                        newNFA.addEpsilonEdge("1-"+state.name,  "1-"+nextState.name);
                    }else{
                        newNFA.addEdge("1-"+state.name, symbol, "1-"+nextState.name);
                    }
                }
            }

        }


        for( let state of statesOfOtherNFA){
            let transitions = state.transitions;
            for (let [symbol,nextStates] of transitions){
                for (let nextState of nextStates) {
                    if(symbol==EPSILON){
                        newNFA.addEpsilonEdge("2-"+state.name,  "2-"+nextState.name);
                    }else{
                        newNFA.addEdge("2-"+state.name, symbol, "2-"+nextState.name);
                    }
                }
            }
        }
        return newNFA;
    }

    public intersection(automaton : NFA , other: NFA, util = new DFAUtil()): NFA {
        let newDFA = util.intersection(automaton.toDFA(),other.toDFA());
        let newDFAasNFA = util.toNFA(newDFA)
        return  newDFAasNFA;
    }

    

}