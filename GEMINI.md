# Software Development Best Practices
This document outlines the best practices for developing a TypeScript Web App. Adherence to these guidelines is essential for creating high-quality, maintainable, and secure applications.

# Core Software Principles
Creating an excellent user experience is paramount. 

Fundamentally write clean, simple, and robust code.

Adhere to recommended best practices. 

Comply with open, public standards. 

Prioritise open source software. 

Code must be maintainable and easy for humans to read, understand, and modify.

Keep code as simple and explicit as possible to minimise cognitive load.

Write robust, defensive code that gracefully handles all potential faults and errors.

All coding should be guided by testing, linting, automated validation, and code review.

Regularly review all docs.

# Functional Programming Paradigm

Functional Programming (FP) paradigm produces predictable, testable, and maintainable code.

Write functions that only depend on the parameters passed to them. Aim for functions with one or two parameters; the fewer arguments the better. 

Prefer pure and declarative functions with referential transparency.

Embrace immutability by creating new information instead of overwriting existing data. To avoid mutating original arrays, promote the use of array methods like map, filter, and reduce.

Break problems into the smallest components for easier composition of small functions. Prefer composition over inheritance.

# Small Design Iterations
Progress in the smallest possible steps. 

Break down all development tasks into the smallest possible increment that is atomic, complete, independently stable and leaves the program in provably functional state.

Each increment should involve only the minimum alterations required to address one single, logical concern. 

Then iterate through a tight loop of: granular change; verification; commit. 

# Modular Design
Compartmentalise software into modules that address one single, distinct concern. 

Each module should be just large enough to perform one independent, clearly defined, function. 

Each module should be internally coherent and encapsulate one specific piece of functionality.

Minimise coupling between modules by using clear, stable, well-defined interfaces between modules. 

# Test-Driven Development (TDD)
Software must be testable.

Write tests first then build up projects from a reliable automated test suit.

Tests should assert falsifiable claims.

A unit test should be written for every desired behaviour, outcome, or result from a module.

Regularly run tests to check for regressions.

# Error Handling

Exceptions occur frequently so apply a coping strategy rather than halting the program.

Throw errors at the lowest possible level (e.g., at the point of database access).

To propagate errors to a calling function, re-throw the error within a catch block.

When using `async/await`, you must `await` any promise that might throw an error. This includes awaiting a promise within a `try` block if you intend to catch its errors.

Every `fetch` or promise requires a `.catch()` block or a `try/catch` wrapper.

The `fetch` API does not throw for HTTP error statuses; check `!response.ok` and specifically throw an error if needed.

Avoid using the "new" keyword when throwing errors unless the error represents a distinct new class of errors.

# Security

Employ the principle of Least Privilege, granting users and components only the minimal permissions necessary for their tasks.

Never trust user input. Always sanitize and validate user input.

Never store confidential information, such as passwords, API keys, session tokens, or private user details) in any web address. 

# State Management
Avoid storing state in global objects in order to facilitate code reuse. The following is a hierarchy of preferred locations for holding state:
1.  HTML Hypermedia as the Engine of Application State (HATEOAS)
2.  Web address path segments and query parameters
3.  Browser storage (Local Storage, IndexedDB)
4.  State charts (e.g., XState)
5.  Local SQLite instances

# Avoid nested if-else blocks
If possible avoid nested if-else blocks in a function and instead prefer to return early from a function.

# Relative File Paths
Never hard-code absolute file paths into any project file. Construct all paths dynamically at runtime, relative to the project root directory. This ensures the project is portable and protects the privacy of the local file system structure.

# Requirements 
Use "Easy Approach to Requirements Syntax" (EARS) where possible to define and update system requirements. 
See
https://alistairmavin.com/ears/
and
A. Mavin, P. Wilkinson, A. Harwood and M. Novak, "Easy Approach to Requirements Syntax (EARS)," 2009 17th IEEE International Requirements Engineering Conference, Atlanta, GA, USA, 2009, pp. 317-322, doi: 10.1109/RE.2009.9.

# Web Development
## TypeScript
Use TypeScript to improve type safety.

Prefer plain vanilla TypeScript. 

## Minimise Dependencies
Adhere to browser standards and APIs to minimise dependencies and ensure future compatibility.

## HTML
Use semantic HTML. Every page must include a `<main>` element.

## Accessibility
Ensure accessibility for all potential users. This includes using high-contrast typography for legibility.

Only use ARIA tags when no native HTML alternative exists.

## CSS and Styling
CSS must be responsive and mobile-first. Style for mobile initially and use media queries to add styles for larger screens. Include `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` in a HTML file.

Send only the minimal amount of CSS required by using efficient and simple selectors and rules.

In CSS, prefer relative units of length (such as `rem`). Ensure touch targets are large and well-spaced. 

Style transitions should be smooth and fluid over time.

## User Interface (UI) Design
A web page should load and become interactive as quickly as possible. Avoid layout shifts or flashes of unstyled content during loading.

The UI must be intuitive. It should show a clear call to action. It should appear beautiful, pleasant and inviting. 

Strive for clarity and consistency in design. 

Use an elegant and simple aesthetic with a restrained colour pallet.

Design for universal usability that caters to both novices and experts. The interface should offer informative feedback, design dialogues to yield closure, and help users prevent errors or easily reverse actions.

Keep the user in control and minimise the cognitive load on their short-term memory.

# Flexible Documentation
In living documents that evolve with the project (e.g., task lists, design docs), prefer un-ordered lists (bullet points) over numbered lists. This maintains flexibility, allowing for the reordering of items without the need to manually renumber the entire list.

Use a logical heading hierarchy in all Markdown files, starting with `#` for the main title or primary sections. This ensures consistency, improves readability, and allows for a clear document structure.

For task-tracking documents like `docs/tasks.md`, once a task is fully completed, its entire entry (including its heading and all sub-points) should be moved from the active list to the bottom of the dedicated "Completed Tasks" section at the end of the file.

# Code Comments
In code comments, use the active imperative mood (eg set timeout, validate input, fetch data). Exclude all personal pronouns, including 'we'. 

# Language 
Always use British English in documentation and code comments. 

All user-facing messages must be in British English.
