// @ts-check
import { test, expect } from '@playwright/test';

test('Meesho CX Login', async ({ page }) => {

  // Go to meesho URL
  await page.goto('https://meesho.kapturecrm.com/employee/index.html');

  // Fill in the Username
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).type('testkap', {delay:100});

  // Click on the Next button
  await page.getByRole('button', { name: 'Next' }).click();

  await page.waitForTimeout(1000)

  // Fill the Password
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).type('Test@123', {delay:100});

  // Click on Login
  await page.getByRole('button', { name: 'Login' }).click();

});

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });
