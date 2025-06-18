import BaseClass from "../Generic/BaseClass";
const { test, expect } = require("@playwright/test");
const testdata = require("../Generic/TestData.json");
import ElementClass from "../Generic/ElemenetClass";
import {
  searchTextBox,
  expendView,
  clickOnSearchTicket,
  ticketCheckBox,
  assignButton,
  assignTicketsubmitButton,
  assignRemarkTextBox,
  selectQueueOption,
  selectQueueButton,
  comppletedByMe,
  assignedToMeTab,
  AllJunks,
  allCompletedTab,
  allPendingTab,
  unAssignedTab,
  handleLoginPopUp,
} from "../PageElements/TicketListPageElements";
import { ticketDetailsTab } from "../PageElements/TicketListPageElements";
import {
  advanceFilterButton,
  advanceFilterSubmitButton,
} from "../PageElements/TicketListPageElements";

class TicketListPage {
  constructor(page) {
    this.page = page;
    this.elementClass = new ElementClass(page);
    // this.searchTextBox = page.locator(
    //   "//input[@placeholder='Search tickets...']"
    // );
    // this.expendView = page.locator("//button[@title='Expanded View']");
    // this.clickOnSearchTicket = page.locator(
    //   "(//div[@component='[object Object]'])[1]"
    // );
    // this.ticketDetailsTab = page.locator(
    //   '//button[@data-tabkeys="TICKET_DETAILS"]'
    // );
    this.notificationCrossIcon = page.locator('(//span[text()="close"])[2]');
    // this.ticketCheckBox = page.locator(
    //   "span[title='Ticket ID: 736149704013'] input[type='checkbox']"
    // );
    //this.assignButton = page.locator("//span[text()='Assign']");
    this.selectQueueButton = page.locator('//div[@label="Select Queue"]');
    this.selectQueueOption = page.locator('//div[@title="QAChatbot (Me)"]');
    this.assignRemarkTextBox = page.locator(
      '//textarea[@id="assign-ticket-remarks"]'
    );
    this.assignTicketsubmitButton = page.locator("//span[text()='Submit']");
    this.advanceFilterButton = page.locator('//span[@title="Advanced Filter"]');
    this.advanceFilterSubmitButton = page.locator('//span[text()="Submit"]');
  }

  // Search ticket with ticket ID
  async doSearchTicketWithTicketID(ticketID) {
    console.log("Waiting for input field to appear...");

    // Convert the selector string to a Locator object inside the method
    const searchTextBoxLocator = this.page.locator(searchTextBox);
    // Wait for the input field to be visible and enabled
    await searchTextBoxLocator.waitFor({ state: "visible" }); // Wait for visibility
    await expect(searchTextBoxLocator).toBeEnabled(); // Ensure the input field is enabled
    console.log("Input field is ready. Filling the ticket ID...");

    // Perform the fill operation
    //await this.searchTextBox.fill(ticketID);
    await this.elementClass.waitAndFill(searchTextBox, ticketID);
    await searchTextBoxLocator.press("Enter", { timeout: 60000 }); // Increase timeout to 60 seconds if necessary
    console.log("pressed enter key");
  }

  //expend View
  async doExpendView() {
    //await this.expendView.click();
    await this.elementClass.waitAndClick(expendView);
    console.log("ExpendView method is executed");
  }

  //To click on search ticket
  async doClickOnSearchTciket() {
    // await clickOnSearchTicket.waitFor({ state: "visible" });
    await this.elementClass.waitAndClick(clickOnSearchTicket);
    console.log("clickOnSearchTicket method is executed");
  }

  //validation for search Ticket
  async doValiadationForSearchTicket() {
    console.log("Waiting for TICKET_DETAILS button...");
    try {
      // Wait for page to load and network activity to settle
      await this.page.waitForLoadState("networkidle");

      // Wait for the button to be visible
      await ticketDetailsTab.waitFor({
        state: "visible",
        timeout: 5000,
      });
      console.log("Button is now visible!");

      // Click on the button
      await this.elementClass.waitAndClick(ticketDetailsTab);
      // await this.ticketDetailsTab.click();
      console.log("Clicked on the TICKET_DETAILS button!");
    } catch (error) {
      console.error("Error interacting with TICKET_DETAILS button:", error);
    }
    console.log("Validation successfull");
  }
  // Search ticket with PhoneNumber
  async doSearchTicketWithPhoneNumber(
    PhoneNumber = testdata.BigbasketPhoneNumber
  ) {
    console.log("Waiting for input field to appear...");

    // Convert the selector string to a Locator object inside the method
    const searchTextBoxLocator = this.page.locator(searchTextBox);
    // Wait for the input field to be visible and enabled
    await searchTextBoxLocator.waitFor({ state: "visible" }); // Wait for visibility
    await expect(searchTextBoxLocator).toBeEnabled(); // Ensure the input field is enabled
    console.log("Input field is ready. Filling the ticket ID...");

    // Perform the fill operation
    //await this.searchTextBox.fill(ticketID);
    await this.elementClass.waitAndFill(searchTextBox, PhoneNumber);
    await searchTextBoxLocator.press("Enter", { timeout: 60000 }); // Increase timeout to 60 seconds if necessary
    console.log("pressed enter key");
  }

  // Search ticket with E-mailId
  async doSearchTicketWithEmailID(EmailID = testdata.BigbasketEamilID) {
    console.log("Waiting for input field to appear...");

    // Convert the selector string to a Locator object inside the method
    const searchTextBoxLocator = this.page.locator(searchTextBox);
    // Wait for the input field to be visible and enabled
    await searchTextBoxLocator.waitFor({ state: "visible" }); // Wait for visibility
    await expect(searchTextBoxLocator).toBeEnabled(); // Ensure the input field is enabled
    console.log("Input field is ready. Filling the ticket ID...");

    // Perform the fill operation
    //await this.searchTextBox.fill(ticketID);
    await this.elementClass.waitAndFill(searchTextBox, EmailID);
    await searchTextBoxLocator.press("Enter", { timeout: 60000 }); // Increase timeout to 60 seconds if necessary
    console.log("pressed enter key");
  }

  //ticket assignment
  async doTicketAssignment() {
    try {
      console.log("Waiting for ticket checkbox...");
      await this.page.waitForSelector(
        "span[title='Ticket ID: 736149704013'] input[type='checkbox']",
        { state: "visible" }
      );
      console.log("Clicking on ticket checkbox...");
      // await this.ticketCheckBox.click();
      await this.elementClass.waitAndClick(ticketCheckBox);
      console.log("Ticket checkbox clicked successfully.");
    } catch (error) {
      console.error("Error during ticket assignment:", error);
    }

    // await this.assignButton.click();
    await this.elementClass.waitAndClick(assignButton);
    const elemenetClass = new ElementClass(this.page);
    // Convert XPath strings to Playwright locators
    const selectQueueButtonLocator = this.page.locator(selectQueueButton);
    const selectQueueOptionLocator = this.page.locator(selectQueueOption);
    await elemenetClass.doDropdownHandler(
      selectQueueButtonLocator,
      selectQueueOptionLocator
    );
    await this.elementClass.waitAndFill(assignRemarkTextBox, "test");
    await this.elementClass.waitAndClick(assignTicketsubmitButton);
    await this.page.waitForTimeout(3000);
  }

  //advance filter

  async doTicketAdvanceFileter() {
    //await this.advanceFilterButton.click();
    await this.elementClass.waitAndClick(advanceFilterButton);
    // await this.advanceFilterSubmitButton.click();
    await this.elementClass.waitAndClick(advanceFilterSubmitButton);
    await this.page.waitForTimeout(2000);
  }

  async doAllTabsTest() {
    await this.elementClass.waitAndClick(unAssignedTab);
    await this.page.waitForTimeout(2000);
    await this.elementClass.waitAndClick(allPendingTab);
    await this.page.waitForTimeout(2000);
    await this.elementClass.waitAndClick(allCompletedTab);
    await this.page.waitForTimeout(2000);
    await this.elementClass.waitAndClick(AllJunks);
    await this.page.waitForTimeout(2000);
    await this.elementClass.waitAndClick(assignedToMeTab);
    await this.page.waitForTimeout(2000);
    await this.elementClass.waitAndClick(comppletedByMe);
    await this.page.waitForTimeout(2000);
  }
  async doHandleLoginPopup() {
    if (await this.page.isVisible(handleLoginPopUp)) {
      await this.elementClass.waitAndClick(handleLoginPopUp);
    } else {
      console.log("Popup not visible, skipping click.");
    }
  }
}
export default TicketListPage;
