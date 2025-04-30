import BaseClass from "../Generic/BaseClass";
// const { test, expect } = require("@playwright/test");
const testdata = require("../Generic/TestData.json");
import ElementClass from "../Generic/ElemenetClass";
import { test } from "@playwright/test";
test.setTimeout(60000); // Set timeout to 60 seconds

import {
  notesTabButton,
  notesTextArea,
  notesSaveButton,
  historyTab,
  infoTab,
  moreTicketsTabFirstTicket,
  moreTicketTabButton,
  messageTextBox,
  ordersTabButton,
  sideConversationToTextBox,
  sideConversationButton,
  quickActionsButton,
  subjectTextBox,
} from "../PageElements/TicketDetailspageElements";

class TicketDetailsPage {
  constructor(page) {
    this.page = page;
    this.elementClass = new ElementClass(page);
    this.messageTextBox = page.locator("//textarea[@name='message']");
    this.ordersTabButton = page.locator('//button[@data-tabkeys="ORDERS"]');
    this.notesTabButton = page.locator('//button[@data-tabkeys="NOTES"]');
    this.notesTextArea = page.locator(
      "//div[@aria-label='Editor editing area: main']"
    );
    this.notesSaveButton = page.locator("//span[text()='send']");
    this.warningMessageCloserButton = page.locator("//span[text()='close']");
    this.moreTicketTabButton = page.locator(
      '//button[@datatracking="PAST_TICKET"]'
    );
    this.moreTicketsTabFirstTicket = page.locator(
      '(//div[@component="[object Object]"])[1]'
    );
    this.infoTab = page.locator('//button[@data-tabkeys="ADDITIONAL_INFO"]');
    this.historyTab = page.locator('//button[@data-tabkeys="HISTORY"]');
    this.disposeButton = page.locator('//button[@title="Dispose ticket"]');
    this.disposeRemarkTextBox = page.locator(
      '//textarea[@placeholder="Add remark"]'
    );
    this.refundDiniedAccordion = page.locator(
      "//div[@class='MuiButtonBase-root MuiAccordionSummary-root' and @role='button'][.//p[contains(text(), 'Refund Denied')]]"
    );
    this.productDetailsAccordion = page.locator(
      '(//div[@class="MuiButtonBase-root MuiAccordionSummary-root"])[4]'
    );
    this.refunDataAccordion = page.locator(
      '(//div[@class="MuiButtonBase-root MuiAccordionSummary-root"])[5]'
    );
    this.disposeSubmitButton = page.locator(
      '//button[@aria-label="Dispose this ticket"]'
    );
    this.viewOrderButton = page.locator('//button[@title="View Orders"]');
    this.InTheViewOrderFirstOrder = page.locator(
      '(//button[@class="MuiButtonBase-root MuiCardActionArea-root"])[1]'
    );
    this.quickActionsBuuton = page.locator(
      '//span[@class="MuiSpeedDialIcon-root"]'
    );
    this.composeEmailButton = page.locator(
      '//span[@id="TicketQuickActions-action-0"]'
    );
    this.sideConversationButton = page.locator(
      '//span[@id="TicketQuickActions-action-1"]'
    );
    this.sideConversationToTextBox = page.locator(
      '//input[@placeholder="Add more emails..."]'
    );
    this.bodyTextBox = page.locator(
      "//body[contains(@class, 'ephox-candy-mountain') and contains(@class, 'ephox-candy-mountain-active')]"
    );
    this.sendButton = page.locator("//span[text()='Send']");
    this.subjectTextBox = page.locator('//input[@aria-label="Email Subject"]');

    this.bodyTextBoxFrame = page.locator(
      '//iframe[@class="ephox-hare-content-iframe"]'
    );
    this.attachFileButton = page.locator('//div[@class="py-16"]');
  }

  // To send messages
  async doMessageSend() {
    await this.page.waitForTimeout(2000);
    //await this.messageTextBox.fill("Test from QA");
    await this.elementClass.waitAndFill(messageTextBox, "Test from QA");
    await this.page.waitForTimeout(2000);
    // await this.messageTextBox.press("Enter", { timeout: 60000 }); // Increase timeout to 60 seconds if necessary
    await this.elementClass.keyPress(messageTextBox, "Enter");
    console.log("pressed enter key");
    await this.page.waitForTimeout(2000);
  }

  // To Test orders Tab
  async doOrdersTabTest() {
    // await this.ordersTabButton.click();
    await this.elementClass.waitAndClick(ordersTabButton);
  }

  // To Test Notes
  async doNotesTest() {
    console.log("waiting for 2 sec");
    await this.page.waitForTimeout(2000);

    //await this.notesTabButton.click();

    await this.elementClass.waitAndClick(notesTabButton);
    console.log("notesTabButton is clicked");
    // await this.page.locator("#client-snackbar").getByText("close").click();
    // await this.notesTextArea.fill("Notes Testing From QA");

    await this.elementClass.waitAndFill(notesTextArea, "1test");
    console.log("notesTextArea is clicked");

    // Optional: Debug presence of the save button
    // const isButtonPresent = await notesSaveButton.count();
    // console.log(`Is Save button present? ${isButtonPresent > 0}`);

    // Increase timeout if needed
    // await notesSaveButton.waitFor({ state: "visible", timeout: 60000 });
    // await this.notesSaveButton.click();
    await this.elementClass.waitAndClick(notesSaveButton);
    await this.page.waitForTimeout(2000);
  }

  // More tickets test
  async doMoreTicketsTab() {
    // await this.moreTicketTabButton.click();
    await this.elementClass.waitAndClick(moreTicketTabButton);
    // await this.moreTicketsTabFirstTicket.click();
    await this.elementClass.waitAndClick(moreTicketsTabFirstTicket);
  }
  //info tab test
  async doinfotab() {
    //await this.infoTab.click();
    await this.elementClass.waitAndClick(infoTab);
  }

  // History tab test
  async doHistory() {
    const fs = require("fs");

    // 1. Read the existing JSON file
    const filePath = "C:/Playwrite - Copy/Generic/TestData.json";
    const rawData = fs.readFileSync(filePath);
    const jsonData = JSON.parse(rawData);

    // 2. Extract the value from the locator
    const ticketID1 = await this.page
      .locator('//a[@title="Go to old ticket page"]')
      .textContent();

    // 3. Update the specific field
    jsonData.BigbasketTicketID1 = ticketID1.trim();

    // 4. Write the updated content back to the file
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

    console.log("Updated data saved in TestData.json:", jsonData);

    const value = await this.page
      .locator('//a[@title="Go to old ticket page"]')
      .textContent();
    console.log("Text content:", value);
    // await this.historyTab.click();
    await this.elementClass.waitAndClick(historyTab);
  }

  // // Perform actions on the page and handle navigation
  // async doDispose() {
  //   await page.getByPlaceholder("Add remark").click();
  //   await page.getByPlaceholder("Add remark").fill("test");
  //   await page.getByRole("button", { name: "Chat Source" }).click();
  //   await page.getByRole("button", { name: "Refund CheckList" }).click();
  //   await page.getByRole("button", { name: "Ticket Field" }).click();
  //   await page.getByRole("button", { name: "Product Details*" }).click();
  //   await page.getByRole("button", { name: "Refund Data*" }).click();
  //   //   try {
  //     console.log("Clicking the dispose button...");

  //     // Click the dispose button and wait for navigation or page reload
  //     await Promise.all([
  //       this.disposeButton.click(),
  //       this.page.waitForLoadState("domcontentloaded", { timeout: 30000 }), // Wait for page load
  //     ]);

  //     console.log("Dispose button clicked, waiting for elements...");

  //     // Wait for the dispose remark textbox to appear
  //     await this.waitForElement(this.disposeRemarkTextBox);

  //     console.log("Filling the dispose remark textbox...");
  //     await this.disposeRemarkTextBox.fill("Dispose test from QA");

  //     // Scroll to the Refund Denied Accordion and interact with it
  //     await this.scrollAndClick(this.refundDiniedAccordion);
  //   } catch (error) {
  //     console.error("Error in doDispose:", error.message);

  //     // If the page is closed, throw a specific error
  //     if (!this.page || this.page.isClosed()) {
  //       throw new Error("The page was closed unexpectedly.");
  //     }

  //     // Capture a screenshot for debugging
  //     await this.page.screenshot({
  //       path: `error-screenshot-${Date.now()}.png`,
  //     });

  //     throw error;
  //   }
  // }

  // // Scroll to an element and click it
  // async scrollAndClick(element) {
  //   try {
  //     console.log("Scrolling to the element...");
  //     await element.scrollIntoViewIfNeeded({ timeout: 10000 });

  //     if (await element.isVisible()) {
  //       console.log("Element is visible, clicking now...");
  //       await element.click();
  //     } else {
  //       throw new Error("Element is not visible after scrolling.");
  //     }
  //   } catch (error) {
  //     console.error("Error during scrollAndClick:", error.message);
  //     throw error;
  //   }
  // }

  // // Wait for an element with a fallback retry mechanism
  // async waitForElement(element, timeout = 15000) {
  //   try {
  //     console.log("Waiting for element to become visible...");
  //     await element.waitFor({ state: "visible", timeout });
  //   } catch (error) {
  //     console.error(`Error waiting for element: ${error.message}`);
  //     throw new Error("Element not found or not visible within timeout.");
  //   }
  // }

  // //Dispose task test
  // async doDispose() {
  //   if (!this.page || this.page.isClosed()) {
  //     throw new Error("Target page is already closed!");
  //   }

  //   // Click the dispose button
  //   await this.disposeButton.click();
  //   console.log("Disposed button clicked successfully.");

  //   // Wait for the text box to become visible
  //   await this.disposeRemarkTextBox.waitFor({
  //     state: "visible",
  //     timeout: 15000,
  //   });

  //   // Ensure the element is interactable
  //   if (await this.disposeRemarkTextBox.isVisible()) {
  //     console.log("Dispose Remark TextBox is visible.");
  //     await this.disposeRemarkTextBox.fill("Dispose test from QA");
  //   } else {
  //     throw new Error(
  //       "Dispose Remark TextBox is not visible after clicking dispose button."
  //     );
  //   }
  //   if (!this.page) {
  //     throw new Error("Page is not initialized or has been closed.");
  //   }
  //   // Wait for the accordion to be visible
  //   await this.refundDiniedAccordion.waitFor({
  //     state: "attached",
  //     timeout: 5000,
  //   });

  //   // Scroll to the accordion element
  //   await this.refundDiniedAccordion.scrollIntoViewIfNeeded();

  //   // Verify visibility and then click
  //   if (await this.refundDiniedAccordion.isVisible()) {
  //     console.log("Accordion is visible, clicking now...");
  //     await this.refundDiniedAccordion.click();
  //   } else {
  //     throw new Error("Accordion is not visible after scrolling.");
  //   }
  // }

  // // Wait for the accordion to be visible
  // await this.refundDiniedAccordion.waitFor({
  //   state: "visible",
  //   timeout: 5000,
  // });

  // // Scroll to the accordion element
  // await this.refundDiniedAccordion.scrollIntoViewIfNeeded();

  // // Verify visibility and then click
  // if (await this.refundDiniedAccordion.isVisible()) {
  //   console.log("Accordion is visible, clicking now...");
  //   await this.refundDiniedAccordion.click();
  // } else {
  //   throw new Error("Accordion is not visible after scrolling.");
  // }

  // // Wait for the accordion to be visible
  // await this.productDetailsAccordion.waitFor({
  //   state: "visible",
  //   timeout: 5000,
  // });

  // // Scroll to the accordion element
  // await this.productDetailsAccordion.scrollIntoViewIfNeeded();

  // // Verify visibility and then click
  // if (await this.productDetailsAccordion.isVisible()) {
  //   console.log("Accordion is visible, clicking now...");
  //   await this.productDetailsAccordion.click();
  // } else {
  //   throw new Error("Accordion is not visible after scrolling.");
  // }
  // console.log("Disposed remark is filled");
  // await this.disposeRemarkTextBox.fill("Dispose test from QA");
  // // Check if the refund accordion exists
  // const accordionCount = await this.disposeSubmitButton.count();
  // if (accordionCount === 0) {
  //   throw new Error("Refund Denied accordion not found.");
  // }
  // await this.disposeSubmitButton.scrollIntoViewIfNeeded();
  // await this.disposeSubmitButton.click();

  // // Check if the refund accordion exists
  // const accordionCount = await this.refundDiniedAccordion.count();
  // if (accordionCount === 0) {
  //   throw new Error("Refund Denied accordion not found.");
  // }

  // // Scroll to the accordion and interact with it
  // await this.refundDiniedAccordion.scrollIntoViewIfNeeded();
  // if (await this.refundDiniedAccordion.isVisible()) {
  //   console.log("Refund Denied accordion is visible");
  // } else {
  //   throw new Error(
  //     "Refund Denied accordion is not visible after scrolling."
  //   );
  // }
  // // Scroll to the element
  // await this.refundDiniedAccordion.scrollIntoViewIfNeeded();
  // if (await this.refundDiniedAccordion.isVisible()) {
  //   await this.refundDiniedAccordion.scrollIntoViewIfNeeded();
  //   console.log("Disposed refundDiniedAccordion is visible");
  // } else {
  //   throw new Error("Refund Denied Accordion is not visible.");
  // }
  // await this.refundDiniedAccordion.click();
  // if (await this.productDetailsAccordion.isVisible()) {
  //   await this.productDetailsAccordion.scrollIntoViewIfNeeded();
  //   console.log("Disposed refundDiniedAccordion is visible");
  // } else {
  //   throw new Error("Refund Denied Accordion is not visible.");
  // }
  // async doDispose() {
  //   try {
  //     if (!this.page || this.page.isClosed()) {
  //       throw new Error(
  //         "Page is already closed before interacting with locators."
  //       );
  //     }

  //     await this.disposeButton.click();
  //     console.log("Dispose button clicked successfully.");
  //     await this.page.pause();
  //     await this.page.waitForLoadState("domcontentloaded"); // Ensure the page stabilizes

  //     // Wait for the element to become visible
  //     await this.disposeRemarkTextBox.waitFor({
  //       state: "visible",
  //       timeout: 15000,
  //     });
  //     console.log("Dispose Remark TextBox is visible.");
  //   } catch (error) {
  //     if (this.page && this.page.isClosed()) {
  //       console.error("Page was closed unexpectedly:", error.message);
  //     } else {
  //       console.error("An unexpected error occurred:", error.message);
  //     }
  //     throw error; // Rethrow the error after logging
  //   }
  // }
  // Assuming you already have access to the 'page' object
  // async doDispose() {
  //   try {
  //     // Wait for the "Dispose ticket" button to be clickable and click it
  //     const disposeButton = await this.page.locator(
  //       '//button[@title="Dispose ticket"]'
  //     );
  //     await disposeButton.waitFor({ state: "visible" });
  //     await disposeButton.click();

  //     // If you have additional steps after clicking the dispose button, add them here
  //     // For example, you could fill in a remark or interact with other elements
  //     await this.page.getByPlaceholder("Add remark").click();
  //     await this.page.getByPlaceholder("Add remark").fill("test");
  //     await this.page.getByRole("button", { name: "Chat Source" }).click();
  //     await this.page.getByRole("button", { name: "Refund CheckList" }).click();
  //     await this.page.getByRole("button", { name: "Ticket Field" }).click();
  //     await this.page.getByRole("button", { name: "Product Details*" }).click();
  //     await this.page.getByRole("button", { name: "Refund Data*" }).click();
  //   } catch (error) {
  //     console.error("Error in doDispose: ", error);
  //     // Optionally, take a screenshot for debugging
  //     await this.page.screenshot({ path: "error-screenshot.png" });
  //     throw new Error("The page was closed unexpectedly.");
  //   }
  // }
  // async doDispose() {
  //   try {
  //     // Wait for and click the dispose button
  //     await this._clickElement(this.disposeButton, "Dispose ticket button");

  //     // Fill the dispose remark
  //     await this._fillElement(
  //       this.disposeRemarkTextBox,
  //       "Dispose test from QA"
  //     );

  //     // Interact with related buttons
  //     await this._clickElement(
  //       this.refundDiniedAccordion,
  //       "Refund Denied accordion"
  //     );
  //     await this._clickElement(
  //       this.productDetailsAccordion,
  //       "Product Details accordion"
  //     );

  //     // Submit the dispose action
  //     await this._clickElement(
  //       this.disposeSubmitButton,
  //       "Dispose Submit button"
  //     );
  //   } catch (error) {
  //     console.error("Error in doDispose:", error.message);
  //     throw error;
  //   }
  // }

  // // Helper method to click an element
  // async _clickElement(element, elementName) {
  //   await element.waitFor({ state: "visible" });
  //   console.log(`Clicking on ${elementName}`);
  //   await element.click();
  // }

  // // Helper method to fill an input element
  // async _fillElement(element, value) {
  //   await element.waitFor({ state: "visible" });
  //   console.log(`Filling input element with value: ${value}`);
  //   await element.fill(value);
  // }

  // //view order test
  // async doViewOrder() {
  //   await this.viewOrderButton.click();
  //   await this.InTheViewOrderFirstOrder.click();
  // }

  // async doSideConversation() {
  //   try {
  //     // Ensure the page is not closed
  //     if (!this.page || this.page.isClosed()) {
  //       throw new Error("Page or browser is already closed.");
  //     }

  //     // Click the Quick Actions button
  //     await this.quickActionsBuuton.click();
  //     console.log("Quick Actions button clicked.");

  //     // Click the Side Conversation button
  //     await this.sideConversationButton.click();
  //     console.log("Side Conversation button clicked.");

  //     // Wait for the text box to become visible
  //     await this.sideConversationToTextBox.waitFor({
  //       state: "visible",
  //       timeout: 15000,
  //     });
  //     console.log("Side Conversation To TextBox is visible.");

  //     // Fill the text box with email addresses
  //     await this.sideConversationToTextBox.fill(
  //       "shankar.lamani@kapturecrm.com,vipul.jha@kapturecrm.com"
  //     );

  //     // Press "Enter" in the text box
  //     await this.sideConversationToTextBox.press("Enter", { timeout: 60000 });
  //     console.log("Emails entered successfully.");
  //   } catch (error) {
  //     if (this.page && this.page.isClosed()) {
  //       console.error("Page was closed unexpectedly.");
  //     }
  //     console.error("Error during side conversation:", error.message);
  //     throw error;
  //   }
  // }
  // async doDispose() {
  //   try {
  //     // Check if the page is open
  //     if (!this.page || this.page.isClosed()) {
  //       throw new Error("Target page is already closed!");
  //     }

  //     // Wait for the "Dispose ticket" button to be clickable and click it
  //     const disposeButton = await this.page.locator(
  //       '//button[@title="Dispose ticket"]'
  //     );
  //     await disposeButton.waitFor({ state: "visible" });
  //     await disposeButton.click();
  //     console.log("Dispose button clicked successfully.");

  //     // Ensure the remark textbox is visible before interacting
  //     const disposeRemarkTextBox = await this.page.locator(
  //       '//textarea[@placeholder="Add remark"]'
  //     );
  //     await disposeRemarkTextBox.waitFor({ state: "visible", timeout: 15000 });
  //     await disposeRemarkTextBox.fill("Dispose test from QA");
  //     console.log("Remark added.");

  //     // Additional interactions...
  //     // e.g., Click other buttons or perform actions after disposing the ticket
  //   } catch (error) {
  //     console.error("Error in doDispose: ", error);
  //     if (this.page && this.page.isClosed()) {
  //       console.error("Page was closed unexpectedly.");
  //     }
  //     // Optionally take a screenshot for debugging
  //     await this.page.screenshot({ path: "error-screenshot.png" });
  //     throw new Error("An unexpected error occurred during doDispose.");
  //   }
  //   await this.page.getByRole("button", { name: "Refund Denied" }).click();
  //   // await this.page.getByRole("button", { name: "Refund CheckList" }).click();
  //   // await this.page.getByRole("button", { name: "Ticket Field" }).click();
  //   // await this.page.getByRole("button", { name: "Product Details*" }).click();
  //   // await this.page.getByRole("button", { name: "Refund Data*" }).click();
  //   // await this.page.getByLabel("Reverse pick up *").click();
  //   // await this.page.getByRole("option", { name: "No" }).click();
  //   // await page.getByLabel("Reverse pick up *").press("ControlOrMeta+-");
  //   // await page.getByLabel("Reverse pick up *").press("ControlOrMeta+-");
  //   // await page.getByLabel("Reverse pick up *").press("Tab");
  //   // await page.getByRole("button", { name: "SOR" }).press("Tab");
  //   // await page.getByLabel("Dispose this ticket").press("Enter");
  //   // await page.getByLabel("Dispose this ticket").press("ControlOrMeta+-");
  //   // await page.getByLabel("Dispose this ticket").press("ControlOrMeta+-");
  //   // await page.getByLabel("Dispose this ticket").press("ControlOrMeta+-");
  //   // await page.getByLabel("Dispose this ticket").press("ControlOrMeta+-");
  //   // await page.getByLabel("Dispose this ticket").press("ControlOrMeta+-");
  //   // await page.getByRole("button", { name: "Ticket Field" }).click();
  //   // await page.getByLabel("Agent Refunds").click();
  //   // await page.getByLabel("Agent Refunds").press("Tab");
  //   // await page.getByLabel("Employee Name").press("Tab");
  //   // await page.getByRole("textbox", { name: "Reverse pick up" }).press("Tab");
  //   // await page.getByRole("button", { name: "SOR" }).press("Tab");
  //   // await page.getByLabel("Dispose this ticket").press("Tab");
  //   // await page.getByLabel("Agent Refunds").click();
  //   // await page.getByLabel("Agent Refunds").press("Tab");
  //   // await page.getByLabel("Employee Name").press("Tab");
  //   // await page.getByRole("textbox", { name: "Reverse pick up" }).press("Tab");
  //   // await page.getByRole("button", { name: "SOR" }).press("Tab");
  //   await this.page.getByLabel("Dispose this ticket").press("Enter");
  // }
  async doDispose() {
    // Assuming this.page is already defined, start the sequence of actions

    await this.page.locator("#ticketdetailstab").getByRole("button").click(); // Click on the tab button
    await this.page.getByPlaceholder("Add remark").click(); // Focus on the remark field
    await this.page.getByPlaceholder("Add remark").fill("test"); // Fill remark with "test"

    // Interact with other buttons and fields
    await this.page.getByRole("button", { name: "Ticket Field" }).click();
    await this.page.getByRole("button", { name: "Product Details*" }).click();
    await this.page.getByRole("button", { name: "Refund Data*" }).click();

    // Reverse pick up actions
    await this.page.getByLabel("Reverse pick up *").click();
    await this.page.getByRole("option", { name: "No" }).click();
    await this.page.getByLabel("Reverse pick up *").press("ControlOrMeta+-");
    await this.page.getByLabel("Reverse pick up *").press("ControlOrMeta+-");
    await this.page.getByLabel("Reverse pick up *").press("Tab");

    // SOR button interactions
    await this.page.getByRole("button", { name: "SOR" }).press("Tab");

    // Dispose actions
    await this.page.getByLabel("Dispose this ticket").press("Enter");
    await this.page.getByLabel("Dispose this ticket").press("ControlOrMeta+-");
    await this.page.getByLabel("Dispose this ticket").press("ControlOrMeta+-");
    await this.page.getByLabel("Dispose this ticket").press("ControlOrMeta+-");
    await this.page.getByLabel("Dispose this ticket").press("ControlOrMeta+-");
    await this.page.getByLabel("Dispose this ticket").press("ControlOrMeta+-");

    // Additional button clicks
    await this.page.getByRole("button", { name: "Ticket Field" }).click();
    await this.page.getByLabel("Agent Refunds").click();
    await this.page.getByLabel("Agent Refunds").press("Tab");
    await this.page.getByLabel("Employee Name").press("Tab");
    await this.page
      .getByRole("textbox", { name: "Reverse pick up" })
      .press("Tab");
    await this.page.getByRole("button", { name: "SOR" }).press("Tab");
    await this.page.getByLabel("Dispose this ticket").press("Tab");

    // Repeat the Agent Refunds and Dispose actions
    await this.page.getByLabel("Agent Refunds").click();
    await this.page.getByLabel("Agent Refunds").press("Tab");
    await this.page.getByLabel("Employee Name").press("Tab");
    await this.page
      .getByRole("textbox", { name: "Reverse pick up" })
      .press("Tab");
    await this.page.getByRole("button", { name: "SOR" }).press("Tab");
    await this.page.getByLabel("Dispose this ticket").press("Enter");
  }
  async doSideConversation() {
    //await this.quickActionsBuuton.click();
    await this.elementClass.waitAndClick(quickActionsButton);
    console.log("quickActionsBuuton is clicked");
    //await this.sideConversationButton.click();
    await this.elementClass.waitAndClick(sideConversationButton);
    console.log("sideConversationButton is clicked");
    // await this.sideConversationToTextBox.fill("shankar.lamani@kapturecrm.com");
    await this.elementClass.waitAndFill(
      sideConversationToTextBox,
      "shankar.lamani@kapturecrm.com"
    );
    console.log("sideConversationToTextBox is filled");
    //await this.sideConversationToTextBox.press("Enter");
    await this.elementClass.keyPress(sideConversationToTextBox, "Enter");
    // await this.subjectTextBox.fill("test");
    await this.elementClass.waitAndFill(subjectTextBox, "test");
    // Locate the iframe element
    const iframeElement = this.page.locator(
      "//iframe[@title='Textbox.io Rich Text Editor - textboxio-editor-EmailTextBoxioEditor']"
    );

    // Get the frame object
    const frame = await iframeElement.contentFrame();

    // Now locate and interact with the target element inside the iframe
    const bodyTextBox = frame.locator(
      "//body[contains(@class, 'ephox-candy-mountain') and contains(@class, 'ephox-candy-mountain-active')]"
    );

    // Example: Type text into the bodyTextBox
    await bodyTextBox.type(
      " <Playwright> Test from QA <SideConversation functionality>"
    );
    console.log("bodyTextBox is filled");

    // // Locate the file input element
    // const fileInput = this.attachFileButton;

    // // Set the file to upload
    // const filePath = "C:\\Playwrite\\Generic\\Test_1.png"; // Ensure the path is correct
    // await fileInput.setInputFiles(filePath);

    // Optionally, trigger the upload action
    await this.sendButton.click();
    console.log("sendButton is clicked");
    await this.page.waitForTimeout(5000);
  }
}

export default TicketDetailsPage;
