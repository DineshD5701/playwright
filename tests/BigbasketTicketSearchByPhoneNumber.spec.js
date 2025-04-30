import { test, expect } from "@playwright/test";
import BaseClass from "../Generic/BaseClass";
import TicketListPage from "../Pages/TicketListPage";
test.beforeEach(async ({ page }) => {
  const basePage = new BaseClass(page); // Initialize BasePage
  await basePage.setUp(); // Setup and login
});

test("BigBasket Search Test by PhoneNumber ", async ({ page }) => {
  const ticketListPage = new TicketListPage(page);
  await ticketListPage.doSearchTicketWithPhoneNumber();
  await ticketListPage.doExpendView();
  await ticketListPage.doClickOnSearchTciket();
  await ticketListPage.doValiadationForSearchTicket();
});
