// @ts-nocheck
import { test, expect } from '@playwright/test';
const { loadClientConfig } = require('../utils/configLoader');

const config = loadClientConfig('meesho');


test('Meesho CX', async ({ page }) => {
  await test.step('Login', async () => {
    await page.goto(`${config.url}/employee/index.html`);

    // Fill the username
    await page.getByRole('textbox', { name: 'Username' }).type(config.username, { delay: 100 });
    await page.getByRole('button', { name: 'Next' }).click();

    // Fix: Wait properly for the password field
    await page.getByRole('textbox', { name: 'Password' }).waitFor();

    await page.getByRole('textbox', { name: 'Password' }).type(config.password, { delay: 100 });
    await page.getByRole('button', { name: 'Login' }).click();

  
  });

  await test.step('Search a ticket', async () => {
    await page.goto(`${config.url}/nui/`);

    // Click on the Unassigned button
    await page.getByRole('button', { name: 'Unassigned', exact: true }).click();
    await page.waitForTimeout(1000)

    // Click on the All Complete button
    await page.getByRole('button', { name: 'All Complete' }).click();
    await page.waitForTimeout(1000)

    // Click on the All Pending button
    await page.getByRole('button', { name: 'All Pending' }).click();
    await page.waitForTimeout(1000)

    // Click on the Created by me button
    await page.getByRole('button', { name: 'Created by me' }).click();
    await page.waitForTimeout(1000)

    // Click on the All Junk button
    await page.getByRole('button', { name: 'All Junk' }).click();
    await page.waitForTimeout(1000)

    // Click on the Completed by me button
    await page.getByRole('button', { name: 'Completed by me' }).click();
    await page.waitForTimeout(1000)

    // Click on the Assigned to me button
    await page.getByRole('button', { name: 'Assigned to me' }).click();
    await page.waitForTimeout(1000)

    // Search the Ticket ID
    const searchInput = page.getByRole('textbox', { name: 'Search' });
    await searchInput.waitFor();
    await searchInput.type('8742470952962', { delay: 50 });
    await searchInput.press("Enter");

    await page.waitForTimeout(500)
  });

  await test.step('Check Ticket Details', async () => {

    // Click on the Searched Ticket ID
    const checkbox = page.getByRole('checkbox', { name: 'D Dr Vrushali Dhanale' });
    await checkbox.waitFor();
    await checkbox.click();

    await page.waitForTimeout(500)

    // Click on the Order Timeline Button
    await page.getByRole('button', { name: 'Order Timeline' }).click();
    await page.waitForTimeout(500)

    // Click on the Return Exchange Button
    await page.getByRole('button', { name: 'Return Exchange', exact: true }).click();
    await page.waitForTimeout(500)

    // Click on the Back icon
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.waitForTimeout(500)

    // Click on the Customer Information Accordion
    await page.getByRole('button', { name: 'Customer Information' }).click();
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Customer Information' }).click();
    await page.waitForTimeout(200)

    // Click on the User Status Accordion
    await page.getByRole('button', { name: 'User Status' }).click();
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'User Status' }).click();
    await page.waitForTimeout(200)

    // Click on the Order Type Accordion
    await page.getByRole('button', { name: 'Order Type' }).click();
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Order Type' }).click();
    await page.waitForTimeout(200)

    // Click on the Outstanding Payments Accordion
    await page.getByRole('button', { name: 'Outstanding Payments' }).click();
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Outstanding Payments' }).click();
    await page.waitForTimeout(200)

    // Click on the Payment Timeline Accordion
    await page.getByRole('button', { name: 'Payment Timeline' }).click();
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Payment Timeline' }).click();
    await page.waitForTimeout(200)

    // Click on the Prepaid Transactions Accordion
    await page.getByRole('button', { name: 'Prepaid Transactions' }).click();
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Prepaid Transactions' }).click();
    await page.waitForTimeout(200)

    // Click on the Wallet Details Accordion
    await page.getByRole('button', { name: 'Wallet Details' }).click();
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Wallet Details' }).click();
    await page.waitForTimeout(200)

    // Click on the Bank Details Accordion
    await page.getByRole('button', { name: 'Bank Details' }).click();
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Bank Details' }).click();
    await page.waitForTimeout(200)

    // Click on the Activa Offers Accordion
    await page.getByRole('button', { name: 'Active Offers' }).click();
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Active Offers' }).click();
    await page.waitForTimeout(200)

    // Click on the Referral Details Accordion
    await page.getByRole('button', { name: 'Referral Details' }).click();
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'Referral Details' }).click();
    await page.waitForTimeout(200)

    // Click on the ODP Details Accordion
    await page.getByRole('button', { name: 'ODP Details' }).click();
    await page.waitForTimeout(200)
    await page.getByRole('button', { name: 'ODP Details' }).click();
    await page.waitForTimeout(200)

    // Orders tab
    await page.locator('#ticketdetailstab > .MuiTabs-root > .MuiTabs-scroller > .MuiTabs-flexContainer > button:nth-child(2)').click();
    await page.waitForTimeout(500)

    // Notes tab
    await page.locator('button:nth-child(3)').first().click();
    await page.waitForTimeout(500)

    // More Tickets tab
    await page.locator('button:nth-child(4)').first().click();
    await page.waitForTimeout(500)

    // History tab
    await page.locator('.MuiTabs-flexContainer > button:nth-child(5)').click();
    await page.waitForTimeout(500)

    // Event & Reminder tab
    await page.locator('button:nth-child(6)').click();
    await page.waitForTimeout(500)

    // Executed Escalation Rules tab
    await page.locator('button:nth-child(7)').click();
    await page.waitForTimeout(500)

    await page.pause()

  });
});