import BaseClass from "../Generic/BaseClass";
// const { test, expect } = require("@playwright/test");
const testdata = require("../Generic/TestData.json");
import ElementClass from "../Generic/ElemenetClass";
import TicketListPage from "./TicketListPage";
import { test } from "@playwright/test";
test.setTimeout(60000); // Set timeout to 60 seconds
import {
  disposeRemarkTextBox,
  disposeButton,
  searchTextBox,
  disposeSubmitButton,
  dipositionFolderJobRelated,
  dipositionFolderOther,
  dipositionFolderT4Queries,
  dipositionFolderT4Related,
  dipositionFolderQuery,
  dipositionFolderDublicateCustomerSupport,
  orderCheckBox,
  allCompletedTab,
} from "../PageElements/DisposepageElement";

class TicketDisposePage {
  constructor(page) {
    this.page = page;
    this.elementclass = new ElementClass(page);
  }
  async doDispose() {
    //await this.disposeButton.click();
    await this.elementclass.waitAndClick(disposeButton);
    console.log("disposebutton is clicked");
    if (!(await this.page.isClosed())) {
      console.log("Waited for 2 seconds.");
    } else {
      console.log("The page is already closed.");
    }

    console.log("disposeRemarkTextBox is filled");
    await this.elementclass.waitAndClick(
      dipositionFolderDublicateCustomerSupport
    );
    console.log("dipositionFolderDublicateCustomerSupport is clicked");
    await this.elementclass.waitAndClick(dipositionFolderQuery);
    console.log(" dipositionFolderQuery is clicked");
    await this.elementclass.waitAndClick(dipositionFolderT4Related);
    console.log(" dipositionFolderT4Related is clicked");
    await this.elementclass.waitAndClick(dipositionFolderT4Queries);
    console.log(" dipositionFolderT4Queries is clicked");

    // await this.disposeRemarkTextBox.fill("Dispose test from QA");
    await this.elementclass.waitAndFill(
      disposeRemarkTextBox,
      "Dispose test from QA"
    );

    await this.elementclass.waitAndClick(orderCheckBox);
    console.log(" orderCheckBox is clicked");

    this.elementclass.waitAndClick(disposeSubmitButton);
    console.log("DisposeSubmitButton is clicked.");

    //Wait for 3 seconds after click
    await this.page.waitForTimeout(1000);
  }

  async doVerifyDisposition() {
    await this.page.waitForTimeout(5000);
    if (await searchTextBox.isVisible()) {
      console.log("searchTextBox is visble");
      //await this.allCompletedTab.click();
      await this.elementclass.waitAndClick(allCompletedTab);
      //await this.searchTextBox.fill("736149704013");
      await this.elementclass.waitAndFill(allCompletedTab, "736149704013");
      // await this.searchTextBox.press("Enter", { timeout: 60000 }); // Increase timeout to 60 seconds if necessary
      await this.elementclass.keyPress(searchTextBox, "Enter");
      console.log("pressed enter key");
    }
    // if (await this.completedStatus.isVisible()) {
    //   console.log("completedStatus is visble");
    // } else {
    //   console.log("completedStatus is not visble");
    // }
  }
}
export default TicketDisposePage;
