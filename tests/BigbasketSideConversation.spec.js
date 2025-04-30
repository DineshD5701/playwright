import { test, expect } from "@playwright/test";
import BaseClass from "../Generic/BaseClass";
import TicketListPage from "../Pages/TicketListPage";
import TicketDetailsPage from "../Pages/TicketDetailsPage";
test.beforeEach(async ({ page }) => {
  const basePage = new BaseClass(page); // Initialize BasePage
  await basePage.setUp(); // Setup and login
});

test("Bigbasket SideConversation Test ", async ({ page }) => {
  const ticketListPage = new TicketListPage(page);
  await ticketListPage.doSearchTicketWithTicketID();
  await ticketListPage.doExpendView();
  await ticketListPage.doClickOnSearchTciket();
  await ticketListPage.doValiadationForSearchTicket();

  const ticketDetailsPage = new TicketDetailsPage(page);
  await ticketDetailsPage.doSideConversation();
});
