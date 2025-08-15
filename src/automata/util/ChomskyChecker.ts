import { EPSILON } from "../../types";
import { CFG } from "../context-free/CFG";
import { CFGVariable } from "../../states/CFGState";

/**
 * @class Method object for checking if CFGs in Chomsky Normal Form using Sipser's method
 * @link https://refactoring.guru/replace-method-with-method-object
 */
export class ChomskyChecker {
    private readonly cfg: CFG;
    public constructor(cfg: CFG) {
        this.cfg = cfg;
    }
    /**
     * Check if CFG in Chomsky Normal Form
     * @returns True if the CFg is in Chomsky Normal Form
     */
    public isInChomskyNormalForm(): boolean {
        return [this.checkStartRule(), this.checkEpsilonRule(), this.checkProperFormRule(), this.checkUnitRule()].every(
            x => x
        );
    }

    /**
     * Check if the start variable is in any transition
     * @returns fALSE if the start variable is in any transition
     */
    private checkStartRule(): boolean {
        const start = this.cfg.startVariable.symbol;
        for (const [, variable] of this.cfg.variables) {
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
     * @returns True if there arent any unit rules
     */
    private checkUnitRule(): boolean {
        for (const [, variable] of this.cfg.variables) {
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
     * @returns True if there aren't any other epsilon transitions than in the start state
     */
    private checkEpsilonRule(): boolean {
        for (const [fromSymbol, variable] of this.cfg.variables) {
            for (const transition of variable.transitions) {
                if (
                    transition.length === 1 &&
                    transition[0].symbol === EPSILON &&
                    fromSymbol != this.cfg.startVariable.symbol
                ) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Checks if the transitions are in proper form
     * @returns True if there aren't any transitions with more than 2 symbols
     */
    private checkProperFormRule(): boolean {
        for (const [, variable] of this.cfg.variables) {
            for (const transition of variable.transitions) {
                if (transition.length > 2 && transition.length === 0) {
                    return false;
                }
                const transitionMapped = Array.from(transition).map(x => x.symbol);
                if (transition.length === 2 && transitionMapped.some(x => this.cfg.terminals.has(x))) {
                    return false;
                }
                if (transition.length === 1 && this.cfg.variables.has(transition[0].symbol)) {
                    return false;
                }
            }
        }
        return true;
    }
}
