import {State} from "../states/State";
import {char,Move} from "../types";

export type TMEdge = {
    writeTape: char,
    move: Move,
    to: string
}

export class TMState extends State {
    private readonly _transitions: Map<char, Set<TMEdge>>
    constructor(name: string) {
        super(name);
        this._transitions = new Map<char, Set<TMEdge>>();
    }

    get transitions(): Map<char, Set<TMEdge>> {
        return this._transitions;
    }


    public insertTransition(input: char,  writeTape: char, move: Move, to: string): void {
        let bucket = this._transitions.get(input);

        if (!bucket) {
            bucket = new Set<TMEdge>();
            bucket.add({writeTape, move, to});
            this._transitions.set(input, bucket);
        } else if (!bucket.has({writeTape, move, to})) {
            bucket.add({writeTape, move, to});
        }
    }

    public removeTransition(input: char, writeTape: char, move: Move, to: string): boolean {
        let bucket = this._transitions.get(input);
        if (!bucket) return false;

        return bucket.delete({writeTape, move, to});
    }

    public transition(input: char): Set<TMEdge> {
        let res = this._transitions.get(input);
        if (res === undefined) return new Set<TMEdge>();
        return res;
    }

    public getInputAlphabet(): Set<char> {
        return new Set<char>(this._transitions.keys());
    }
}