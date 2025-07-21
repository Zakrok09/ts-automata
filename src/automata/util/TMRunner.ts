import {char, EMPTY, EPSILON, toChar, Move} from "../../types";
import {TM} from "../../automata";
import {TMEdge, TMState} from "../../states/TMState";

type tapeHead = number 
type StateConfiguration = {stateName: string, tapeContents:string[], currentIndex: tapeHead};

/**
 * TM runner method class.
 * @link https://refactoring.guru/replace-method-with-method-object
 */
export class TMRunner {
    private readonly tm:TM

    constructor(tm:TM) {
        this.tm = tm;
    }

    /**
     * Run a string on the TM.
     * @param str the string to be run
     * @param startState pointer to the starting state of the TM.
     * @return true iff the string was accepted.
     */
    public runString(str: string, startState: TMState): boolean {
        let activeConfigs:StateConfiguration[] =
            this.epsilonClosure([{stateName: startState.name, tapeContents: [], currentIndex: 0}])

        while (str.length > 0 && activeConfigs.length > 0) {
            const symbol = toChar(str[0])
            str = str.slice(1)

            let nextActiveConfigs = this.processNextConfigs(activeConfigs, symbol);
            activeConfigs = this.epsilonClosure(nextActiveConfigs);
        }

        return activeConfigs.some(conf => this.tm.getState(conf.stateName)!.accepting)
    }

    /**
     * Process the next configs given the symbol and the current active configurations
     * @param activeConfigs the current active configurations
     * @param symbol the symbol on which we will be going further in the TM
     * @returns the set of next state configurations.
     * @private
     */
    private processNextConfigs(activeConfigs: StateConfiguration[], symbol: char) {
        let nextConfigs: StateConfiguration[] = []
        for (const {stateName, tapeContents, currentIndex} of activeConfigs) {
            let state = this.tm.getState(stateName)!

            state.transition(symbol).forEach(t =>
                this.processTransition(t, tapeContents, currentIndex, nextConfigs)
            );
        }
        return nextConfigs;
    }

    /**
     * Process the next transition on that symbol
     * @param transition the transition to process
     * @param tapeContents the current contents of the tape
     * @param nextConfigs pointer to the next configs which will be pointed.
     * @private
     */
    private processTransition(transition: TMEdge, tapeContents: string[], currentIndex: tapeHead, nextConfigs: StateConfiguration[]) {
        if (transition.readTape !== EPSILON
            && (tapeContents[tapeContents.length - 1] !== transition.readTape)) {
            return;
        }
        if (currentIndex < 0 || currentIndex >= tapeContents.length) {
            throw new Error(`Current index ${currentIndex} is out of bounds for tape contents of length ${tapeContents.length}`);
        }
        let curr_state = this.tm.getState(transition.to)!
        let updatedTape = [...tapeContents]
        let updatedCurrentIndex = currentIndex;
        if (transition.writeTape !== EPSILON) updatedTape[currentIndex] = transition.writeTape;
        updatedCurrentIndex = this.processTapeHead(updatedTape, updatedCurrentIndex, transition.move);

        nextConfigs.push({stateName: curr_state.name, tapeContents: updatedTape, currentIndex: updatedCurrentIndex})
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
        const stack:StateConfiguration[] = [...stateConfigBunch];
        const closureStateConfigs = new Set<StateConfiguration>(stack);

        while (stack.length > 0) {
            const { stateName, tapeContents, currentIndex } = stack.pop()!;
            let state = this.tm.getState(stateName)!

            state.transition(EPSILON).forEach(e =>
                this.processEdge(tapeContents, currentIndex, e, closureStateConfigs, stack));
        }

        return Array.from(closureStateConfigs);
    }

    /**
     * Process an epsilon edge from the current state.
     * @param tapeContents the contents of the tape at the current state.
     * @param edge the edge we are processing
     * @param closureStateConfigs the total closure of state configurations
     * @param stack the stack to which we will push in case we reach a configuration we haven't
     * @private
     */
    private processEdge(tapeContents: string[],currentIndex:number, edge: TMEdge, closureStateConfigs: Set<StateConfiguration>, stack: StateConfiguration[]) {
        const tapeContentsCopy = [...tapeContents]
        if (edge.readTape === tapeContents[currentIndex]){
            tapeContentsCopy[currentIndex] = edge.writeTape;
        }
        let updatedCurrentIndex = currentIndex;
        updatedCurrentIndex = this.processTapeHead(tapeContentsCopy, updatedCurrentIndex, edge.move);

        let instance = {stateName: edge.to, tapeContents: tapeContentsCopy, currentIndex: updatedCurrentIndex};
        if (!closureStateConfigs.has(instance)) {
            closureStateConfigs.add(instance);
            stack.push(instance)
        }
    }
    private processTapeHead(tapeContents:string[], currentIndex:tapeHead, move: Move){
        if (move === 'R') {
            if (currentIndex == tapeContents.length - 1) tapeContents.push(EMPTY);
            currentIndex++;
        } else {
            // Can also be replaced with : (currentIndex -1)& ~(result >> 31)
            // Ensure the tapehead is left bounded
            currentIndex = Math.max(currentIndex-1,0);
        }
        return currentIndex;
    }
}