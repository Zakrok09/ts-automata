import { CFG } from "../../../automata/context-free/CFG";
import { CFGVariable } from "../../../states/CFGState";
import { EPSILON } from "../../../types";
import { UndecidableProblem } from "../../../exceptions/exceptions";
import { ChomskyConverter } from "../ChomskyConverter";

export class CFGUtil {
    /**
     * Checks if the language of the CFG is empty. Using procedure from Sipser's proof of theorem 4.8
     * @param cfg The CFG to check
     * @returns True if the language is empty, false otherwise
     */
    public isLanguageEmpty(cfg: CFG): boolean {
        const marked: Set<string> = new Set();
        for (const [symbol] of cfg.terminals) {
            marked.add(symbol);
        }
        marked.add(EPSILON);

        let newMarkedCnt = marked.size + 1;
        while (newMarkedCnt > 0) {
            let currentCounter = 0;
            for (const [symbol, variable] of cfg.variables) {
                if (marked.has(symbol)) continue;

                const isFullyMarked = Array.from(variable.transitions).some(transition =>
                    transition.map(x => x.symbol).every(x => marked.has(x))
                );
                if (isFullyMarked) {
                    currentCounter++;
                    marked.add(symbol);
                }
            }
            newMarkedCnt = currentCounter;
        }

        return !marked.has(cfg.startVariable.symbol);
    }

    /**
     * Converts to Chomsky Normal form using procedure from Sipser
     * @param cfg The cfg
     * @returns Equivallent CFG in Chomsky Normal Form (CNF)
     */
    public toChomskyNormalForm(cfg: CFG): CFG {
        return new ChomskyConverter(cfg).toChomskyNormalForm();
    }

    /**
     * Method that (sadly) cannot check if the language is all strings
     * @param cfg The cfg
     */

    public isLanguageAllStrings(cfg: CFG): boolean {
        throw new UndecidableProblem("Universality of CFGs is an undecidable problem!");
    }

    /**
     * Implements Sipser's DP algorithm
     * @param cfg The cfg
     * @param word The word to check if it is in the language
     * @returns True if the word is in the language
     */
    public doesLanguageContainString(cfg: CFG, word: string): boolean {
        cfg = this.toChomskyNormalForm(cfg);
        if (word === EPSILON || word === "") {
            if (Array.from(cfg.startVariable.transitions).some(x => x.length === 1 && x[0].symbol === EPSILON)) {
                return true;
            }
            return false;
        }
        const n: number = word.length;
        const dp: string[][][] = [];
        for (let i = 0; i < n; i++) {
            dp.push([]);
            for (let j = 0; j < n; ++j) [dp[i].push([])];
        }

        for (let i = 0; i < n; ++i) {
            dp[i][i].push(...Array.from(this.getVariablesWithSingleTransition(cfg, word[i])));
        }
        const allTransitions = this.getTransitionsInMap(cfg);
        for (let l = 2; l <= n; l++) {
            for (let i = 0; i <= n - l; ++i) {
                const j = i + l - 1;
                for (let k = i; k <= j - 1; ++k) {
                    for (const [A, transitions] of allTransitions) {
                        for (const transition of transitions) {
                            if (!(transition.length === 2 && transition.every(x => allTransitions.has(x)))) {
                                continue;
                            }
                            const B = transition[0];
                            const C = transition[1];

                            if (dp[i][k].includes(B) && dp[k + 1][j].includes(C)) {
                                dp[i][j].push(A);
                            }
                        }
                    }
                }
            }
        }
        return dp[0][n - 1].includes(cfg.startVariable.symbol);
    }
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

    // Checks if two automata reconize the same language.
    public equal(cfg: CFG, otherCfg: CFG): boolean {
        throw new UndecidableProblem("Equality of CFGs is an undecidable problem!");
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
     * Union of two languages
     * @param cfg The first cfg
     * @param otherCfg The second
     * @returns A CFG that recognizes both languages
     */
    public union(cfg: CFG, otherCfg: CFG): CFG {
        cfg = this.prependToCFGSymbols(cfg.copy(), "1-");
        otherCfg = this.prependToCFGSymbols(otherCfg.copy(), "2-");
        otherCfg.terminals.forEach(x => cfg.addTerminal(x.symbol));
        otherCfg.variables.forEach(x => cfg.addVariable(x.symbol));
        otherCfg.variables.forEach(x =>
            x.transitions.forEach(transition =>
                transition.length === 1 && transition[0].symbol === EPSILON
                    ? cfg.addTransitionToEmptyString(x.symbol)
                    : cfg.addTransition(x.symbol, ...transition.map(to => to.symbol))
            )
        );
        cfg.addVariable("S0");
        cfg.addTransition("S0", cfg.startVariable.symbol);
        cfg.addTransition("S0", otherCfg.startVariable.symbol);
        cfg.changeStartVariable("S0");
        return cfg;
    }

    /**
     * Check if CFG in Chomsky Normal Form
     * @param cfg The cfg
     * @returns True if the CFg is in Chomsky Normal Form
     */
    public isInChomskyNormalForm(cfg: CFG): boolean {
        return [
            this.checkStartRule(cfg),
            this.checkEpsilonRule(cfg),
            this.checkProperFormRule(cfg),
            this.checkUnitRule(cfg)
        ].every(x => x);
    }

    /**
     * Check if the start variable is in any transition
     * @param cfg The CFG
     * @returns fALSE if the start variable is in any transition
     */
    private checkStartRule(cfg: CFG): boolean {
        const start = cfg.startVariable.symbol;
        for (const [, variable] of cfg.variables) {
            for (const transitions of variable.transitions) {
                if (transitions.map(x => x.symbol).includes(start)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Check the unit rule
     * @param cfg The CFG
     * @returns True if there arent any unit rules
     */
    private checkUnitRule(cfg: CFG): boolean {
        for (const [, variable] of cfg.variables) {
            for (const transition of variable.transitions) {
                if (transition.length === 1 && transition[0] instanceof CFGVariable) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Checks the epsilon rule
     * @param cfg The cfg
     * @returns True if there aren't any other epsilon transitions than in the start state
     */
    private checkEpsilonRule(cfg: CFG): boolean {
        for (const [fromSymbol, variable] of cfg.variables) {
            for (const transition of variable.transitions) {
                if (
                    transition.length === 1 &&
                    transition[0].symbol === EPSILON &&
                    fromSymbol != cfg.startVariable.symbol
                ) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Checks if the transitions are in proper form
     * @param cfg The cfg
     * @returns True if there aren't any transitions with more than 2 symbols
     */
    private checkProperFormRule(cfg: CFG): boolean {
        for (const [, variable] of cfg.variables) {
            for (const transition of variable.transitions) {
                if (transition.length > 2 && transition.length === 0) {
                    return false;
                }
                const transitionMapped = Array.from(transition).map(x => x.symbol);
                if (transition.length === 2 && transitionMapped.some(x => cfg.terminals.has(x))) {
                    return false;
                }
                if (transition.length === 1 && cfg.variables.has(transition[0].symbol)) {
                    return false;
                }
            }
        }
        return true;
    }
}
