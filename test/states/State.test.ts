import { beforeEach, describe, expect, it } from "vitest";
import { DFAState } from "../../src/states/RegularStates";

describe("Getters and setters", () => {
    let state = new DFAState("state");

    beforeEach(() => {
        state = new DFAState("state");
        state.accepting = false;
    });

    it("should get the correct value", () => {
        expect(state.name).toBe("state");
        expect(state.accepting).toBe(false);
    });

    it("should set the correct value", () => {
        state.accepting = true;
        expect(state.accepting).toBe(true);
    });
});
