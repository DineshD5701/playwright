import { test } from "@playwright/test";

test("🧪 Run Full Suite Sequentially", async () => {
  // Just import files in order — this triggers their test definitions
  await import("./bigbasket-tests/01_BigbasketAllTabsTest.spec.js");
  await import("./bigbasket-tests/02_BigbasketAdvanceFilter.spec.js");
  await import("./meeshocx-tests/01_MeeshoCXTicketSearchByPhoneNumber.spec.js");
});
