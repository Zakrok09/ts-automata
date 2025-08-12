# Contributing

To contribute to `ts-automata`, make sure to have a refresher on automata and computation theory. 
Professor Harry Porter provides and absolutelty amazing [65-episode-long course](https://www.youtube.com/watch?v=TOsMcgIK95k&list=PLbtzT1TYeoMjNOGEiaRmm_vMIwUAidnQz)
on computation theory. Each episode is named accordingly, so you can look into spcecific topics.

Before any contributions, please refer to the [Code of conduct](./CODE_OF_CONDUCT.md)

## Reporting bugs
If you have found a bug, please report it as an issue starting with `BUG: ...`. 
If you wish to contribute to resolving this issue, you can fork the repository and make a bug fix Pull request.

To have your bug fix Pull request approved:
- you MUST describe the bug and why is it wrong behaviour
- you MUST provide at least one regression test to cover this case
- (naturally) you MUST fix the bug

## Suggesting ideas or asking questions
If you have a question or an idea you want implemented, you can always open an issue. Please strive to be descriptive in your 
question/suggestion to make it easier to answer/implement.

## Contributing code
When you are done with any refreshers, you can pick an issue or submit one yourself and fork the repository. 

To have your contribution Pull request approved:
- all tests MUST be passing
- your newly added content MUST be covered by tests
- if you are knowingly implementing an existing algorithm in, you MUST give credits to its creator
- if you are adding a utility function or an algorithm that works on automata, you SHOULD provide a mathematical proof of its correctness in the Pull Request description
- your added code SHOULD be documented with TSDoc (do not forget to add yourself as `@author` :) )
