import { test, expect, type Page } from '@playwright/test';

test.describe.serial('Ron Reade TTS App', () => {
    let page: Page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();

        // Forward browser logs to help debug E2E failures
        page.on('console', (msg) => {
            console.log(`BROWSER [${msg.type()}]: ${msg.text()}`);
        });

        await page.goto('/');

        // Initial model download - only happens ONCE for the whole file now.
        // Timeout reduced from original 10min, but high enough to survive slow networks.
        await expect(page.locator('#status_report')).not.toHaveText(/Downloading/, { timeout: 240000 });
    });

    test.afterAll(async () => {
        await page.close();
    });

    test('should synthesize speech from valid text', async () => {
        // 1. Enter text
        const textArea = page.locator('#ron_text');
        await textArea.fill('Hello world, this is a test.');

        // 2. Click Create Speech
        const processButton = page.locator('#process_text_button');
        await expect(processButton).toBeEnabled();
        await processButton.click();

        // 3. Verify status updates
        const statusReport = page.locator('#status_report');
        await expect(statusReport).toHaveText('Ready.', { timeout: 45000 });

        // 4. Verify Audio Player
        const audio = page.locator('#audio_output');
        await expect(audio).toBeVisible();
        await expect(audio).toHaveAttribute('src', /^blob:/);
    });

    test('should process multiple sentences with correct indicators and audio', async () => {
        // Reset state for new test
        await page.locator('#clear_button').click();

        const textArea = page.locator('#ron_text');
        const s1 = "This is the first sentence to test the chunking process".padStart(60, 'A');
        const s2 = "Here is the second one extending length to catch ui state".padStart(60, 'B');
        const s3 = "And the third sentence completes the required processing".padStart(60, 'C');
        const inputText = `${s1}. ${s2}. ${s3}.`;
        await textArea.fill(inputText);

        const processButton = page.locator('#process_text_button');
        await expect(processButton).toBeEnabled();
        await processButton.click();

        const statusReport = page.locator('#status_report');
        await expect(statusReport).toHaveClass(/loading/);

        await expect(statusReport).toContainText('Processing text chunk 1 of 3', { timeout: 30000 });
        await expect(statusReport).toContainText('Processing text chunk 2 of 3', { timeout: 30000 });
        await expect(statusReport).toContainText('Processing text chunk 3 of 3', { timeout: 30000 });

        await expect(statusReport).toHaveText('Ready.', { timeout: 30000 });
        await expect(statusReport).not.toHaveClass(/loading/);

        const audio = page.locator('#audio_output');
        await expect(audio).toBeVisible();
        await expect(audio).toHaveAttribute('src', /^blob:/);
    });

    test('should handle invalid text', async () => {
        // Reset state
        await page.locator('#clear_button').click();

        const textArea = page.locator('#ron_text');
        await textArea.fill('Temporary text to clear');
        const clearButton = page.locator('#clear_button');
        await expect(clearButton).toBeEnabled();
        await clearButton.click();
        await expect(textArea).toBeEmpty();

        const longWord = 'a'.repeat(51);
        await textArea.fill(longWord);

        const statusReport = page.locator('#status_report');
        await expect(statusReport).toContainText('shorter than 50 letters');

        const processButton = page.locator('#process_text_button');
        await expect(processButton).toBeDisabled();
    });

    test('should halt processing', async () => {
        // Reset state
        await page.locator('#clear_button').click();

        const textArea = page.locator('#ron_text');
        await textArea.fill('A very long text that takes some time to process.'.repeat(5));

        await page.locator('#process_text_button').click();

        const haltButton = page.locator('#halt_button');
        await expect(haltButton).toBeEnabled();
        await haltButton.click();

        await expect(page.locator('#status_report')).toHaveText('Please enter text to be read aloud.');
        await expect(haltButton).toBeDisabled();
    });
});
