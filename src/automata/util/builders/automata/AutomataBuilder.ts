import { IllegalArgument } from "../../../../exceptions/exceptions";
import { Automaton } from "../../../Automaton";
import { EPSILON } from "../../../../types";
import { State } from "../../../../states/State";

export abstract class AutomataBuilder<T extends Automaton<State>> {
    protected _stateMap: Map<string, StateBuildTuple>;
    protected readonly _edges: Edge[];
    protected readonly _alphabetString: string;
    protected _startingState: StateBuildTuple | undefined;

    protected constructor(alphabetString: string) {
        this._stateMap = new Map();
        this._edges = [];
        this._alphabetString = alphabetString;
        this._startingState = undefined;
    }

    /**
     * Stores a state to be added later
     *
     * @param name - The name of the state.
     * @param isFinal - Indicates if the state is final.
     * @returns - The instance of the object.
     */
    public addState(name: string, isFinal: boolean): this {
        if (!this._startingState) this._startingState = { name, isFinal };
        this._stateMap.set(name, { name, isFinal });
        return this;
    }

    /**
     * Adds an edge to the graph.
     *
     * @param from - The starting node of the edge.
     * @param over - The input of the edge.
     * @param to - The ending node of the edge.
     * @throws IllegalArgument if 'over' has a length greater than 1.
     */
    public addEdge(from: string, over: string, to: string): this {
        if (over.length > 1) throw new IllegalArgument("cannot add input > 1 in size");

        if (over === EPSILON)
            throw new IllegalArgument(
                "cannot add EPSILON edges to general automata builder" +
                    "Use the special methods on NFA for adding epsilon edges"
            );

        this._edges.push({ from, over, to });

        return this;
    }

    /**
     * Returns a StateBuildTuple by its name from the building map if found
     *
     * @param name the name of the state to look for in the state map
     * @returns a StateBuildTuple corresponding to the name or undefined if nothing is found
     */
    public getState(name: string): StateBuildTuple | undefined {
        return this._stateMap.get(name);
    }

    /* TODO:
        MAKE IT WORK WITH MULTIPLE STARTING AND MULTIPLE TO STATES
        Essentially allow this from("start","end").to("going").over(a)
        will make start =a=> going and end =a=> going
        */
    /**
     * Functional way of adding edges in a human-readable fashion.
     *
     * With this function, the Builder can chain addition of edges like:
     * withEdges.from("state1").to("state2").over("abc")
     */
    public get withEdges(): {
        from: (start: string) => {
            to: (end: string) => { over: (symbols: string) => AutomataBuilder<T> };
            toSelf: () => { over: (symbols: string) => AutomataBuilder<T> };
        };
    } {
        return {
            from: (start: string) => ({
                to: (to: string) => ({
                    over: (symbols: string) => {
                        for (const over of symbols) this.addEdge(start, over, to);
                        return this;
                    }
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
     * Adds multiple states one after the other in a left-to-right manner.
     *
     * @param areFinal whether they are final
     * @param names the names of the said states
     */
    private withStates(areFinal: boolean, names: string[]): this {
        names.forEach(name => this.addState(name, areFinal));
        return this;
    }

    /**
     * Adds the specified names to the list of not final states.
     *
     * @param names varargs the names of the states to be added.
     * @return this object to allow chaining of method calls.
     */
    public withNotFinalStates(...names: string[]): this {
        return this.withStates(false, names);
    }

    /**
     * Adds final states to the current object.
     *
     * @param names varargs the names of the states to be added.
     * @return this object to allow chaining of method calls.
     */
    public withFinalStates(...names: string[]): this {
        return this.withStates(true, names);
    }

    public abstract getResult(): T;
}

/**
 * HELPER TYPES USED IN THE DFA BUILDER
 */
export type Edge = { from: string; over: string; to: string };
export type StateBuildTuple = { name: string; isFinal: boolean };
