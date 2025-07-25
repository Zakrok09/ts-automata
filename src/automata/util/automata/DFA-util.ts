import { DFAState } from "~/states/RegularStates";
import { AutomatonUtil } from "./automata-util";
import {DFA} from "../../regular/DFA";
import {NFA} from "../../regular/NFA";
import { NFAUtil } from "./NFA-util";
import { RegularAutomatonUtil } from "./finite-automata-util";

export class DFAUtil extends RegularAutomatonUtil<DFA> {

    constructor() {
        super()
    }
    /**
     * Performs a depth-first search to find all states reachable from the start state.
     * @returns Returns a set of all states reachable from the start state.
     */
    public dfs(automaton : DFA) : Set<DFAState> {
        let stack: string[] = [];
        stack.push(automaton._startState.name);
        let visited : Set<DFAState> = new Set<DFAState>();
        // Perform a depth-first search to check if there is any accepting state reachable from the start state.
        // If we find an accepting state, the language is not empty.
        while (stack.length > 0) {
            let state = automaton.getState(stack.pop()!)!;
            if (visited.has(state)) continue;
            visited.add(state);
            for (let neighbour of state.transitions.values()) {
                stack.push(neighbour.name);
            }

        }
        return visited;
    }
    /**
     * Checks if the language of the DFA is empty.
     * A DFA's language is empty if there are no accepting states reachable from the start state
     * @returns Returns true if the language of the DFA is empty, otherwise false.
     */
    public isLanguageEmpty(automaton : DFA): boolean {
        let visited = this.dfs(automaton);
        return Array.from(visited).every(state => !state.accepting);
    }
    /**
     * Checks if the language of the DFA contains all strings(sigma star).
     * A DFA's language contains all strings if all states reachable from the start are accepting state.
     * @returns Returns true if the language of the DFA contains all strings, otherwise false.
     */
    public isLanguageAllStrings(automaton : DFA): boolean {
        let visited = this.dfs(automaton);
        return Array.from(visited).every(state => state.accepting);
    }
    /**
     * Checks if the language of the DFA contains a specific string.
     * @param word the string to be checked
     * @returns Returns true if the language of the DFA contains the string, otherwise false.
     */
    public doesLanguageContainString(automaton : DFA, word : string ): boolean {
        return automaton.runString(word);
    }
    /**
     * Checks if the language of the DFA is equal to the language of another DFA.
     * @param other the other DFA to compare with
     * @returns Returns true if the languages are equal, otherwise false.
     */
    public equal(automaton : DFA, other: DFA): boolean {
        let symmetricDifference = this.negation(this.intersection(automaton,other))
        let unionOfBoth = this.union(automaton,other)
        return this.isLanguageEmpty(this.intersection(symmetricDifference,unionOfBoth));
    }
    /**
     * Return a DFA that accepts the complement of the language of the given DFA
     * @param automaton the dfa to be negated
     * @returns the negated DFA
     */
    public negation(automaton: DFA): DFA {
        let newDFA = automaton.copy()
        this.dfs(newDFA).forEach(state => newDFA.setAccepting(state.name,!state.accepting))
        return newDFA;
    }
    /**
     * Unions the DFA with another DFA.
     * @param other the other DFA to union with
     * @returns the resulting DFA after the union
     */
    public union(automaton : DFA, other: DFA, nfaUtil = new NFAUtil()): DFA {
        let thisDFAasNFA = this.toNFA(automaton);
        let otherDFAasNFA = this.toNFA(other);
        let newNFA = nfaUtil.union(thisDFAasNFA,otherDFAasNFA);
        return newNFA.toDFA();
    }
    /**
     * Return a DFA that accepts the intersection of the two languages
     * @param automaton DFA that recognizes a language R1
     * @param other DFA that recognizes a language R2
     * @returns DFA that recognizes words both in R1 and R2
     */
    public intersection(automaton : DFA, other: DFA): DFA {

        // Use procedure from Sipser. 
        let newDFA = this.union(automaton,other);
        let states = this.dfs(newDFA);
        let resultDFA = new DFA(newDFA.alphabet.joinToString(), newDFA._startState.name, newDFA._startState.accepting);
        // Mark each state in the union DFA to be accepting if it represents a super position of states
        // Such that it both represents being in an accepting state in the first dfa AND the second. 
        states.forEach(state => {
                // Extract the names from the unioned DFA. Example {1-statex}{2-statey}{1-{statez}}
                let namesInThisDFA = super.nameSeperator(state.name).filter(name=> name.startsWith("1-")).map(name => name.slice(2));
                // Get names of the states in the second DFA. Example from the upper comment: statey
                let namesInOtherDFA = super.nameSeperator(state.name).filter(name=> name.startsWith("2-")).map(name => name.slice(2));
                let isAnyAcceptingInThisDFA = namesInThisDFA.some(name => automaton.getState(name)!.accepting);
                let isAnyAcceptingInOtherDFA = namesInOtherDFA.some(name => other.getState(name)!.accepting);
                let result = (isAnyAcceptingInOtherDFA && isAnyAcceptingInThisDFA)
                if(state.name!=resultDFA._startState.name){
                // Get names of the states in the first DFA. Example from the upper comment: statex, {statez}
                    resultDFA.addState(state.name);
                }
                resultDFA.setAccepting(state.name,result)
            
        })
        states.forEach(state => {newDFA.getState(state.name)!.transitions.forEach((nextState, symbol) => {newDFA.addEdge(state.name, symbol, nextState.name)})});
        return resultDFA;
    }
    
    /**
     * Converts the DFA to an NFA.
     */
    public toNFA(automaton : DFA ): NFA {
        let thisDFA = automaton;
        let newNfa = new NFA(thisDFA.alphabet.joinToString(),thisDFA._startState.name,thisDFA.startState.accepting);
        
        let statesThisDFA = this.dfs(thisDFA);
        
        statesThisDFA.forEach(state => {
            if(!newNfa.getState(state.name)){
                newNfa.addState(state.name, state.accepting);
            }
            
            
        });
        statesThisDFA.forEach(state =>{
            thisDFA.getState(state.name)!.transitions.forEach((nextState, symbol) => {
                newNfa.addEdge(state.name, symbol, nextState.name);
            });
        })
        //{{1-{{{end}{reachable}{start}}}}{2-{end}{reachable}{start}}{union[{{{end}{reachable}{start}}}:{end}{reachable}{start}]}}
        //{{1-{{{end}{reachable}{start}}}}{2-{end}{reachable}{start}}}
        //{{1-{{{end}{reachable}{start}}}}{2-{end}{reachable}{start}}{union[{{{end}{reachable}{start}}}:{end}{reachable}{start}]}}
        return newNfa;
    }
    

}