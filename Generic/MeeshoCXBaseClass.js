import MeeshoCXLoginPage from "../Pages/MeeshoCXLoginPage";
//const testata = JSON.parse(JSON.stringify(require("../Generic/TestData.json")));
const testdata = require("./TestData.json"); // Adjust path as needed
const { chromium } = require("playwright");

class MeeshoCXBaseClass {
  constructor(page) {
    this.page = page;
  }

  async setUp() {
    // Navigate to the URL
    await this.page.goto(testdata["MeeshoCXoldUI URL"], {
      waitUntil: "networkidle",
    });

    // Passing page object to LoginPage
    const loginPage = new MeeshoCXLoginPage(this.page);

    // Await login to ensure it completes
    // calling login method from LoginPage class(POM)
    await loginPage.meeshoCXlogin(
      testdata.MeeshoCXusername,
      testdata.MeeshoCXpassword
    );
  }
}

export default MeeshoCXBaseClass;
