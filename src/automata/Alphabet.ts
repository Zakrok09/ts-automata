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
     * Adds characters to the existing list of characters.
     *
     * @param chars - The characters to add.
     * @throws IllegalArgument
     */
    public addChars(...chars:char[]) {
        chars.forEach(this.addChar);
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

    /**
     * Converts an array of characters to a string and creates an instance of the Alphabet class.
     *
     * @param {Array} chars - An array of characters.
     * @return {Alphabet} - An instance of the Alphabet class.
     */
    public static fromCharString(...chars:char[]):Alphabet {
        return Alphabet.fromString(chars.join(''));
    }
}