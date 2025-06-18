import { test, expect } from "@playwright/test";
import MeeshoCXBaseClass from "../Generic/MeeshoCXBaseClass";
import TicketListPage from "../Pages/TicketListPage";
import TicketDetailspage from "../Pages/TicketDetailsPage";
const testdata = require("../Generic/TestData.json");

test("MeeshoCX MoreTickets Test", async ({ page }) => {
  await page.goto(testdata["MeeshoCXNUIURL"], { waitUntil: "networkidle" });
  const ticketListPage = new TicketListPage(page);
  await ticketListPage.doMeeshoCXSearchTicketWithTicketID;
  await ticketListPage.doExpendView();
  await ticketListPage.doClickOnSearchTciket();
  await ticketListPage.doValiadationForSearchTicket();
  const ticketDetailsPage = new TicketDetailspage(page);
  ticketDetailsPage.doMoreTicketsTab();
});
