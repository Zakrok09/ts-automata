import {Alphabet, Automaton} from "../../automata";
import {toChar, EPSILON} from "../../types";
import {PDAState} from "../../states/PDAState";
import {IllegalArgument} from "../../exceptions/exceptions";

type StateConfiguration = {stateName: string, stackContents:string[]};



export class PDA extends Automaton<PDAState> {
    private readonly stackAlphabet: Alphabet

    public constructor(alphabet:Alphabet, stackAlphabet:Alphabet, startState:PDAState) {
        super(alphabet, startState);
        this.stackAlphabet = stackAlphabet
    }

    addState(name: string, final?: boolean): void {
        super.insertState(new PDAState(name), final);
    }

    public addEdge(stateName:string, inputStr:string, readStr:string, writeStr:string, to: string):void {
        if (inputStr.length !== 1) throw new IllegalArgument("Input longer than 1 ")

        let input = toChar(inputStr)
        if (input !== EPSILON) this.testSymbolAgainstAlphabet(input);

        let readStack = toChar(readStr)
        if (readStack !== EPSILON) this.testSymbolAgainstAlphabet(readStack, this.stackAlphabet)

        let writeStack = toChar(writeStr)
        if (writeStack !== EPSILON) this.testSymbolAgainstAlphabet(writeStack, this.stackAlphabet)

        const state = this.states.get(stateName);
        if (!state) throw new IllegalArgument(`State ${stateName} does not exist!`);

        const toState = this.states.get(to);
        if (!toState) throw new IllegalArgument(`State ${to} does not exist!`);

        state.insertTransition(input, readStack, writeStack, toState.name);
    }

    public removeEdge(stateName:string, inputStr:string, readStr:string, writeStr:string, to:string):boolean {
        let input = toChar(inputStr)
        let readStack = toChar(readStr)
        let writeStack = toChar(writeStr)
        if (input !== EPSILON) this.testSymbolAgainstAlphabet(input)
        if (readStack !== EPSILON) this.testSymbolAgainstAlphabet(readStack, this.stackAlphabet);
        if (writeStack !== EPSILON) this.testSymbolAgainstAlphabet(writeStack, this.stackAlphabet);


        const state = this.states.get(stateName);
        if (!state) throw new IllegalArgument(`State ${stateName} does not exist!`);

        const dest = this.states.get(to);
        if (!dest) throw new IllegalArgument(`State ${stateName} does not exist!`);

        return state.removeTransition(input, readStack, writeStack, dest.name)
    }

    runString(str: string): boolean {
        let activeStateConfigs:StateConfiguration[] = this.epsilonClosure([{stateName: this._startState.name, stackContents: []}])

        while (str.length > 0 && activeStateConfigs.length > 0) {
            const symbol = toChar(str[0])
            str = str.slice(1)

            let nextActiveConfigs:StateConfiguration[] = []
            for (const {stateName, stackContents} of activeStateConfigs) {
                let state = this.getState(stateName)!
                const transitions = state.transition(symbol)

                transitions.forEach(transition => {
                    if (transition.readStack !== EPSILON
                        && (stackContents.length === 0 || stackContents[stackContents.length - 1] !== transition.readStack)) {
                        return;
                    }

                    let curr_state = this.getState(transition.to)!
                    let updatedStack = [...stackContents]

                    if (transition.readStack !== EPSILON) {
                        updatedStack.pop();
                    }

                    if (transition.writeStack !== EPSILON) {
                        updatedStack.push(transition.writeStack);
                    }


                    nextActiveConfigs.push({stateName: curr_state.name, stackContents: updatedStack})
                });
            }

            activeStateConfigs = this.epsilonClosure(nextActiveConfigs);
        }

        console.log(activeStateConfigs)

        return activeStateConfigs.some(conf => this.getState(conf.stateName)!.accepting)
    }

    public epsilonClosure(stateBunch:StateConfiguration[]): StateConfiguration[] {
        const stack:StateConfiguration[] = [...stateBunch];
        const closureStateConfigs = new Set<StateConfiguration>(stack);

        while (stack.length > 0) {
            const { stateName, stackContents } = stack.pop()!;
            let state = this.getState(stateName)!
            const followingEdges = state.transition(EPSILON);

            for (let edge of followingEdges) {
                const stackContentsCopy = [...stackContents]
                if (edge.readStack === EPSILON) {
                    if (edge.writeStack !== EPSILON) stackContentsCopy.push(edge.writeStack)
                } else {
                    if (edge.readStack === stackContentsCopy.pop()) {
                        if (edge.writeStack !== EPSILON) stackContentsCopy.push(edge.writeStack)
                    } else continue;
                }

                let instance = {stateName: edge.to, stackContents: stackContentsCopy};
                if (!closureStateConfigs.has(instance)) {
                    closureStateConfigs.add(instance);
                    stack.push(instance)
                }
            }
        }

        return Array.from(closureStateConfigs);
    }
}