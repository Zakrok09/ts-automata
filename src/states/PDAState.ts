import { State } from "../states/State";
import { char } from "../types";

export type PDAEdge = {
    readStack: char;
    writeStack: char;
    to: string;
};

export class PDAState extends State {
    public readonly transitions: Map<char, Set<PDAEdge>>;

    constructor(name: string) {
        super(name);
        this.transitions = new Map<char, Set<PDAEdge>>();
    }

    public insertTransition(input: char, readStack: char, writeStack: char, to: string): void {
        let bucket = this.transitions.get(input);

        if (!bucket) {
            bucket = new Set<PDAEdge>();
            bucket.add({ readStack, writeStack, to });

            this.transitions.set(input, bucket);
        } else if (!bucket.has({ readStack, writeStack, to })) bucket.add({ readStack, writeStack, to });
    }

    public removeTransition(input: char, readStack: char, writeStack: char, to: string): boolean {
        const bucket = this.transitions.get(input);
        if (!bucket) return false;

        return bucket.delete({ readStack, writeStack, to });
    }

    public transition(input: char) {
        const res = this.transitions.get(input);
        if (!res) return new Set<PDAEdge>();
        return res;
    }

    public getInputAlphabet(): Set<char> {
        return new Set<char>(this.transitions.keys());
    }
}
