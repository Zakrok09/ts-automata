import { EMPTY, Move, toChar } from "../../types";
import { Alphabet } from "../../automata/Alphabet";
import { Automaton } from "../../automata/Automaton";
import { IllegalArgument } from "../../exceptions/exceptions";
import { TMRunner } from "../util/TMRunner";
import { TMState } from "../../states/TMState";

/**
 * Turing machine.
 * Assumes a tape fixed on the left.
 */
export class TM extends Automaton<TMState> {
    public readonly tapeAlphabet: Alphabet;

    public constructor(alphabet: Alphabet, tapeAlphabet: Alphabet, startState: TMState) {
        super(alphabet, startState);
        this.tapeAlphabet = tapeAlphabet;
        this.tapeAlphabet.addChar(EMPTY);
    }

    runString(str: string): boolean {
        return new TMRunner(this).runString(str, this.startState);
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
        // Check there is one accepting state
        if (Array.from(this.states.values()).filter(s => s.accepting).length > 1) {
            throw new IllegalArgument("There can only be one accepting state in a Turing machine!");
        }
    }

    /**
     * Verify inputs.
     * Extract method from addEdge and removeEdge
     * @throws IllegalArgument to an illegal input on either read, write, to or state names.
     * @private
     */
    private verifyInputsAndStates(verify: {
        stateName: string;
        inputStr: string;
        writeStr: string;
        move: Move;
        to: string;
    }) {
        const { inputStr, writeStr, stateName, move, to } = verify;
        if (inputStr.length !== 1) throw new IllegalArgument("Input longer than 1 ");

        const input = toChar(inputStr);
        const writeStack = toChar(writeStr);
        const state = this.states.get(stateName);
        const toState = this.states.get(to);

        this.testSymbolAgainstAlphabet(input, this.tapeAlphabet);
        this.testSymbolAgainstAlphabet(writeStack, this.tapeAlphabet);
        if (!state) throw new IllegalArgument(`State ${stateName} does not exist!`);
        if (!toState) throw new IllegalArgument(`State ${to} does not exist!`);
        if (state.accepting)
            throw new IllegalArgument(`State ${stateName} is an accepting state and cannot have transitions!`);

        return { input, writeStack, state, move, toState };
    }

    /**
     * Add an edge to the nondeterministic push-down automaton.
     * @param stateName the name of the state from which the edge goes.
     * @param inputStr the input of the edge (must be a single char) read from the tape
     * @param writeStr what should be written to the stack
     * @param move
     * @param to the destination state or where the edge goes
     * @throws IllegalArgument throws an error
     * if the input character is not part of the tape alphabet or is longer than a char,
     * the given state does not exist or the destination state does not exist.
     */
    public addEdge(stateName: string, inputStr: string, writeStr: string, move: Move, to: string): void {
        const { input, writeStack, state, toState } = this.verifyInputsAndStates({
            stateName,
            inputStr,
            writeStr,
            move,
            to
        });

        state.insertTransition(input, writeStack, move, toState.name);
    }

    /**
     * Remove an edge from the nondeterministic push-down automaton.
     * @param stateName the name of the state from which the edge goes.
     * @param inputStr the input of the edge (must be a single char) read from the tape
     * @param writeStr what should be written to the stack (epsilon for nothing)
     * @param to the destination state or where the edge goes
     * @throws IllegalArgument throws an error
     * if the input character is not part of the alphabet or is longer than a char,
     * the given state does not exist or the destination state does not exist.
     */
    public removeEdge(stateName: string, inputStr: string, writeStr: string, move: Move, to: string): boolean {
        const { input, writeStack, state, toState } = this.verifyInputsAndStates({
            stateName,
            inputStr,
            writeStr,
            move,
            to
        });

        return state.removeTransition(input, writeStack, move, toState.name);
    }

    public copy(): Automaton<TMState> {
        const resultTM = new TM(this.alphabet, this.tapeAlphabet, this.startState);
        this.states.forEach(state => 
            {resultTM.addState(state.name, state.accepting)});
        this.states.forEach(state =>
            state.transitions.forEach((nextStates, sym) =>
                nextStates.forEach(edge => resultTM.addEdge(state.name, sym, edge.writeTape, edge.move, edge.to))
            )
        );
        return resultTM;
    }
}
