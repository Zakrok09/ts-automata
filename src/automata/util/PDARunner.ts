import {char, EPSILON, toChar} from "../../types";
import {PDA} from "../../automata";
import {PDAEdge, PDAState} from "../../states/PDAState";

type StateConfiguration = {stateName: string, stackContents:string[]};

/**
 * PDA runner method class.
 * @link https://refactoring.guru/replace-method-with-method-object
 */
export class PDARunner {
    private readonly pda:PDA

    constructor(pda:PDA) {
        this.pda = pda;
    }

    /**
     * Run a string on the PDA.
     * @param str the string to be run
     * @param startState pointer to the starting state of the PDA.
     * @return true iff the string was accepted.
     */
    public runString(str: string, startState: PDAState): boolean {
        let activeConfigs:StateConfiguration[] =
            this.epsilonClosure([{stateName: startState.name, stackContents: []}])

        while (str.length > 0 && activeConfigs.length > 0) {
            const symbol = toChar(str[0])
            str = str.slice(1)

            let nextActiveConfigs = this.processNextConfigs(activeConfigs, symbol);
            activeConfigs = this.epsilonClosure(nextActiveConfigs);
        }

        return activeConfigs.some(conf => this.pda.getState(conf.stateName)!.accepting)
    }

    /**
     * Process the next configs given the symbol and the current active configurations
     * @param activeConfigs the current active configurations
     * @param symbol the symbol on which we will be going further in the PDA
     * @returns the set of next state configurations.
     * @private
     */
    private processNextConfigs(activeConfigs: StateConfiguration[], symbol: char) {
        let nextConfigs: StateConfiguration[] = []
        for (const {stateName, stackContents} of activeConfigs) {
            let state = this.pda.getState(stateName)!

            state.transition(symbol).forEach(t =>
                this.processTransition(t, stackContents, nextConfigs)
            );
        }
        return nextConfigs;
    }

    /**
     * Process the next transition on that symbol
     * @param transition the transition to process
     * @param stackContents the current contents of the stack
     * @param nextConfigs pointer to the next configs which will be pointed.
     * @private
     */
    private processTransition(transition: PDAEdge, stackContents: string[], nextConfigs: StateConfiguration[]) {
        if (transition.readStack !== EPSILON
            && (stackContents.length === 0 || stackContents[stackContents.length - 1] !== transition.readStack)) {
            return;
        }

        let curr_state = this.pda.getState(transition.to)!
        let updatedStack = [...stackContents]

        if (transition.readStack !== EPSILON) updatedStack.pop();
        if (transition.writeStack !== EPSILON) updatedStack.push(transition.writeStack);

        nextConfigs.push({stateName: curr_state.name, stackContents: updatedStack})
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
            const { stateName, stackContents } = stack.pop()!;
            let state = this.pda.getState(stateName)!

            state.transition(EPSILON).forEach(e =>
                this.processEdge(stackContents, e, closureStateConfigs, stack));
        }

        return Array.from(closureStateConfigs);
    }

    /**
     * Process an epsilon edge from the current state.
     * @param stackContents the contents of the stack at the current state.
     * @param edge the edge we are processing
     * @param closureStateConfigs the total closure of state configurations
     * @param stack the stack to which we will push in case we reach a configuration we haven't
     * @private
     */
    private processEdge(stackContents: string[], edge: PDAEdge, closureStateConfigs: Set<StateConfiguration>, stack: StateConfiguration[]) {
        const stackContentsCopy = [...stackContents]
        if (edge.readStack === EPSILON) {
            if (edge.writeStack !== EPSILON) stackContentsCopy.push(edge.writeStack)
        } else {
            if (edge.readStack === stackContentsCopy.pop()) {
                if (edge.writeStack !== EPSILON) stackContentsCopy.push(edge.writeStack)
            } else return;
        }

        let instance = {stateName: edge.to, stackContents: stackContentsCopy};
        if (!closureStateConfigs.has(instance)) {
            closureStateConfigs.add(instance);
            stack.push(instance)
        }
    }
}