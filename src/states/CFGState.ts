import { CFG } from '~/automata/context-free/CFG'
import { char } from '../types'

export abstract class CFGState{
    public symbol : char
    public constructor(symbol : char){
        this.symbol = symbol
    }
    public equal(other : CFGState) : boolean {
        return false
    }
}

export class CFGVariable extends CFGState{
    
    public transitions : Set<CFGState[]>
    public constructor(symbol : char){
        super(symbol)
        this.transitions = new Set()
    }
    public addTransition(states : CFGState[]){
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

}
export class CFGTerminal extends CFGState{
    public constructor(symbol : char){
        super(symbol)
    }

    public equal(other: CFGState): boolean {
        if (other instanceof CFGVariable){
            return false;
        }
        return other.symbol == this.symbol
    }

}

