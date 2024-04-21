import {State} from "../states/State";
import {char} from "../types";


export type PDAEdge = {
    readStack:char,
    writeStack:char,
    to:string
}
export class PDAState extends State {
    private readonly _transitions: Map<char, Set<PDAEdge>>

    constructor(name: string) {
        super(name);
        this._transitions = new Map<char, Set<PDAEdge>>();
    }

    get transitions(): Map<char, Set<PDAEdge>> {
        return this._transitions;
    }

    public insertTransition(input:char, readStack:char, writeStack:char, to:string):void {
        let bucket = this._transitions.get(input)

        if (!bucket) {
            bucket = new Set<PDAEdge>()
            bucket.add({readStack, writeStack, to})

            this._transitions.set(input, bucket)
        } else

        // bucket.add({readStack, writeStack, to})
        if (!bucket.has({readStack, writeStack, to})) bucket.add({readStack, writeStack, to});
    }

    public removeTransition(input:char, readStack:char, writeStack:char, to:string):boolean {
        let bucket = this._transitions.get(input)
        if (!bucket) return false;

        return bucket.delete({readStack, writeStack, to});
    }


    public transition(input:char) {
        let res = this._transitions.get(input);
        if (res === undefined) return new Set<PDAEdge>();
        return res;
    }

    public getInputAlphabet():Set<char> {
        return new Set<char>(this._transitions.keys());
    }

}