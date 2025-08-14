import { beforeEach, describe, expect, it } from "vitest";
import { GNFA } from "../../../src/automata/regular/GNFA";
import Fixtures from "../../fixtures";

describe("GNFA: Running string on GNFA", () => {
    let gnfa: GNFA;

    beforeEach(() => {
        gnfa = Fixtures.genericGNFA();
    });

    it("should run a string on a GNFA", () => {
        expect(gnfa.runString("b")).toBe(true);
        expect(gnfa.runString("aab")).toBe(true);
        expect(gnfa.runString("aaa")).toBe(false);
        expect(gnfa.runString("")).toBe(false);
        expect(gnfa.runString("abbaa")).toBe(true);
    });
});
