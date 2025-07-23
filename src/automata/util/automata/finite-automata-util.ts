import { Automaton } from "../../../automata/Automaton";
import { State } from "../../../states/State";
import { AutomatonUtil } from "./automata-util";
export abstract class RegularAutomatonUtil<T extends Automaton<State>> extends AutomatonUtil<T> {

    constructor() {
        super()
    }
    public union(automaton : T,other: T): T {
        throw new Error("Method 'union' not implemented.");
    }
    public intersection(automaton : T,other: T): T {
        throw new Error("Method 'intersection' not implemented.");
    }
    public negation(automaton: T){
        throw new Error("Method 'negation' not implement.")
    }
    
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