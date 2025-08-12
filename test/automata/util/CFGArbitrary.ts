import * as fc from "fast-check";
import { CFGBuilder } from "../../../src/automata/util/builders/automata/CFGBuilder"; // Update this to your real import
import { CFG } from "../../../src/automata/context-free/CFG";
import { EPSILON } from "../../../src/types";

// Generate lowercase terminals: 'a', 'b', 'c', etc.
const terminalCharArb = fc.string().filter(x => x != EPSILON && x.length == 1);

// Generate uppercase variables: 'A', 'B', 'S', etc.
const variableCharArb = fc.string().filter(x => !x.includes(EPSILON) && x != "");

/**
 * Generates a valid CFG using CFGBuilder
 */
export const cfgArbitrary: fc.Arbitrary<CFG> = fc
    .record({
        terminals: fc.array(terminalCharArb, { minLength: 0, maxLength: 20 }),
        variables: fc.array(variableCharArb, { minLength: 1, maxLength: 20 })
    })
    .chain(({ terminals, variables }) => {
        const startVariableArb = fc.constantFrom(...variables);

        return startVariableArb.chain(startVar => {
            terminals = terminals.filter(x => !variables.includes(x));

            const builder = new CFGBuilder(terminals.join("")).withVariables(...variables).withStartVariable(startVar);

            // Transitions: [fromVar, toSymbols[]]
            const transitionsArb = fc.array(
                fc.tuple(
                    fc.constantFrom(...variables),
                    fc.array(fc.constantFrom(...[...terminals, ...variables]), { minLength: 1, maxLength: 6 })
                ),
                { minLength: 1, maxLength: 10 }
            );

            // Optional ε transitions
            const epsilonTransitionsArb = fc.subarray(variables, { maxLength: variables.length });

            return fc.tuple(transitionsArb, epsilonTransitionsArb).map(([transitions, epsilonVars]) => {
                for (const [from, to] of transitions) {
                    builder.addTransition(from, ...to);
                }
                for (const variable of epsilonVars) {
                    builder.withEpsilonTransition(variable);
                }

                return builder.getResult();
            });
        });
    });
