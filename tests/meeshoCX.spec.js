// // @ts-nocheck
// import { test, expect } from "@playwright/test";
// import * as fs from "fs";
// import * as path from "path";
// const { loadClientConfig } = require("../utils/configLoader");

// const config = loadClientConfig("meesho");

// test("Meesho CX", async ({ page }) => {
//   await test.step("Login", async () => {
//     await page.goto(`${config.url}/employee/index.html`);

//     // Fill the username
//     await page
//       .getByRole("textbox", { name: "Username" })
//       .type(config.username, { delay: 100 });
//     await page.getByRole("button", { name: "Next" }).click();

//     // Fix: Wait properly for the password field
//     await page.getByRole("textbox", { name: "Password" }).waitFor();

//     await page
//       .getByRole("textbox", { name: "Password" })
//       .type(config.password, { delay: 100 });
//     await page.getByRole("button", { name: "Login" }).click();
//   });

//   // --------------------------- Go to NUI and check the UI ---------------------------------------------->>>>

//   await test.step("Go to NUI", async () => {
//     await page.goto(`${config.url}/nui/`);

//     try {
//       // Wait for the element with a short timeout
//       const teaPopup = await page.waitForSelector("//li[text()='Tea']", {
//         timeout: 2000,
//       });
//       await teaPopup.click(); // or whatever action is needed
//       console.log("Tea popup was present and clicked.");
//     } catch (error) {
//       // Element not found or timeout reached
//       console.log("Tea popup did not appear. Continuing...");
//     }

//     // Click on the Unassigned button
//     await page.getByRole("button", { name: "Unassigned", exact: true }).click();
//     await page.waitForTimeout(1000);

//     // Click on the All Complete button
//     await page.getByRole("button", { name: "All Complete" }).click();
//     await page.waitForTimeout(1000);

//     // Click on the All Pending button
//     await page.getByRole("button", { name: "All Pending" }).click();
//     await page.waitForTimeout(1000);

//     // Click on the Created by me button
//     await page.getByRole("button", { name: "Created by me" }).click();
//     await page.waitForTimeout(1000);

//     // Click on the All Junk button
//     await page.getByRole("button", { name: "All Junk" }).click();
//     await page.waitForTimeout(1000);

//     // Click on the Completed by me button
//     await page.getByRole("button", { name: "Completed by me" }).click();
//     await page.waitForTimeout(1000);

//     // Click on the Assigned to me button
//     await page.getByRole("button", { name: "Assigned to me" }).click();
//     await page.waitForTimeout(1000);
//   });

//   // <<<<<<-----------------------------ADD the Ticket --------------------------------------------------------->>>

//   await test.step("Add Ticket", async () => {
//     // Click on the + icon
//     await page.locator("div").filter({ hasText: /^add$/ }).nth(2).click();
//     await page.waitForTimeout(1000);

//     // Click on the Add Ticket Button
//     await page.getByRole("menuitem", { name: "Add Ticket" }).click();
//     await page.waitForTimeout(1000);

//     // Click on the Search customer button
//     await page.getByRole("button", { name: "Search Customer" }).click();
//     await page.waitForTimeout(1000);

//     // Enter the Phone Number
//     await page.getByRole("textbox", { name: "Enter Phone Number" }).click();
//     await page
//       .getByRole("textbox", { name: "Enter Phone Number" })
//       .fill("9320297575");
//     await page.waitForTimeout(1000);

//     // Click on the Search and Attach Button
//     await page.getByRole("button", { name: "Search and Attach" }).click();
//     await page.waitForTimeout(1000);

//     // Click on the Dr Vrushali Dhanale customer and select
//     await page
//       .getByRole("gridcell", { name: "Dr Vrushali Dhanale" })
//       .locator("div")
//       .first()
//       .click();
//     await page.waitForTimeout(1000);
//     await page.getByRole("button", { name: "Select User" }).click();
//     await page.waitForTimeout(1000);

//     // Tag the Order
//     await page
//       .getByRole("checkbox", { name: "298810812423_1 Casual" })
//       .getByRole("button")
//       .click();
//     await page.waitForTimeout(2000);
//     await page
//       .getByRole("checkbox", { name: "298810812423_1 Casual" })
//       .getByRole("button")
//       .click();
//     await page.waitForTimeout(1000);

//     // Fill the Folder Levels
//     await page.getByRole("button", { name: "Cancelled" }).click();
//     await page.waitForTimeout(2000);
//     await page.getByRole("button", { name: "Bank_Details" }).click();
//     await page.waitForTimeout(2000);
//     await page
//       .getByRole("button", {
//         name: "Unable_to_Update_Bank_Details_Limit_Breached",
//       })
//       .click();
//     await page.waitForTimeout(2000);
//     await page.getByRole("textbox", { name: "Assigned To" }).click();
//     await page.waitForTimeout(2000);

//     // Select the Queue and Assign it to Meesho Super Admin
//     await page.getByRole("textbox", { name: "Assigned To" }).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole("button", { name: "Clear", exact: true }).click();
//     await page.waitForTimeout(1000);
//     await page
//       .getByRole("textbox", { name: "Assigned To" })
//       .fill("Margin & COD Refund (CX)");
//     await page.waitForTimeout(1000);
//     await page
//       .getByRole("option", { name: "Margin & COD Refund (CX)" })
//       .click();
//     await page.waitForTimeout(1000);
//     await page.getByRole("textbox", { name: "Assign To" }).click();
//     await page.waitForTimeout(1000);
//     await page.getByRole("option", { name: "Meesho Super Admin" }).click();
//     await page.waitForTimeout(1000);

//     // Click on the Submit button
//     await page.locator("//button[@title='Submit']").click();
//     await page.waitForTimeout(3000);

//     // await page.pause();
//   });

//   await test.step("Fetching and storing the ticket", async () => {
//     // Extract new ticket ID from UI
//     const ticketIdMCX = await page
//       .locator('//*[@id="Ticket ID"]/span/div')
//       .textContent();
//     const trimmedTicketId = ticketIdMCX?.trim() || "";

//     // Define file path
//     const filePath = path.resolve(
//       __dirname,
//       "D:\\Baldeep\\Meesho plw\\test-data\\testData.json"
//     );

//     // Read existing data
//     let existingData = {};
//     if (fs.existsSync(filePath)) {
//       const raw = fs.readFileSync(filePath, "utf-8");
//       existingData = JSON.parse(raw);
//     }

//     // Update only ticketId
//     const updatedData = {
//       ...existingData,
//       meesho: {
//         ...(existingData["meesho"] || {}),
//         ticketIdMCX: trimmedTicketId,
//       },
//     };

//     // Save it back to JSON
//     fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));

//     console.log(`🎫 ticketId "${trimmedTicketId}" saved to testData.json`);
//   });

//   //<<<<-------------------------------------Check Ticket Details ------------------------------------------>>>>>>>>>>

//   await test.step("Check Ticket Details", async () => {
//     //  // Step 1: Read the ticket ID from the JSON file
//     //   const filePath = path.resolve(__dirname, 'D:\\Baldeep\\Meesho plw\\test-data\\testData.json');
//     //   const rawData = fs.readFileSync(filePath);
//     //   const jsonData = JSON.parse(rawData);

//     //   const ticketId = jsonData?.meesho?.ticketIdMCX;

//     //   if (!ticketId) {
//     //     throw new Error("Ticket ID for meesho is missing in testData.json");
//     //   }

//     //   // Step 2: Search the Ticket ID in UI
//     //   const searchInput = page.getByRole('textbox', { name: 'Search' });
//     //   await searchInput.waitFor();
//     //   await searchInput.type(ticketId, { delay: 50 });
//     //   await searchInput.press("Enter");
//     //   await page.getByRole('button', { name: 'Search', exact: true }).click();
//     //   await page.waitForTimeout(800)
//     //   await page.getByRole('checkbox', { name: 'D Dr Vrushali Dhanale' }).click();
//     //     // await page.waitForTimeout(500)

//     // Click on the Order Timeline Button
//     await page.getByRole("button", { name: "Order Timeline" }).click();
//     await page.waitForTimeout(500);

//     // Click on the Return Exchange Button
//     await page
//       .getByRole("button", { name: "Return Exchange", exact: true })
//       .click();
//     await page.waitForTimeout(500);

//     // Click on the Back icon
//     await page.getByRole("button", { name: "Back", exact: true }).click();
//     await page.waitForTimeout(500);

//     // Click on the Customer Information Accordion
//     await page.getByRole("button", { name: "Customer Information" }).click();
//     await page.waitForTimeout(200);
//     await page.getByRole("button", { name: "Customer Information" }).click();
//     await page.waitForTimeout(200);

//     // Click on the User Status Accordion
//     await page.getByRole("button", { name: "User Status" }).click();
//     await page.waitForTimeout(200);
//     await page.getByRole("button", { name: "User Status" }).click();
//     await page.waitForTimeout(200);

//     // Click on the Order Type Accordion
//     await page.getByRole("button", { name: "Order Type" }).click();
//     await page.waitForTimeout(200);
//     await page.getByRole("button", { name: "Order Type" }).click();
//     await page.waitForTimeout(200);

//     // Click on the Outstanding Payments Accordion
//     await page.getByRole("button", { name: "Outstanding Payments" }).click();
//     await page.waitForTimeout(200);
//     await page.getByRole("button", { name: "Outstanding Payments" }).click();
//     await page.waitForTimeout(200);

//     // Click on the Payment Timeline Accordion
//     await page.getByRole("button", { name: "Payment Timeline" }).click();
//     await page.waitForTimeout(200);
//     await page.getByRole("button", { name: "Payment Timeline" }).click();
//     await page.waitForTimeout(200);

//     // Click on the Prepaid Transactions Accordion
//     await page.getByRole("button", { name: "Prepaid Transactions" }).click();
//     await page.waitForTimeout(200);
//     await page.getByRole("button", { name: "Prepaid Transactions" }).click();
//     await page.waitForTimeout(200);

//     // Click on the Wallet Details Accordion
//     await page.getByRole("button", { name: "Wallet Details" }).click();
//     await page.waitForTimeout(200);
//     await page.getByRole("button", { name: "Wallet Details" }).click();
//     await page.waitForTimeout(200);

//     // Click on the Bank Details Accordion
//     await page.getByRole("button", { name: "Bank Details" }).click();
//     await page.waitForTimeout(200);
//     await page.getByRole("button", { name: "Bank Details" }).click();
//     await page.waitForTimeout(200);

//     // Click on the Activa Offers Accordion
//     await page.getByRole("button", { name: "Active Offers" }).click();
//     await page.waitForTimeout(200);
//     await page.getByRole("button", { name: "Active Offers" }).click();
//     await page.waitForTimeout(200);

//     // Click on the Referral Details Accordion
//     await page.getByRole("button", { name: "Referral Details" }).click();
//     await page.waitForTimeout(200);
//     await page.getByRole("button", { name: "Referral Details" }).click();
//     await page.waitForTimeout(200);

//     // // Click on the ODP Details Accordion
//     // await page.getByRole('button', { name: 'ODP Details' }).click();
//     // await page.waitForTimeout(200)
//     // await page.getByRole('button', { name: 'ODP Details' }).click();
//     // await page.waitForTimeout(200)

//     // Orders tab
//     await page
//       .locator(
//         "#ticketdetailstab > .MuiTabs-root > .MuiTabs-scroller > .MuiTabs-flexContainer > button:nth-child(2)"
//       )
//       .click();
//     await page.waitForTimeout(500);

//     // Notes tab
//     await page.locator("button:nth-child(3)").first().click();
//     await page.waitForTimeout(500);

//     // More Tickets tab
//     await page.locator("button:nth-child(4)").first().click();
//     await page.waitForTimeout(500);

//     // History tab
//     await page.locator(".MuiTabs-flexContainer > button:nth-child(5)").click();
//     await page.waitForTimeout(500);

//     // Event & Reminder tab
//     await page.locator("button:nth-child(6)").click();
//     await page.waitForTimeout(500);

//     // Executed Escalation Rules tab
//     await page.locator("button:nth-child(7)").click();
//     await page.waitForTimeout(500);

//     // await page.pause()
//   });

//   //<<<<<<<---------------------------------------Order Details Page ----------------------------------->>>>>>>>>

//   await test.step("Order Details page", async () => {
//     // Click on Ticket Details tab
//     await page
//       .locator(
//         "#ticketdetailstab > .MuiTabs-root > .MuiTabs-scroller > .MuiTabs-flexContainer > button"
//       )
//       .first()
//       .click();
//     await page.waitForTimeout(1000);
//     await page.waitForTimeout(500);

//     // Click on the View Orders Button (Right Corner)
//     await page.locator("//button[@title='View Orders']").click();
//     await page.waitForTimeout(1000);

//     // Click on the Untag Order Button
//     await page.getByRole("button", { name: "Untag Order" }).click();
//     await page.waitForTimeout(8000);

//     // Click on the Tag Order Button
//     await page
//       .getByRole("checkbox", { name: "458643691034_1 Raghaw Women's" })
//       .getByRole("button")
//       .first()
//       .click();
//     await page.waitForTimeout(8000);

//     // Click on Back Arrow Button
//     await page.getByRole("button").filter({ hasText: "arrow_back" }).click();
//     await page.waitForTimeout(1000);

//     // await page.pause
//   });

//   // <<<<<<<-----------------------------------------Web Viewer--------------------------------------------->>>>>>

//   await test.step("Web Viewer", async () => {
//     // Click on Web Viewer Button (Right Corner)
//     await page.locator("//button[@title='Web Viewer']").click();
//     await page.waitForTimeout(500);

//     // Click on the Refresh icon
//     await page.getByRole("button").filter({ hasText: "refresh" });
//     await page.waitForTimeout(1000);

//     // Click on Back Arrow Button
//     await page
//       .locator("header")
//       .filter({ hasText: "arrow_backWeb Viewerrefresh" })
//       .getByLabel("Back");
//     await page.waitForTimeout(1000);

//     // await page.pause
//   });

//   //<<<<<-----------------------------------------Product Search---------------------------------------->>>>

//   await test.step("Product Search", async () => {
//     // Click on Product Search Button (Right Corner)
//     await page.locator("//button[@title='Product Search']").click();
//     await page.waitForTimeout(500);

//     // Click on the Text Button
//     await page.getByText("116840453Product Id");
//     await page.waitForTimeout(1000);

//     // Fill the text
//     await page.getByRole("textbox").fill("116840452");
//     await page.waitForTimeout(1000);

//     // Click on the search Button
//     await page.getByRole("img", { name: "img" }).click();
//     await page.waitForTimeout(1000);

//     // await page.pause
//   });

//   //<<<<<-----------------------------------------------Invoice------------------------------------------------>>>>

//   await test.step("Invoice", async () => {
//     // Click on Invoice Button (Right Corner)
//     await page.locator("//button[@title='Product Search']").click();
//     await page.waitForTimeout(500);

//     // Click on the Back Arrow Button
//     await page.getByRole("button", { name: "Back", exact: true }).click();
//     await page.waitForTimeout(1000);

//     // await page.pause
//   });

//   //<<<<<<---------------------------------------------Notes Tab----------------------------------------------->>>>>>

//   await test.step("Notes Tab", async () => {
//     // Click on the Notes tab
//     await page.locator("button:nth-child(3)").first().click();
//     await page.waitForTimeout(500);

//     // Make a note and press the enter button
//     await page
//       .locator(
//         "//div[@role='textbox' and @aria-label='Editor editing area: main']"
//       )
//       .type("Test QA", { delay: 50 });
//     await page.waitForTimeout(1000);
//     await page.locator("//button[@title='Saved Note']").click();
//     await page.waitForTimeout(1000);

//     // await page.pause
//   });

//   //<<<<---------------------------------------------Junk the Ticket-------------------------------------->>>>>>

//   await test.step("Junk the Ticket", async () => {
//     // Click on the Details tab
//     await page
//       .locator("#ticketdetailstab")
//       .getByRole("tab")
//       .filter({ hasText: /^$/ })
//       .first()
//       .click();
//     await page.waitForTimeout(2000);

//     // Click on the Status accordion (Pending)
//     await page
//       .locator("#Status")
//       .getByRole("button", { name: "Pending" })
//       .click();
//     await page.waitForTimeout(1000);

//     // Select the Junk
//     await page.getByRole("menuitem", { name: "Junk" }).click();
//     await page.waitForTimeout(1000);

//     // Fill the remarks and submit
//     await page.getByRole("textbox", { name: "Remarks" }).click();
//     await page.waitForTimeout(500);
//     await page
//       .getByRole("textbox", { name: "Remarks" })
//       .type("Test QA", { delay: 100 });
//     await page.waitForTimeout(500);
//     await page.getByRole("button", { name: "Submit" }).click();
//     await page.waitForTimeout(2000);

//     await page.pause;
//   });

//   //<<<<<<--------------------------------------Unjunk the Ticket------------------------------------------->>>>>>>

//   await test.step("UnJunk the Ticket", async () => {
//     // Step 1: Read the ticket ID from the JSON file
//     const filePath = path.resolve(
//       __dirname,
//       "D:\\Baldeep\\Meesho plw\\test-data\\testData.json"
//     );
//     const rawData = fs.readFileSync(filePath);
//     const jsonData = JSON.parse(rawData);

//     const ticketId = jsonData?.meesho?.ticketIdMCX;

//     if (!ticketId) {
//       throw new Error("Ticket ID for meesho is missing in testData.json");
//     }

//     // Step 2: Search the Ticket ID in UI
//     const searchInput = page.getByRole("textbox", { name: "Search" });
//     await searchInput.waitFor();
//     await searchInput.type(ticketId, { delay: 50 });
//     await searchInput.press("Enter");
//     await page.getByRole("button", { name: "Search", exact: true }).click();
//     await page.waitForTimeout(800);
//     await page.getByRole("checkbox", { name: "D Dr Vrushali Dhanale" }).click();
//     // await page.waitForTimeout(500)

//     // Now Unjunk the Ticket
//     await page.getByRole("button", { name: "Junk" }).click();
//     await page.getByRole("menuitem", { name: "Unjunk" }).click();
//     await page.waitForTimeout(500);

//     // await page.pause
//   });

//   //<<<<<---------------------------------------Dispose the Ticket--------------------------------------->>>>>>>

//   await test.step("Dispose the Ticket", async () => {
//     //Clear the search bar
//     await page.getByRole("button", { name: "Cancel" }).click();

//     // Step 1: Read the ticket ID from the JSON file
//     const filePath = path.resolve(
//       __dirname,
//       "D:\\Baldeep\\Meesho plw\\test-data\\testData.json"
//     );
//     const rawData = fs.readFileSync(filePath);
//     const jsonData = JSON.parse(rawData);

//     const ticketId = jsonData?.meesho?.ticketIdMCX;

//     if (!ticketId) {
//       throw new Error("Ticket ID for meesho is missing in testData.json");
//     }

//     // Step 2: Search the Ticket ID in UI
//     const searchInput = page.getByRole("textbox", { name: "Search" });
//     await searchInput.waitFor();
//     await searchInput.type(ticketId, { delay: 50 });
//     await searchInput.press("Enter");
//     await page.getByRole("button", { name: "Search", exact: true }).click();
//     await page.waitForTimeout(800);
//     await page.getByRole("checkbox", { name: "D Dr Vrushali Dhanale" }).click();
//     // await page.waitForTimeout(500)

//     // Click on the Dispose button
//     await page.locator("#ticketdetailstab").getByRole("button").click();
//     await page.waitForTimeout(500);

//     //Select the Queue
//     await page.getByRole("textbox", { name: "Select Queue" }).click();
//     await page.getByText("Margin & COD Refund (CX)").click();
//     await page.waitForTimeout(600);

//     //  //Select the Assign to
//     await page.getByRole("textbox", { name: "Assign To" }).click();
//     await page.getByText("Meesho Super Admin").click();
//     await page.waitForTimeout(500);

//     // Fill remarks
//     await page.getByRole("textbox", { name: "Add remark" }).click();
//     await page
//       .getByRole("textbox", { name: "Add remark" })
//       .press("ControlOrMeta+a");
//     await page.getByRole("textbox", { name: "Add remark" }).fill("Test QA");
//     await page.waitForTimeout(500);

//     // Select Disposition Type as Resolved
//     await page.getByRole("textbox", { name: "Disposition Type" }).click();
//     await page.getByRole("option", { name: "Resolved" }).click();
//     await page.waitForTimeout(1500);

//     // Press the Submit button
//     await page.getByRole("button", { name: "Dispose this ticket" }).click();
//     await page.waitForTimeout(2000);

//     // await page.pause()
//   });
// });
