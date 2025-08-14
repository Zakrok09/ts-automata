export type char = string & { length: 1 };
export const toChar = (str: string) => str[0] as char;
export const EPSILON: char = toChar("ε");
export const EMPTY: char = toChar("□");
export type Move = "L" | "R";
export type Operator = "XOR" | "AND" | "OR";
