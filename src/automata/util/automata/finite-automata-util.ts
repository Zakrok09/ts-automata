import { Automaton } from "../../../automata/Automaton";
import { State } from "../../../states/State";
import { AutomatonUtil } from "./automata-util";
export abstract class RegularAutomatonUtil<T extends Automaton<State>> extends AutomatonUtil<T> {

    constructor() {
        super()
    }
    public abstract union(automaton : T,other: T): T 
    
    public abstract intersection(automaton : T,other: T): T 
    
    public abstract negation(automaton: T) :  T
    public abstract dfs(automaton : T) : Set<State>
    protected nameSeperator(name : string) : string[] {
        let openBrackets = 0;
        let result = [];
        let current = "";
        for (let char of name){
            if (char === '{') {
                openBrackets++;
                if (openBrackets > 1) {
                    current += char;
                }
            } else if (char === '}') {
                openBrackets--;
                if (openBrackets > 0) {
                    current += char;
                } else {
                    result.push(current);
                    current = "";
                }
            }else{
                current += char;
            }
        }
        return result;
    }

}