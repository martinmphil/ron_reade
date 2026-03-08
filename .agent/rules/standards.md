# Standards

This document is the absolute authority. Follow the coding methodology defined in this file for all actions. 


## Guiding Principle 
Creating excellent user experiences is paramount. 


## Requirements 
For this project the requirements listed in `requirements.md` is the source of truth. 

Requirements can evolve. 

Before starting work, ensure the requirements documentation:- 
1. defines a precise goal 
2. lists unambiguous implementation-agnostic requirements, preferably using the [EARS](https://alistairmavin.com/ears/) syntax 
3. specifies all user-facing behaviours. 

Determine all boundary conditions, edge cases and error states. 


## Coding Standards 
Quality code is defined as:- 
* highly modular 
* robust interfaces between loosely-coupled atomic modules 
* human readable 
* responsive 
* lightweight 
* high-performance 
* accessible 
* testable 
* maintainable 
* fault-tolerant 
* global exception-handling strategy preventing program halts
* algorithmic efficiency 
* clean code. 


### Modular 
Apply modularisation to all software components. 

Each module should be just large enough to encapsulate one specific piece of functionality. 


## Tools 
Request any missing tools needed to execute and test and verify code in a securely isolated environment. 

While minimising dependencies, identify any additional tools strictly necessary to implementing the project requirements. 


## Task List
Outline the step-by-step tasks necessary to fulfil all project requirements. 

Atomise tasks to clear objectives. 

Always ensure every task strictly meets the project requirements defined in the requirements documentation. 

Order tasks to prioritise the most complex component on the critical path. 

Group tasks to trace important functionality from start to finish. 

Update the status of each task after every design iteration to maintain a real-time audit trail. 


## Methodology 
Apply the following methodology for each task.

Progress in the smallest verifiable increment that leaves the software in a provably functional state. 

Each increment should implement only the minimal code required to address one logical atomic issue. 

Before writing any code, always ensure the implementation strictly meets the project requirements. 


### Git
Never commit to the main branch. 

Never merge with the main branch. 

In Git create an integration branch to integrate frequent commits from short-lived feature branches. 

When starting a task create a short-lived feature branch named after that task. 


### Test Driven Development
Write automated tests (unit, integration, end-to-end) BEFORE implementation.

Test must cover every outcome from a module and every requirement. 

Tests should assert falsifiable claims. 

Whenever requirements change, generate new tests written before any implementation code. 


### Design Iterations 
Before making any changes, ensure a stable version of the code is safely committed to a Git code branch. 

In a design iteration, regularly commit stable code to a short-lived feature branch. Unwind any missteps by reverting to a previously stable version of the current short-lived feature branch. 

For each design iteration, use a self-correcting feedback loop of:- 
* run all tests; 
* if no tests cover the current task, then write further tests;
* target a failing test relating to the current task; 
* apply the Red-Green-Refactor techniques of Test Driven Development; 
* write minimal clean code to pass a single test; 
* execute code in a securely isolated environment and capture telemetry; 
* test, verify and challenge the code; 
* debug, refactor and optimise; 
* improve code structure; 
* increase modularisation; 
* remove redundancy; 
* maximise algorithmic efficiency; 
* make the code more clean; 
* remove cruft; 
* match established style; 
* apply automated linting; 
* critiqued changes against best practice in software engineering; 
* verify changes by running all tests; 
* check all previous passing tests still pass; 
* recursively repeat this loop to maximise test successes and code quality. 

Exit the current design iteration loop when:- 
* the system is stable; 
* the changes maximise code quality; 
* the code is clean; 
* the code maximises modularisation; 
* the code minimises size while maintaining readability; 
* the code employs maximum algorithmic efficiency; 
* the code is secure; 
* all previously passing tests still pass; 

When the design iteration succeeds, merge the current short-lived feature branch with an integration branch and move to the next feature or task. 


### Improve Fundamental Strategies 
Constantly failing tests, or hard to test code, often indicates a need to rethink current strategies and possibly further modularisation. 

If fixing one test continually breaks other passing tests, then take a wider view and consider fundamentally changing the whole code structure to improve overall progress towards passing all tests. 

If a test still proves impossible to pass, then summarise this issue and ask for help. 


## Project Completion 
The project is complete when:- 
* the goal of the project is achieved; 
* every requirement is met; 
* the implementation handles all boundary conditions; 
* tests cover every required behaviour; 
* all tests hold meaningful assertions; 
* all automated tests pass with 100% success; 
* the project meets coding standards; 
* the project is of production-grade quality; 
* the project has robust error handling; 
* the project is secure; 
* the project avoids all technical debt; 
* all relevant documentation has been updated; 
* the project meets software development best practice; 
* all Git branches are ready for production. 
