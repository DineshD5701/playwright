// --------------Starts here ----------------------


// @ts-check
import { test, expect } from '@playwright/test';
const { loadClientConfig } = require('../utils/configLoader');

const config = loadClientConfig('meesho');

test.describe('Authentication Tests - Meesho', () => {
  test('Login success', async ({ page }) => {
    // Go to Meesho URL from config
    await page.goto(`${config.url}/employee/index.html`);

    // Fill in the Username
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).type(config.username, { delay: 100 });

    // Click on the Next button
    await page.getByRole('button', { name: 'Next' }).click();

    await page.waitForTimeout(1000); // Consider waitForLoadState if possible

    // Fill the Password
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).type(config.password, { delay: 100 });

    // Click on Login
    await page.getByRole('button', { name: 'Login' }).click();

    // Assertion: Check redirect to NUI using config URL
    await page.goto(`${config.url}/nui/`, { timeout: 10000 });
  });

 
});


































































// // @ts-check
// import { test, expect } from '@playwright/test';

// test('Meesho CX Login', async ({ page }) => {

//   // Go to meesho URL
//   await page.goto('https://meesho.kapturecrm.com/employee/index.html');

//   // Fill in the Username
//   await page.getByRole('textbox', { name: 'Username' }).click();
//   await page.getByRole('textbox', { name: 'Username' }).type('testkap', {delay:100});

//   // Click on the Next button
//   await page.getByRole('button', { name: 'Next' }).click();

//   await page.waitForTimeout(1000)

//   // Fill the Password
//   await page.getByRole('textbox', { name: 'Password' }).click();
//   await page.getByRole('textbox', { name: 'Password' }).type('Test@123', {delay:100});

//   // Click on Login
//   await page.getByRole('button', { name: 'Login' }).click();

// });

// test('Go to NUI and search a ticket', async ({ page }) => {
//   await page.goto('https://meesho.kapturecrm.com/nui/');

//   await page.pause()

// });
















