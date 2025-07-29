# Software Development Best Practices

This document outlines the best practices for developing a TypeScript Web App. Adherence to these guidelines is essential for creating high-quality, maintainable, and secure applications.

## 1. Core Software Principles

Fundamentally write clean, simple, and robust code.

* **Standards and Maintainability:** Always adhere to recommended best practices and open public standards where possible. Code must be maintainable and easy for humans to read, understand, and modify.
* **Simple and Modular:** Keep code as simple as possible to minimise cognitive load. Software should be modular, with each module performing a clearly defined function. Remember that explicit is better than implicit.
* **Defensive Coding:** Write robust, defensive code that gracefully handles all potential faults and errors.

## 2. Development Process

Employ a test-driven and automated approach to ensure quality and reliability.

* **Test-Driven Development (TDD):** TDD is vital for generating quality software.
    * Software must be testable.
    * Write tests first then build up projects from a reliable set of stable automated tests.
    * Tests should assert falsifiable claims.
    * A unit test should be written for every behaviour, outcome, or result from a module.
* **Automated Guidance:** All coding must be guided by testing, linting, automated validation, and code review.

## 3. Programming Paradigm: Functional & Declarative

Functional Programming (FP) paradigm produces predictable, testable, and maintainable code.

* **Pure Functions:** Functions should ideally only depend on the parameters passed to them. Aim for functions with one or two parameters; the fewer arguments the better. Prefer pure and declarative functions with referential transparency.
* **Immutability:** Embrace immutability by creating new information instead of overwriting existing data. To avoid mutating original arrays, promote the use of array methods like map, filter, and reduce.
* **Composition:** Break problems into the smallest components for easier composition of small functions. Prefer composition to inheritance.

## 4. State Management

Avoiding storing state in global objects facilitates code reuse. The following is a hierarchy of preferred locations for holding state:
1.  HTML Hypermedia as the Engine of Application State (HATEOAS)
2.  Web address sub-directories and query parameters
3.  Browser storage (Local Storage, IndexedDB)
4.  State charts (e.g., XState)
5.  Local SQLite instances
6.  Cloud databases, module-scoped variables, or event-driven patterns

## 5. Error Handling

Exceptions occur frequently so apply a coping strategy rather than halting the program.

* Throw errors at the lowest possible level (e.g., at the point of database access).
* To propagate errors to a calling function, re-throw the error within a catch block.
* When using `async/await`, you must `await` any promise that might throw an error. This includes awaiting a promise within a `try` block if you intend to catch its errors.
* Every `fetch` or promise requires a `.catch()` block or a `try/catch` wrapper.
* The `fetch` API does not throw for HTTP error statuses; check `!response.ok` and throw an error manually if needed.
* Avoid using the "new" keyword when throwing errors unless the error represents a distinct new class of errors.

## 6. Security

* **Least Privilege:** Employ the principle of Least Privilege, granting users and components only the minimal permissions necessary for their tasks.
* **Input Validation:** Never trust user input. Always sanitize and validate it.

## 7. Web Development & UI/UX

### TypeScript & Dependencies
* Use TypeScript to improve type safety.
* Prefer plain vanilla TypeScript and adhere to browser standards and APIs to minimise dependencies and ensure future compatibility.

### HTML & Accessibility
* Use semantic HTML. Every page must include a `<main>` element.
* Ensure accessibility for all potential users. This includes using high-contrast typography for legibility.
* Only use ARIA tags when no native HTML alternative exists.

### CSS & Styling
* **Responsive Design:** CSS must be responsive and mobile-first. Style for mobile initially and use media queries to add styles for larger screens. Include `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` in your HTML.
* **Performance:** Send only the minimal amount of CSS required by using efficient and simple selectors and rules.
* **User Experience:** In CSS, prefer relative units of length (such as `rem`). Ensure touch targets are large and well-spaced. Style transitions should be smooth and fluid over time.

### User Interface (UI) Design
* **Performance:** A web page should load and become interactive as quickly as possible. Avoid layout shifts or flashes of unstyled content during loading.
* **Clarity & Consistency:** The UI must be intuitive. It should show a clear call to action. It should appear beautiful, pleasant and inviting with restrained colour pallet. Strive for consistency in design, using an elegant and simple aesthetic.
* **Usability:** Design for universal usability, catering to both novices and experts. The interface should offer informative feedback, design dialogues to yield closure, and help users prevent errors or easily reverse actions.
* **Cognitive Load:** Keep the user in control and minimise the load on their short-term memory.

## 8. Miscellaneous
* If possible avoid nested if-else blocks in a function and instead prefer to return early from a function.
