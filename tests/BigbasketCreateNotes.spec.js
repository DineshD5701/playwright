import { test, expect } from "@playwright/test";
import BaseClass from "../Generic/BaseClass";
import TicketListPage from "../Pages/TicketListPage";
import TicketDetailspage from "../Pages/TicketDetailsPage";
const testdata = require("../Generic/TestData.json");

test("Bigbasket create Notes Test", async ({ page }) => {
  await page.goto(testdata["BigbasketNUIURL"], { waitUntil: "networkidle" });
  const ticketListPage = new TicketListPage(page);
  await ticketListPage.doSearchTicketWithTicketID();
  await ticketListPage.doExpendView();
  await ticketListPage.doClickOnSearchTciket();
  await ticketListPage.doValiadationForSearchTicket();

  const ticketDetailsPage = new TicketDetailspage(page);
  await ticketDetailsPage.doNotesTest();
});
