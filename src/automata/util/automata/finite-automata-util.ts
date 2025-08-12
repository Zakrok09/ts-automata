import { Automaton } from "../../../automata/Automaton";
import { AutomatonUtil } from "./automata-util";
import { State } from "../../../states/State";

export abstract class RegularAutomatonUtil<T extends Automaton<State>> extends AutomatonUtil<T> {
    public abstract union(automaton: T, other: T): T;

    public abstract intersection(automaton: T, other: T): T;

    public abstract negation(automaton: T): T;

    public abstract dfs(automaton: T): Set<State>;

    /**
     * Utility for parsing the names of individual states after union procedure by sipser
     * @param name The statename to parse
     * @returns The state names parsed from the original string
     */
    protected nameSeperator(name: string): string[] {
        // The name {q0}{q1}{{q2}} represents a superposition of being in
        // = q0,q1 and {q2}. we check for nested braces.
        let openBrackets = 0;
        const result = [];
        let current = "";
        for (const char of name) {
            if (char === "{") {
                openBrackets++;
                if (openBrackets > 1) {
                    current += char;
                }
            } else if (char === "}") {
                openBrackets--;
                if (openBrackets > 0) {
                    current += char;
                } else {
                    result.push(current);
                    current = "";
                }
            } else {
                current += char;
            }
        }
        return result;
    }
}
