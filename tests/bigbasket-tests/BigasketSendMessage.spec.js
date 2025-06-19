import { test, expect } from "@playwright/test";
import BaseClass from "../../Generic/BaseClass";
const testdata = require("../../Generic/TestData.json");
import TicketListPage from "../../Pages/TicketListPage";
import TicketDetailspage from "../../Pages/TicketDetailsPage";

test("Bigbasket Send Message", async ({ page }) => {
  await page.goto(testdata["BigbasketNUIURL"], { waitUntil: "networkidle" });
  const ticketListPage = new TicketListPage(page);
  await ticketListPage.doSearchTicketWithTicketID(testdata.BigbasketTicketID1);
  await ticketListPage.doExpendView();
  await ticketListPage.doClickOnSearchTciket();
  await ticketListPage.doValiadationForSearchTicket();

  const ticketDetailsPage = new TicketDetailspage(page);
  await ticketDetailsPage.doMessageSend();
});
