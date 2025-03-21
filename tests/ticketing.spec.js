// @ts-check
import { test, expect } from '@playwright/test';
const { loadClientConfig } = require('../utils/configLoader');

const config = loadClientConfig('meesho');

test.describe('Ticketing Tests - Meesho', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test using config URL
    await page.goto(`${config.url}/employee/index.html`);
    await page.getByRole('textbox', { name: 'Username' }).type(config.username, { delay: 100 });
    await page.getByRole('button', { name: 'Next' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('textbox', { name: 'Password' }).type(config.password, { delay: 100 });
    await page.getByRole('button', { name: 'Login' }).click();
    // await expect(page).toHaveURL(`${config.url}/nui/`);
  });

  test('Search a ticket', async ({ page }) => {
    await page.goto(`${config.url}/nui/`);

    // Assuming a search input exists (adjust selector as needed)
    await page.getByRole('textbox', { name: 'Search' }).type('ticket123', { delay: 100 });
    await page.getByRole('button', { name: 'Search' }).click();

    // Assertion: Check if ticket is found (adjust selector based on your UI)
    await expect(page.locator('text=ticket123')).toBeVisible({ timeout: 5000 });
  });

  test('Create a ticket', async ({ page }) => {
    await page.goto(`${config.url}/nui/`); // Adjust to ticket creation page if different

    // Example ticket creation (adjust fields/selectors)
    await page.getByRole('button', { name: 'New Ticket' }).click();
    await page.getByRole('textbox', { name: 'Title' }).type('Test Ticket', { delay: 100 });
    await page.getByRole('textbox', { name: 'Description' }).type('This is a test', { delay: 100 });
    await page.getByRole('button', { name: 'Submit' }).click();

    // Assertion: Check success message
    await expect(page.locator('text=Ticket created successfully')).toBeVisible({ timeout: 5000 });
  });
});