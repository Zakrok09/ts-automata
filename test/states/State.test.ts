import {describe, beforeEach, it, expect} from "vitest";

import {State} from "../../src/states/State";
import {DFAState} from "../../src/states/RegularStates";

describe("Getters and setters", () => {
    let state:State

    beforeEach(() => {
        state = new DFAState("state")
        state.accepting = false;
    })

    it("should get the correct value", () => {
        expect(state.name).toBe("state")
        expect(state.accepting).toBe(false)
    })

    it("should set the correct value", () => {
        state.accepting = true;
        expect(state.accepting).toBe(true)
    })
})