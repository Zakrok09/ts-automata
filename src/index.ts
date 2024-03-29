import {DFA} from "./automata/regular/DFA";

export type Char = string & { length: 1 }
export const toChar = (str:string) => (str[0] as Char);
export const EPSILON:Char = toChar('ε');

export {DFA}