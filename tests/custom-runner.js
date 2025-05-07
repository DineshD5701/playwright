const { exec } = require("child_process");

const testFiles = [
  "tests/BigasketOrdersTabTest.spec.js",
  "tests/BigasketSendMessage.spec.js",
];

async function runTestsSequentially() {
  for (const testFile of testFiles) {
    console.log(`Running test file: ${testFile}`);
    await new Promise((resolve, reject) => {
      exec(`npx playwright test ${testFile}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing ${testFile}:`, stderr);
          reject(error);
        } else {
          console.log(stdout);
          resolve();
        }
      });
    });
  }
  console.log("All tests executed in sequence.");
}

runTestsSequentially();
