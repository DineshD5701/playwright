import { test, expect } from "@playwright/test";
import BaseClass from "../../Generic/BaseClass";
import TicketListPage from "../../Pages/TicketListPage";
const testdata = require("../../Generic/TestData.json");

test("BigBasket Ticket assignment", async ({ page }) => {
  await page.goto(testdata["BigbasketNUIURL"], { waitUntil: "networkidle" });
  const ticketListPage = new TicketListPage(page);
  await ticketListPage.doSearchTicketWithTicketID(testdata.BigbasketTicketID1);
  await ticketListPage.doExpendView();
  await ticketListPage.doTicketAssignment();
});
