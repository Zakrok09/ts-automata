import { Move, char } from "../types";
import { State } from "../states/State";

export type TMEdge = {
    writeTape: char;
    move: Move;
    to: string;
};

export class TMState extends State {
    public readonly transitions: Map<char, Set<TMEdge>>;

    constructor(name: string) {
        super(name);
        this.transitions = new Map<char, Set<TMEdge>>();
    }

    public insertTransition(input: char, writeTape: char, move: Move, to: string): void {
        let bucket = this.transitions.get(input);

        if (!bucket) {
            bucket = new Set<TMEdge>();
            bucket.add({ writeTape, move, to });
            this.transitions.set(input, bucket);
        } else if (!bucket.has({ writeTape, move, to })) {
            bucket.add({ writeTape, move, to });
        }
    }

    public removeTransition(input: char, writeTape: char, move: Move, to: string): boolean {
        const bucket = this.transitions.get(input);
        if (!bucket) return false;
        const oldBucketSize = bucket.size;
        bucket.forEach(x => {
            if (x.move === move && x.to === to && x.writeTape === writeTape) {
                bucket.delete(x);
            }
        });
        return bucket.size !== oldBucketSize;
    }

    public transition(input: char): Set<TMEdge> {
        const res = this.transitions.get(input);
        if (!res) return new Set<TMEdge>();
        return res;
    }

    public getInputAlphabet(): Set<char> {
        return new Set<char>(this.transitions.keys());
    }
}
