# TS Automata

[![NPM Package](https://img.shields.io/npm/v/ts-automata.svg?style=flat)](https://npmjs.org/package/ts-automata "View this project on npm")

A TypeScript/JavaScript library for managing automata. 

```shell
npm i ts-automata
```

## Overview

Currently supported are the Deterministic and Non-deterministic finite state automata. 
Make use of the provided TSDoc and JSDoc for each method to see 

## Usage

Automata can be created by initialising an `Alphabet` to feed to the Automaton,
defining the states of the automaton and finally the transition function. 
The code below is an example of creating and running input on a DFA.

```typescript
/* Create an alphabet for the Finite Automaton */
const alphabet = new Set<Char>();
alphabet.add(toChar("a"));
alphabet.add(toChar("b"));

/* Initialize the DFA */
const dfa = new DFA(alphabet, "q0", false)

/* Add states to the DFA */
dfa.addState("q1", false);
dfa.addState("q2", true)

/* Define the transition function for each state */
dfa.addEdge("q0", toChar('b'), "q0");
dfa.addEdge("q0", toChar('a'), "q1");
dfa.addEdge("q1", toChar('a'), "q2");
dfa.addEdge("q1", toChar('b'), "q0");
dfa.addEdge("q2", toChar('a'), "q2");
dfa.addEdge("q2", toChar('b'), "q2");

/* Check for validity */
console.log(dfa.isValid()); 

/* Run strings on the DFA */
dfa.runString("ababababaa") // true
dfa.runString("aa") // true
dfa.runString("abb") // false
```
_Figure 1: The code for the deterministic finite automaton D._

![There are three stares: q0, q1 and q2
q0 is the starting state
q2 is the only accepting state](https://i.imgur.com/pRuPlEv.jpeg "Image of the DFA described in the code abov")
_Figure 2: Visual representation of D._

