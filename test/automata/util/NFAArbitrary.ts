import * as fc from "fast-check";
import { NFABuilder } from "../../../src/automata/util/builders/automata/NFABuilder"; // Update this to your real import
import { NFA } from "../../../src/automata/regular/NFA";
import { EPSILON } from "../../../src/types";

// Generate lowercase terminals: 'a', 'b', 'c', etc.
const alphabetCharArb = fc.string().filter(x => !x.includes(EPSILON) && x.length > 0);
const namesOfStates = fc.uniqueArray(
    fc.string({ minLength: 1, maxLength: 100 }), // Control complexity
    { minLength: 1, maxLength: 20 } // Control list size
); // Generate uppercase variables: 'A', 'B', 'S', etc.

/**
 * Generates a valid CFG using CFGBuilder
 */
export const NFAArbitrary: fc.Arbitrary<NFA> = fc
    .record({
        alphabet: alphabetCharArb,
        states: namesOfStates
    })
    .chain(({ alphabet, states }) => {
        const acceptStates = fc.subarray(states.slice(0), { minLength: 0, maxLength: states.length });
        return fc.record({ acceptStates }).chain(({ acceptStates }) => {
            const startState = states[0];
            const builder = new NFABuilder(alphabet)
                .withNotFinalStates(startState)
                .withFinalStates(...acceptStates)
                .withNotFinalStates(...states.slice(1));

            // Transitions: [fromVar, toSymbols[]]
            const transitionsArb = fc.array(
                fc.tuple(
                    fc.constantFrom(...states),
                    fc.tuple(
                        fc.constantFrom(...Array.from(alphabet)),
                        fc.subarray(states, { minLength: 0, maxLength: states.length })
                    )
                ),
                { minLength: 1, maxLength: 10 }
            );

            // Optional ε transitions
            const epsilonTransitionsArb = fc.array(
                fc.tuple(fc.constantFrom(...states), fc.subarray(states, { maxLength: states.length })),
                { minLength: 0, maxLength: 10 }
            );

            return fc.tuple(transitionsArb, epsilonTransitionsArb).map(([transitions, epsilonVars]) => {
                for (const [from, [symbol, to]] of transitions) {
                    for (const stateTo of to) {
                        builder.addEdge(from, symbol, stateTo);
                    }
                }
                for (const [from, to] of epsilonVars) {
                    for (const stateTo of to) {
                        builder.addEpsilonEdge(from, stateTo);
                    }
                }
                return builder.getResult();
            });
        });
    });
