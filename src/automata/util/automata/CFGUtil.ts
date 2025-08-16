import { CFG } from "../../../automata/context-free/CFG";
import { CFGVariable } from "../../../states/CFGState";
import { EPSILON } from "../../../types";
import { UndecidableProblem } from "../../../exceptions/exceptions";
import { ChomskyConverter } from "../ChomskyConverter";
import { ChomskyChecker } from "../ChomskyChecker";
import { CFGCommonUtil } from "./CFGCommonUtils";

export class CFGUtil extends CFGCommonUtil {
    public constructor() {
        super();
    }
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

    // Checks if two automata reconize the same language.
    public equal(cfg: CFG, otherCfg: CFG): boolean {
        throw new UndecidableProblem("Equality of CFGs is an undecidable problem!");
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
     * @returns True if the CFg is in Chomsky Normal Form
     */
    public isInChomskyNormalForm(cfg: CFG): boolean {
        return new ChomskyChecker(cfg).isInChomskyNormalForm();
    }
}
