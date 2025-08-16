import { CFGVariable } from "../../states/CFGState";
import { CFG } from "../context-free/CFG";
import { EPSILON } from "../../types";
import { CFGCommonUtil } from "./automata/CFGCommonUtils";

/**
 * @class Method object for converting CFGs to Chomsky Normal Form using Sipser's method
 * @link https://refactoring.guru/replace-method-with-method-object
 */
export class ChomskyConverter extends CFGCommonUtil {
    private delimeter = "..";

    private readonly cfg: CFG;
    public constructor(cfg: CFG) {
        super();
        this.cfg = cfg;
    }
    /**
     * Ensures no transitions of more than 2 terminals+variables is remaining
     * From Sipser's method. X-> XYZ => X-> XU1, U1 -> YZ
     * @param cfg The CFG
     * @returns The same CFG in proper form
     */
    private allRulesProperForm(cfg: CFG): CFG {
        // Maintain a counter of variables to not run into name collisions
        let counter = 0;
        const allTransitions = this.getTransitionsInMap(cfg);
        const newTransitions: Map<string, string[][]> = new Map();
        // Change the transitions
        for (const [from, toTransitions] of allTransitions) {
            newTransitions.set(from, []);
            for (const to of toTransitions) {
                if (to.length > 2) {
                    const size = to.length;
                    // Do the non-terminal chaining
                    allTransitions.set(`(U${counter++})`, [[to[size - 2], to[size - 1]]]);
                    for (let i = size - 3; i >= 1; --i) {
                        allTransitions.set(`(U${counter++})`, [[to[i], `(U${counter - 2})`]]);
                    }
                    allTransitions.get(from)!.push([to[0], `(U${counter - 1})`]);
                } else {
                    newTransitions.get(from)!.push(to);
                }
            }
        }

        // ADd the new terminals generated
        for (const name of newTransitions.keys()) {
            if (!cfg.getVariable(name)) {
                cfg.addVariable(name);
            }
        }
        return this.refreshTheEdges(cfg, newTransitions);
    }

    /**
     * Converts to Chomsky Normal form using procedure from Sipser
     * @param cfg The cfg
     * @returns Equivallent CFG in Chomsky Normal Form (CNF)
     */
    public toChomskyNormalForm(): CFG {
        let newCFG = this.prependToCFGSymbols(this.cfg, "-");
        // Add new Start State
        newCFG.addVariable("S0");
        newCFG.addTransition("S0", newCFG.startVariable.symbol);
        newCFG.changeStartVariable("S0");
        newCFG = this.terminalToVariableConverter(newCFG);
        newCFG = this.removeEpsilonTransitions(newCFG);
        newCFG = this.removeAllUnitRules(newCFG);
        newCFG = this.allRulesProperForm(newCFG);
        return newCFG;
    }

    /**
     * Remove prefix from string
     * @param name The original string
     * @param delimeter The delimiter that it _may_ start with
     * @returns The string with the delimiter possible removed, returns original string if not
     */
    private removeDelimiter(name: string, delimeter: string): string {
        if (name.startsWith(delimeter)) {
            return name.slice(delimeter.length);
        }
        return name;
    }

    /**
     * Helper to remove all transitions from the CFG
     * @param cfg the CFG
     */
    private removeAllTransitions(cfg: CFG): void {
        for (const [sym, variable] of cfg.variables) {
            for (const transition of variable.transitions) {
                cfg.removeTransition(
                    this.removeDelimiter(sym, this.delimeter),
                    ...transition.map(x => this.removeDelimiter(x.symbol, this.delimeter))
                );
            }
        }
    }

    /**
     * Remove all unit rules of the form A->B
     * @param cfg The cfg
     * @returns THe equivallent CFG with all unit rules removed
     */
    private removeAllUnitRules(cfg: CFG): CFG {
        let allTransitions = this.getTransitionsInMap(cfg);
        // Flag to see if any new changes were done in the CFG
        let flag = true;
        const removed: Set<string> = new Set();
        while (flag) {
            const temp: Map<string, string[][]> = new Map();
            flag = false;
            for (const [from, toTransitions] of allTransitions) {
                temp.set(from, []);
                for (const to of toTransitions) {
                    // Remove self edges X -> X
                    if (to.length === 1 && to[0] === from) {
                        flag = true;
                        continue;
                    }
                    // If in the form of X-> Y
                    if (to.length === 1 && cfg.variables.has(to[0])) {
                        if (removed.has(JSON.stringify([from, to]))) {
                            continue;
                        }
                        removed.add(JSON.stringify([from, to]));
                        // ... add all of the edges of Y to X
                        temp.get(from)!.push(...allTransitions.get(to[0])!);
                        flag = true;
                    } else {
                        temp.get(from)!.push(to);
                    }
                }
            }
            allTransitions = temp;
            // Simplify the CFG for performance
            for (const [key, to] of allTransitions) {
                allTransitions.set(key, this.uniqueify(to));
            }
        }
        return this.refreshTheEdges(cfg, allTransitions);
    }
    /**
     * Method to remove the old edges and put the new ones
     * @param cfg The old CFG
     * @param allTransitions The new transitions
     * @returns Refreshed CFG
     */
    private refreshTheEdges(cfg: CFG, allTransitions: Map<string, string[][]>): CFG {
        this.removeAllTransitions(cfg);
        for (const [key, to] of allTransitions) {
            allTransitions.set(key, this.uniqueify(to));
        }
        // Add the new transitions
        for (const [sym, toTransitions] of allTransitions) {
            for (const transition of toTransitions) {
                if (transition.length === 1 && transition[0] === EPSILON && sym != cfg.startVariable.symbol) {
                    continue;
                }
                if (transition.length === 1 && transition[0] === EPSILON && sym === cfg.startVariable.symbol) {
                    cfg.addTransitionToEmptyString(cfg.startVariable.symbol);
                    continue;
                }
                // Remove the delimiter from all states
                cfg.addTransition(sym, ...transition.map(x => this.removeDelimiter(x, this.delimeter)));
            }
        }
        return cfg;
    }

    private terminalToVariableConverter(cfg: CFG): CFG {
        let counter = 0;
        const transitions = this.getTransitionsInMap(cfg);
        const terminalToVariable: Map<string, string> = new Map();
        for (const [sym] of cfg.terminals) {
            const nonTerminalName = `T${counter++}`;
            terminalToVariable.set(sym, nonTerminalName);
            transitions.set(nonTerminalName, [[sym]]);
        }
        for (const [from, toTransitions] of transitions) {
            if (from.startsWith("T")) {
                continue;
            }
            for (const to of toTransitions) {
                for (let i = 0; i < to.length; ++i) {
                    if (cfg.terminals.has(to[i])) {
                        to[i] = terminalToVariable.get(to[i])!;
                    }
                }
            }
        }
        // ADd the new terminals generated
        for (const name of transitions.keys()) {
            if (!cfg.getVariable(name)) {
                cfg.addVariable(name);
            }
        }
        this.removeAllTransitions(cfg);
        for (const [key, to] of transitions) {
            transitions.set(key, this.uniqueify(to));
        }
        // Add the new transitions
        for (const [sym, toTransitions] of transitions) {
            for (const transition of toTransitions) {
                if (transition.length === 1 && transition[0] === EPSILON) {
                    cfg.addTransitionToEmptyString(sym);
                    continue;
                }
                // Remove the delimiter from all states
                cfg.addTransition(sym, ...transition.map(x => this.removeDelimiter(x, this.delimeter)));
            }
        }
        return cfg;
    }

    /**
     * Remove a single epsilon edge by method described by Sipser
     * @param edge The transition eg: X -> XbX
     * @param epsilonVariables The set of variables in the CFG with an epsilon transition
     * @returns new transitions as decsribed by Sipser
     */
    private removeEpsilonEdge(edge: string[], epsilonVariables: Set<string>): string[][] {
        const res: string[][] = [];
        for (let i = 0; i < edge.length; ++i) {
            if (epsilonVariables.has(edge[i])) {
                const arrayToPush = [...edge];
                arrayToPush.splice(i, 1);
                if (arrayToPush.length === 0) {
                    arrayToPush.push(EPSILON);
                }
                res.push(arrayToPush);
            }
        }

        return res;
    }

    /**
     * Remove all transitions in the form of X -> EPSILON
     * @param cfg The old CFG
     * @returns Equivallent CFG such that only the start non-terminal has an epsilon transition
     */
    private removeEpsilonTransitions(cfg: CFG): CFG {
        let transitions = this.getTransitionsInMap(cfg);
        const variablesWithEpsilon = this.getVariablesWithSingleTransition(cfg, EPSILON);
        let flag: boolean = true;
        while (flag) {
            flag = false;
            const temp: Map<string, string[][]> = new Map();
            for (const [from, toTransitions] of transitions) {
                for (const to of toTransitions) {
                    if (!temp.get(from)) {
                        temp.set(from, []);
                    }
                    // If it can transition to an epsilon non-terminal
                    if (to.some(x => variablesWithEpsilon.has(x))) {
                        flag = true;
                        const removedTransitions = this.removeEpsilonEdge(to, variablesWithEpsilon);
                        // Delimit the edge that has all variables in it such that it doesn't cause an infinite loop
                        temp.get(from)!.push(to.map(x => this.delimeter + x));
                        temp.get(from)!.push(...removedTransitions);
                    } else {
                        temp.get(from)!.push(to);
                    }
                }
            }
            transitions = temp;
            // Some variables may have a new epsilon transition, keep track of it
            for (const [from, toTransitions] of transitions) {
                if (toTransitions.filter(x => x.length === 1 && x[0] === EPSILON).length >= 1) {
                    variablesWithEpsilon.add(from);
                }
            }
        }

        return this.refreshTheEdges(cfg, transitions);
    }
}
