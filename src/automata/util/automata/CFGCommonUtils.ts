import { EPSILON } from "../../../types";
import { CFG } from "../../../automata/context-free/CFG";
import { CFGVariable } from "../../../states/CFGState";

export class CFGCommonUtil {
    /**
     * Get variables with a single transition to the symbol
     * @param cfg The CFG
     * @param symbol the symbol a
     * @returns all variables X with the transition X -> a
     */
    protected getVariablesWithSingleTransition(cfg: CFG, symbol: string): Set<string> {
        const res: Set<string> = new Set();
        const { variables } = cfg;
        for (const [sym, variable] of variables) {
            for (const transition of variable.transitions) {
                if (transition.length === 1 && transition[0].symbol === symbol) {
                    res.add(sym);
                    break;
                }
            }
        }
        return res;
    }
    /**
     * Prepend a string to all non-terminals
     * @param cfg The cfg
     * @param prepend the string to prepend: x -> prepend+x
     * @returns The new CFG
     */
    public prependToCFGSymbols(cfg: CFG, prepend: string): CFG {
        const copyOfCFG = new CFG(prepend + cfg.startVariable.symbol);
        cfg.terminals.forEach(terminal => copyOfCFG.addTerminal(terminal.symbol));
        cfg.variables.forEach(variable => copyOfCFG.addVariable(prepend + variable.symbol));
        cfg.variables.forEach(variable =>
            variable.transitions.forEach(transition => {
                if (transition.length === 1 && transition[0].symbol === EPSILON) {
                    copyOfCFG.addTransitionToEmptyString(prepend + variable.symbol);
                } else {
                    copyOfCFG.addTransition(
                        prepend + variable.symbol,
                        ...transition.map(x => (x instanceof CFGVariable ? prepend + x.symbol : x.symbol))
                    );
                }
            })
        );
        return copyOfCFG;
    }
    /**
     * Method to remove redundant transitions
     * @param arrays The list of transitions
     * @returns Simplified list of transitions that are distinct
     */
    protected uniqueify(arrays: string[][]): string[][] {
        const seen = new Set<string>();
        const result: string[][] = [];

        for (const array of arrays) {
            const key = JSON.stringify(array);
            if (!seen.has(key)) {
                seen.add(key);
                result.push(array);
            }
        }

        return result;
    }
    /**
     * Get the CFG transitions in map format
     * @param cfg The cfg
     * @returns The transitions in a map
     */
    protected getTransitionsInMap(cfg: CFG): Map<string, string[][]> {
        const transitions: Map<string, string[][]> = new Map();
        for (const [symbol, variable] of cfg.variables) {
            transitions.set(symbol, []);
            for (const transition of variable.transitions) {
                const mappedTransition = transition.map(x => x.symbol);
                const toBePushed = transitions.get(symbol)!;
                toBePushed.push(mappedTransition);
            }
            transitions.set(symbol, this.uniqueify(transitions.get(symbol)!));
        }
        return transitions;
    }
}
