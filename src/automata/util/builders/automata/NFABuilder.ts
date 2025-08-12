import { AutomataBuilder } from "./AutomataBuilder";
import { NFA } from "../../../regular/NFA";
import { IllegalArgument } from "../../../../exceptions/exceptions";

type EpsiEdge = {
    from: string;
    to: string;
};

export class NFABuilder extends AutomataBuilder<NFA> {
    private readonly _epsilonEdges: EpsiEdge[];

    constructor(alphabetString: string) {
        super(alphabetString);
        this._epsilonEdges = [];
    }

    /**
     * Stores an epsilon edge to be added later.
     *
     * @param from the starting vertex of the epsilon edge.
     * @param to the ending vertex of the epsilon edge.
     * @return the builder to allow for chaining.
     */
    addEpsilonEdge(from: string, to: string): this {
        this._epsilonEdges.push({ from, to });
        return this;
    }

    /**
     * @override
     * Override AutomataBuilder withEdges function to include functionality for epsilon edges
     *
     * With this function, the Builder can chain addition of edges like:
     * withEdges.from("state1").to("state2").over("abc")
     * Extended with:
     * withEdges.from("state1").to("state2").epsilon()
     */
    public get withEdges(): {
        from: (start: string) => {
            to: (end: string) => {
                over: (symbols: string) => NFABuilder;
                epsilon: () => NFABuilder;
            };
            toSelf: () => {
                over: (symbols: string) => NFABuilder;
            };
        };
    } {
        return {
            from: (start: string) => ({
                to: (to: string) => ({
                    over: (symbols: string) => {
                        for (const over of symbols) this.addEdge(start, over, to);
                        return this;
                    },
                    epsilon: () => this.addEpsilonEdge(start, to)
                }),
                toSelf: () => ({
                    over: (symbols: string) => {
                        for (const over of symbols) this.addEdge(start, over, start);
                        return this;
                    }
                })
            })
        };
    }

    /**
     * Retrieves the result of the NFA builder.
     *
     * @throws IllegalArgument if no starting state is assigned
     *
     * @returns the built NFA object
     */
    getResult(): NFA {
        if (!this._startingState) throw new IllegalArgument("cannot build a NFA without any states!");

        const nfa = new NFA(this._alphabetString, this._startingState.name, this._startingState.isFinal);

        for (const { name, isFinal } of this._stateMap.values()) {
            if (name != this._startingState.name) nfa.addState(name, isFinal);
        }

        for (const { from, over, to } of this._edges) {
            nfa.addEdge(from, over, to);
        }

        for (const { from, to } of this._epsilonEdges) {
            nfa.addEpsilonEdge(from, to);
        }

        return nfa;
    }
}
