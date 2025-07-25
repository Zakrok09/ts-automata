import {char, EMPTY, EPSILON, toChar, Move} from "../../types";
import {TM} from "../../automata";
import {TMEdge, TMState} from "../../states/TMState";
import { error } from "console";

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
        console.log("Running TM with string: ", str);
        str.split("").forEach(c => this.tm.testSymbolAgainstAlphabet(toChar(c)));
        let activeConfigs:StateConfiguration[] =
            [{stateName: startState.name, tapeContents: [...str,EMPTY], currentIndex: 0}]

        while (activeConfigs.length > 0) {

            activeConfigs = this.processNextConfigs(activeConfigs);
            if(activeConfigs.some(conf => this.tm.getState(conf.stateName)!.accepting)){
                return true;
            }
            
        }


        return false
    }

    /**
     * Process the next configs given the symbol and the current active configurations
     * @param activeConfigs the current active configurations
     * @returns the set of next state configurations.
     * @private
     */
    private processNextConfigs(activeConfigs: StateConfiguration[]) {
        let nextConfigs: StateConfiguration[] = []
        for (const {stateName, tapeContents, currentIndex} of activeConfigs) {
            let state = this.tm.getState(stateName)!
            let symbol = toChar(tapeContents[currentIndex]);
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
     * @param currentIndex the current index of the tape head
     * @param nextConfigs pointer to the next configs which will be pointed.
     * @private
     */
    private processTransition(transition: TMEdge, tapeContents: string[], currentIndex: tapeHead, nextConfigs: StateConfiguration[]) {
        if (currentIndex < 0 || currentIndex >= tapeContents.length) {
            throw new Error(`Current index ${currentIndex} is out of bounds for tape contents of length ${tapeContents.length}`);
        }
        let curr_state = this.tm.getState(transition.to)!
        let updatedTape = [...tapeContents]
        let updatedCurrentIndex = currentIndex;
        updatedTape[currentIndex] = transition.writeTape;
        updatedCurrentIndex = this.processTapeHead(updatedTape, updatedCurrentIndex, transition.move);

        nextConfigs.push({stateName: curr_state.name, tapeContents: updatedTape, currentIndex: updatedCurrentIndex})
    }

    

    /**
     * Process the tape head movement based on the move direction.
     * @param tapeContents the current contents of the tape
     * @param currentIndex the current index of the tape head
     * @param move the move direction (either 'R' for right or 'L' for left)
     * @returns updated current index after processing the move.
     * @private
     */
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