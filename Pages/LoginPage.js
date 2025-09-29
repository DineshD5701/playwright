import BaseClass from "../Generic/BaseClass";
import ElementClass from "../Generic/ElemenetClass";
const { test, expect, chromium } = require("@playwright/test");
//const testdata = JSON.parse(JSON.stringify(require("../Generic/TestData.json")))
const testdata = require("../Generic/TestData.json");
import {
  usernametextFiled,
  passwordTextfield,
  loginButton,
  loginButton1,
  nextButtonForMeeshoSX,
} from "../PageElements/LoginPageElements";
class LoginPage {
  constructor(page) {
    this.page = page;
    // No need to reassign this.page as it's already done in the BaseClass constructor
    this.elementclass = new ElementClass(page); // Created an instance of ElementClass to access the methods
  }
  async login(username, password) {
    try {
      // Wait for username field to be visible
      console.log("Waiting for username field...");
      await this.page.waitForSelector(usernametextFiled, { state: "visible" });

      // Fill username
      console.log("Filling username...");

      await this.elementclass.waitAndFill(usernametextFiled, username);

      await this.elementclass.waitAndClick(nextButtonForMeeshoSX);

      // Wait for password field to be visible
      console.log("Filling password...");
      //await this.page.fill(passwordTextfield, password);
      await this.elementclass.waitAndFill(passwordTextfield, password);

      // Click login button
      console.log("Clicking login button...");
      // await this.page.click(loginButton);
      await this.elementclass.waitAndClick(loginButton1);

      // Navigate and validate login
      console.log("Navigating to NUI...");
      await this.page.goto(testdata.BigbasketNUIURL);

      await this.page.wa;

      const verifyLogin = this.page.locator(
        "//input[@placeholder='Search tickets...']"
      );
      console.log("Waiting for search field...");
      await this.page.waitForTimeout(3000);
      await expect(verifyLogin).toBeVisible();
      console.log("Logged in successfully! Test can continue.");
    } catch (error) {
      console.error("Error during login process:", error);
      throw error;
    }
  }
}

export default LoginPage;