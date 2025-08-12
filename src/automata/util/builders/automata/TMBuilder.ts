import {AutomataBuilder} from "./AutomataBuilder";
import {TM} from "../../../non-context-free/TM";
import {IllegalArgument} from "../../../../exceptions/exceptions";
import { Alphabet } from "../../../../automata"; 
import { TMState } from "../../../../states/TMState";
import { Move } from "../../../../types";


export class TMBuilder extends AutomataBuilder<TM>{
    private readonly _tapeAlphabet;

    constructor(alphabetString: string, _tapeAlphabet : string) {
        super(alphabetString);
        this._tapeAlphabet = _tapeAlphabet;
    }

    

    /**
     * @override
     * Override AutomataBuilder withEdges function to include functionality for epsilon edges
     *
     * With this function, the Builder can chain addition of edges like:
     * withEdges.from("state1").to("state2").over("aaRbaR")
     * 
     * <state1> --[(a->a,R),(b->a,R)]--> <state2>
     */
    public get withEdges(): {
        from: (start: string) => {
            to: (end: string) => {
                over: (symbols: string) => TMBuilder
            },
            toSelf: () => {
                over: (symbols: string) => TMBuilder
            }
        }
    } {
        return {
            from: (start: string) => ({
                to: (to: string) => ({
                    over: (symbols: string) => {
                        
                        if (symbols.length === 0) return this;
                        // Break string abRbbR into array ["abR", "bbR"] empty array if symbols is empty
                        const parts = symbols.match(/.{1,3}/g) || [];
                        for (const part of parts) {
                            this.addEdge(start, part, to);
                        }
                        return this;
                    },
                }),
                toSelf: () => ({
                    over: (symbols: string) => {
                        // Break string abRbbR into array ["abR", "bbR"] empty array if symbols is empty
                        if (symbols.length === 0) return this;
                        const parts = symbols.match(/.{1,3}/g) || [];
                        for (const part of parts) {
                            this.addEdge(start, part, start);
                        }
                        return this;
                    }
                })
            })
        };
    }

    /**
     * Retrieves the result of the TM builder.
     *
     * @throws IllegalArgument if no starting state is assigned
     *
     * @returns the built TM object
     */
    getResult(): TM {
        if(!this._startingState) throw new IllegalArgument("cannot build a TM without any states!")
        const startState = new TMState(this._startingState.name)
        const tm = new TM(Alphabet.fromString(this._alphabetString), Alphabet.fromString(this._tapeAlphabet), startState)
        for (const {name, isFinal} of this._stateMap.values()) {
            if (name != this._startingState.name)
                tm.addState(name, isFinal)
        }
        for (const {from, over, to} of this._edges) {
            const readSymbol = over[0];
            const writeSymbol = over[1];
            const move = over[2] as Move;
            tm.addEdge(from, readSymbol,writeSymbol,move, to);
        }
        return tm;
    }
    /**
     * Adds an edge to the graph.
     *
     * @param from - The starting node of the edge.
     * @param over - The input of the edge.
     * @param to - The ending node of the edge.
     * @throws IllegalArgument if 'over' has a length not equal to 3.
     */
    public addEdge(from:string, over:string, to:string):this {
        if (over.length !=3) throw new IllegalArgument("cannot add input != 3 in size")
        if (over[2] !== 'L' && over[2] !== 'R') {
            throw new IllegalArgument("cannot add input with move != L or R")
        }
        this._edges.push({from, over, to});

        return this;
    }
}