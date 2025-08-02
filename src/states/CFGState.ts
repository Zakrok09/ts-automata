import { CFG } from '~/automata/context-free/CFG'
import { char, EPSILON } from '../types'
import { IllegalArgument } from '../exceptions/exceptions'

export type CFGEdge = CFGState[]
export abstract class CFGState{
    public symbol : string
    public constructor(symbol : string){
        this.symbol = symbol
    }
    public equal(other : CFGState) : boolean {
        return false
    }
    public abstract toString() : string
}

export class CFGVariable extends CFGState{
    
    public transitions : Set<CFGEdge>
    public constructor(symbol : string){
        super(symbol)
        this.transitions = new Set()
    }
    public addTransition(...states : CFGState[]){
        this.transitions.add(states)
    }
    public removeTransition(states : CFGState[]) : boolean{
        let oldSize = this.transitions.size
        this.transitions.forEach(x => {if(this.transitionEquality(x,states))
                                            {this.transitions.delete(x)}})
        return this.transitions.size != oldSize
        
    }
    protected transitionEquality(transition : CFGState[], otherTransition : CFGState[]) : boolean{
        if (transition.length!=otherTransition.length){
            return false;
        }
        let flag = true;
        for(let i = 0 ; i < transition.length;++i){
            let stateThis = transition[i]
            flag = flag && (stateThis.equal(otherTransition[i]))
        }
        return flag
    }
    public equal(other: CFGState): boolean {
        if (other instanceof CFGTerminal){
            return false;
        }
        return other.symbol == this.symbol
    }
    public toString(): string {
        let res = this.symbol + " -> ";
        return res+ this.transitions.values().map(x=>x.map(state => state.symbol).join(" ")).toArray().join(" | ")
    }

}
export class CFGTerminal extends CFGState{
    
    public constructor(symbol : string){
        if(symbol.length!=1){
            throw new IllegalArgument("Terminal symbol has to be of length 1")
        }
        super(symbol)
    }

    public equal(other: CFGState): boolean {
        if (other instanceof CFGVariable){
            return false;
        }
        return other.symbol == this.symbol
    }

    public toString(): string {
        if(this.symbol==EPSILON){
            return ""
        }
        return this.symbol;
    }

}

