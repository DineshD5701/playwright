import { test, expect } from "@playwright/test";
import BaseClass from "../Generic/BaseClass";
import TicketListPage from "../Pages/TicketListPage";
import TicketDetailspage from "../Pages/TicketDetailsPage";
const testdata = require("../Generic/TestData.json");

test("Bigbasket History Tab test", async ({ page }) => {
  await page.goto(testdata["BigbasketoldUI URL"], { waitUntil: "networkidle" });
  const ticketListPage = new TicketListPage(page);
  await ticketListPage.doSearchTicketWithTicketID();
  await ticketListPage.doExpendView();
  await ticketListPage.doClickOnSearchTciket();
  await ticketListPage.doValiadationForSearchTicket();

  const ticketDetailsPage = new TicketDetailspage(page);
  await ticketDetailsPage.doHistory();
});
