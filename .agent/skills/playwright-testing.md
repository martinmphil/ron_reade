---
name: playwright-testing
description: Use Playwright to verify UI changes and run end-to-end tests.
---
# Mission
Ensure every code change is verified by running a Playwright smoke test.

# Instructions
1. After modifying a front-end component, start the dev server using `npm run dev`.
2. Use the `playwright_navigate` tool to open `localhost:3000`.
3. Execute `npx playwright test` to run the full suite.
4. If tests fail, use the `playwright_screenshot` tool to capture the error state and "heal" the code.