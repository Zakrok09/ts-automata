import {EPSILON, toChar} from "../../types";
import {Alphabet} from "../../automata/Alphabet";
import {Automaton} from "../../automata/Automaton";
import {IllegalArgument} from "../../exceptions/exceptions";
import {PDARunner} from "../../automata/util/PDARunner";
import {PDAState} from "../../states/PDAState";

type StateConfiguration = {stateName: string, stackContents:string[]};


/**
 * Nondeterministic Push-down automaton.
 *
 * @extends Automaton with PDAState.
 * @classdesc a PDA is a 6-tuple of its states, input alphabet, stack alphabet, transition function, starting state
 * and a set of accepting states.
 * It is more powerful compared to DFAs and GNFAs.
 * Decides Context-free languages.
 * @link https://en.wikipedia.org/wiki/Pushdown_automaton
 * @since 0.5.0
 */
export class PDA extends Automaton<PDAState> {
    
    private readonly stackAlphabet: Alphabet

    public constructor(alphabet:Alphabet, stackAlphabet:Alphabet, startState:PDAState) {
        super(alphabet, startState);
        this.stackAlphabet = stackAlphabet
    }

    /**
     * Add a state to the PDA.
     * @param name The name of the state to be added
     * @param final whether the added state should be accepting.
     * Defaults to false
     */
    addState(name: string, final?: boolean): void {
        super.insertState(new PDAState(name), final);
    }

    /**
     * Returns the type of the machine.
     * In this case, this is "PDA."
     * @returns "PDA"
     */
     
    public get machineType(): string {
        return "PDA";
    }

    /**
     * Verify inputs.
     * Extract method from addEdge and removeEdge
     * @throws IllegalArgument to an illegal input on either read, write, to or state names.
     * @private
     */
    private verifyInputsAndStates(verify:{stateName: string, inputStr: string, readStr: string, writeStr: string, to: string}) {
        const {inputStr, readStr, stateName, to, writeStr} = verify
        if (inputStr.length !== 1) {throw new IllegalArgument("Input longer than 1 ")}

        const input = toChar(inputStr),
            readStack = toChar(readStr),
            state = this.states.get(stateName),
            toState = this.states.get(to),
            writeStack = toChar(writeStr);

        if (input !== EPSILON) {this.testSymbolAgainstAlphabet(input);}
        if (readStack !== EPSILON) {this.testSymbolAgainstAlphabet(readStack, this.stackAlphabet)}
        if (writeStack !== EPSILON) {this.testSymbolAgainstAlphabet(writeStack, this.stackAlphabet)}
        if (!state) {throw new IllegalArgument(`State ${stateName} does not exist!`);}
        if (!toState) {throw new IllegalArgument(`State ${to} does not exist!`);}

        return {input, readStack, state, toState, writeStack}
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
    public addEdge(stateName:string, inputStr:string, readStr:string, writeStr:string, to: string):void {
        const {input, readStack, writeStack, state, toState}
            = this.verifyInputsAndStates({inputStr, readStr, stateName, to, writeStr})

        state.insertTransition(input, readStack, writeStack, toState.name);
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
    public removeEdge(stateName:string, inputStr:string, readStr:string, writeStr:string, to:string):boolean {
        const {input, readStack, writeStack, state, toState}
            = this.verifyInputsAndStates({inputStr, readStr, stateName, to, writeStr})

        return state.removeTransition(input, readStack, writeStack, toState.name)
    }

    /**
     * Run a string on the PDA.
     * @param str the string to be run
     * @return true iff the string was accepted.
     */
    runString(str: string): boolean {
        return new PDARunner(this).runString(str, this.startState);
    }

     
    public copy(): Automaton<PDAState> {
        throw new Error("Method not implemented.");
    }

    /**
     * Process the epsilon closure of the given state configuration bunch.
     * The Epsilon closure in the context of a PDA here is defined as all the states
     * that can be reached on epsilon input - empty input.
     * The method returns all the states reachable via epsilon edges and the stack after reaching them.
     * @param stateConfigBunch the bunch of state configuration from which we will look for the epsilon edges.
     * @returns all the states that are reachable via epsilon edges and the stack after reaching them.
     */
    public epsilonClosure(stateConfigBunch:StateConfiguration[]): StateConfiguration[] {
        return new PDARunner(this).epsilonClosure(stateConfigBunch);
    }
}