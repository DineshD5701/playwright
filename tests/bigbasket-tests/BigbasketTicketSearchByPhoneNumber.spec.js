import { test, expect } from "@playwright/test";
import BaseClass from "../../Generic/BaseClass";
import TicketListPage from "../../Pages/TicketListPage";
const testdata = require("../../Generic/TestData.json");

test("BigBasket Search Test by PhoneNumber ", async ({ page }) => {
  await page.goto(testdata["BigbasketNUIURL"], { waitUntil: "networkidle" });
  const ticketListPage = new TicketListPage(page);
  await ticketListPage.doSearchTicketWithPhoneNumber(
    testdata.BigbasketTicketID1
  );
  await ticketListPage.doExpendView();
  await ticketListPage.doClickOnSearchTciket();
  await ticketListPage.doValiadationForSearchTicket();
});
