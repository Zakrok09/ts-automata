export class IllegalArgument extends Error {}

export class IllegalAutomatonState extends Error {}

export class UndecidableProblem extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UndecidableProblem";
    }
}