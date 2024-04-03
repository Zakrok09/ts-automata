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

Automata can be created by choosing an alphabet to feed to the Automaton,
defining the states of the automaton and finally the transition function. 
The code below is an example of creating and running input on a DFA.

```typescript
/* Initialize the DFA */
const dfa = new DFA("ab", "q0", false)

/* Add states to the DFA */
dfa.addState("q1", false);
dfa.addState("q2", true)

/* Define the transition function for each state */
dfa.addEdge("q0", 'b', "q0");
dfa.addEdge("q0", 'a', "q1");
dfa.addEdge("q1", 'a', "q2");
dfa.addEdge("q1", 'b', "q0");
dfa.addEdge("q2", 'a', "q2");
dfa.addEdge("q2", 'b', "q2");

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

This can also be done using the helpful `DFABuilder`:
```typescript
const dfa = new DFABuilder("ab")
    /* Add states to the DFA */
    .withNotFinalStates("q0", "q1")
    .withFinalStates("q2")

    /* Define the transition function for each state */
    .withEdges.from("q0").toSelf().over("b")
    .withEdges.from("q0").to("q1").over("a")
    .withEdges.from("q1").to("q2").over("a")
    .withEdges.from("q1").to("q0").over("b")
    .withEdges.from("q2").toSelf().over("ab")
    .getResult()
```
_Figure 3: Creating a DFA using a `DFABuilder`._