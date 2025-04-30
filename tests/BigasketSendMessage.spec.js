import { test, expect } from "@playwright/test";
import BaseClass from "../Generic/BaseClass";
import TicketListPage from "../Pages/TicketListPage";
import TicketDetailspage from "../Pages/TicketDetailsPage";

test.beforeEach(async ({ page }) => {
  const basePage = new BaseClass(page); // Initialize BasePage
  await basePage.setUp(); // Setup and login
});

test("Bigbasket Send Message", async ({ page }) => {
  const ticketListPage = new TicketListPage(page);
  await ticketListPage.doSearchTicketWithTicketID();
  await ticketListPage.doExpendView();
  await ticketListPage.doClickOnSearchTciket();
  await ticketListPage.doValiadationForSearchTicket();

  const ticketDetailsPage = new TicketDetailspage(page);
  await ticketDetailsPage.doMessageSend();
});
