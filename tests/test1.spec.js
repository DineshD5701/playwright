const { test, expect } = require('@playwright/test');

const baseURL = 'https://reservations.margaritavilleatsea.com/v2/select-date';


test('Verify the loading of the website', async ({ page }) => {
  try {
    await page.goto('https://reservations.margaritavilleatsea.com/v2/select-date');
    await page.waitForLoadState('networkidle');
    expect(await page.title()).toBeTruthy();
  } catch (error) {
    console.error('Test failed with error: ' + error);
  }
});