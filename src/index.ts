import {DFA} from "./automata/regular/DFA";

export type Symbol = string & { length: 1 }
export const toChar = (str:string) => (str[0] as Symbol);

export {DFA}