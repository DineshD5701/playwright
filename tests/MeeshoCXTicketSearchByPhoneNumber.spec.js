import { test, expect } from "@playwright/test";
import MeeshoCXBaseClass from "../Generic/MeeshoCXBaseClass";
import TicketListPage from "../Pages/TicketListPage";
import TicketDetailspage from "../Pages/TicketDetailsPage";
const testdata = require("../Generic/TestData.json");

test("MeeshoCX MoreTickets Test", async ({ page }) => {
  // Call login via BaseClass
  const base = new MeeshoCXBaseClass(page);
  await base.setUp();

  const ticketListPage = new TicketListPage(page);
  await ticketListPage.doHandleLoginPopup();
  await ticketListPage.doValiadationForSearchTicket(
    testdata.MeeshoCXPhoneNumber
  );
  await ticketListPage.doExpendView();
  await ticketListPage.doClickOnSearchTciket();
  await ticketListPage.doValiadationForSearchTicket();

  const ticketDetailsPage = new TicketDetailspage(page);
  await ticketDetailsPage.doMoreTicketsTab();
});
