import {Automaton} from "../../automata/Automaton";
import {Alphabet} from "../../automata/Alphabet";
import {toChar, EPSILON, Move, EMPTY} from "../../types";
import {TMState} from "../../states/TMState";
import {IllegalArgument} from "../../exceptions/exceptions";

/**
 * Turing machine.
 * Assumes a tape fixed on the left.
 */
export class TM extends Automaton<TMState> {

    private readonly tapeAlphabet: Alphabet

    public constructor(alphabet: Alphabet, tapeAlphabet : Alphabet , startState: TMState) {
        super(alphabet, startState);
        this.tapeAlphabet = tapeAlphabet;
    }
    runString(str: string): boolean {
        throw new Error("Method not implemented.");
    }
    public get machineType(): string {
        return "TM";
    }
    

    /**
     * Add a state to the Turing machine.
     * @param name The name of the state to be added
     * @param final whether the added state should be accepting.
     * Defaults to false
     */
    addState(name: string, final?: boolean): void {
        super.insertState(new TMState(name), final);
    }
    /**
     * Verify inputs.
     * Extract method from addEdge and removeEdge
     * @throws IllegalArgument to an illegal inputs on either read, write, to or state names.
     * @private
     */
    private verifyInputsAndStates(verify:{stateName: string, inputStr: string, readStr: string, writeStr: string, move: Move, to: string}) {
        let {inputStr, readStr, writeStr, stateName, move, to} = verify
        if (inputStr.length !== 1) throw new IllegalArgument("Input longer than 1 ")

        let input = toChar(inputStr)
        let readStack = toChar(readStr)
        let writeStack = toChar(writeStr)
        const state = this.states.get(stateName);
        const toState = this.states.get(to);

        if (input !== EPSILON) this.testSymbolAgainstAlphabet(input);
        if (readStack !== EMPTY) this.testSymbolAgainstAlphabet(readStack, this.tapeAlphabet)
        if (writeStack !== EMPTY) this.testSymbolAgainstAlphabet(writeStack, this.tapeAlphabet)
        if (!state) throw new IllegalArgument(`State ${stateName} does not exist!`);
        if (!toState) throw new IllegalArgument(`State ${to} does not exist!`);

        return {input, readStack, writeStack, state, move,toState}
    }

    /**
     * Add an edge to the nondeterministic push-down automaton.
     * @param stateName the name of the state from which the edge goes.
     * @param inputStr the input of the edge (must be a single char)
     * @param readStr what should be read from the stack (epsilon for nothing)
     * @param writeStr what should be written to the stack (epsilon for nothing)
     * @param to the destination state or where the edge goes
     * @throws IllegalArgument throws an error
     * if the input character is not part of the alphabet or is longer than a char,
     * the given state does not exist or the destination state does not exist.
     */
    public addEdge(stateName:string, inputStr:string, readStr:string, writeStr:string, move : Move, to: string):void {
        let {input, readStack, writeStack, state, toState}
            = this.verifyInputsAndStates({stateName, inputStr, readStr, writeStr,move, to})

        state.insertTransition(input, readStack, writeStack, move, toState.name);
    }
    /**
     * Remove an edge from the nondeterministic push-down automaton.
     * @param stateName the name of the state from which the edge goes.
     * @param inputStr the input of the edge (must be a single char)
     * @param readStr what should be read from the stack (epsilon for nothing)
     * @param writeStr what should be written to the stack (epsilon for nothing)
     * @param to the destination state or where the edge goes
     * @throws IllegalArgument throws an error
     * if the input character is not part of the alphabet or is longer than a char,
     * the given state does not exist or the destination state does not exist.
     */
    public removeEdge(stateName:string, inputStr:string, readStr:string, writeStr:string, move : Move, to:string):boolean {
        let {input, readStack, writeStack, state, toState}
            = this.verifyInputsAndStates({stateName, inputStr, readStr, writeStr, move,to})

        return state.removeTransition(input, readStack, writeStack, move, toState.name)
    }


}