import LoginPage from "../Pages/loge";
//const testata = JSON.parse(JSON.stringify(require("../Generic/TestData.json")));
const testdata = require("./TestData.json"); // Adjust path as needed
const { chromium } = require("playwright");

class BaseClass {
  constructor(page) {
    this.page = page;
  }

  async setUp() {
    // Navigate to the URL
    await this.page.goto(testdata["BigbasketoldUI URL"], {
      waitUntil: "networkidle",
    });

    // Passing page object to LoginPage
    const loginPage = new LoginPage(this.page);

    // Await login to ensure it completes
    // calling login method from LoginPage class(POM)
    await loginPage.login(
      testdata.Bigbasketusername,
      testdata.Bigbasketpassword
    );
  }
}

export default BaseClass;
