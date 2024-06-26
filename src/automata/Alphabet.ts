import {char, EPSILON, toChar} from "../types";
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
     * Returns the size of the object.
     *
     * @returns {number} The size of the object.
     */
    get size():number {
        return this._chars.size;
    }

    /**
     * Checks if the given character exists in the internal set of characters.
     *
     * @param {char} c - The character to check.
     * @return {boolean} - Returns true if the character exists in the set, otherwise returns false.
     */
    public has(c:char):boolean {
        return this._chars.has(c);
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
     * Creates a string by joining all the characters in the array.
     *
     * @return {string} The joined string.
     */
    public joinToString(): string {
        let alphabet = '';
        this.chars.forEach(c => alphabet+=c)
        return alphabet;
    }

    /**
     * Creates an alphabet with each character from the given string.
     *
     * @param str The string containing characters to be added.
     * @return {Alphabet} the created alphabet
     * @throws IllegalArgument If epsilon is being added to the alphabet.
     */
    public static fromString(str:string):Alphabet {
        const alphabet = new Alphabet();

        for (let char of str) {
            alphabet.addChar(toChar(char));
        }

        return alphabet;
    }
}