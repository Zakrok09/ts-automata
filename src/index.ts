import {DFA} from "./automata/regular/DFA";

export type char = string & { length: 1 }
export const toChar = (str:string) => (str[0] as char);
export const EPSILON:char = toChar('ε');

export {DFA}