import {char, EPSILON, toChar} from "../index";
import {IllegalArgument} from "../exceptions/exceptions";

export class Alphabet {
    private readonly _chars:Set<char>;

    constructor() {
        this._chars = new Set<char>();
    }

    /**
     * Retrieve the set of characters used in the class.
     *
     * @return A Set containing the characters used in the class.
     */
    get chars(): Set<char> {
        return this._chars;
    }

    /**
     * Adds a character to the alphabet.
     *
     * @param c - The character to add.
     * @throws IllegalArgument If an epsilon is being added to the alphabet.
     */
    public addChar(c:char) {
        if (c === EPSILON) throw new IllegalArgument("Epsilon can never be part of an alphabet")
        this._chars.add(c);
    }

    /**
     * Adds characters to the existing list of characters.
     *
     * @param chars - The characters to add.
     * @throws IllegalArgument
     */
    public addChars(...chars:char[]) {
        chars.forEach(this.addChar);
    }

    /**
     * Adds each character from the given string to the existing string.
     *
     * @param str The string containing characters to be added.
     * @throws IllegalArgument If epsilon is being added to the alphabet.
     */
    public addCharFromString(str:string) {
        for (let char of str) {
            this.addChar(toChar(char));
        }
    }
}