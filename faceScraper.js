const puppeteer = require('puppeteer');
const fs = require('fs/promises');
const {detector} = require("./detector");
const { readerAndSaveToMongo } = require('./reader');
const chromium = require('chrome-aws-lambda');
const path = require('path'); 

module.exports = async (searchQuery) => {
  const email = 'alperen.harmankasii@gmail.com';
  const password = 'Ekkolog3131,';
  const graphqlResponses = [];

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    executablePath: await chromium.executablePath,
    args: [
      ...chromium.args,
      '--start-maximized',
      '--disable-notifications',
    ],
  });

  const page = await browser.newPage();

  // Enable request interception
  await page.setRequestInterception(true);

  // Intercept network requests
  page.on('request', (request) => {
    request.continue();
  });

  // Intercept responses
  let isInterceptionEnabled = false;

  page.on('response', async (response) => {
    const requestUrl = response.url();
    const isGraphQLRequest = requestUrl.includes('https://www.facebook.com/api/graphql/');

    if (isGraphQLRequest) {
      try {
        const responseBody = await response.text();
        graphqlResponses.push(responseBody);

        // Uncomment the line below if you want to log responses to the console as well
        // console.log('Raw GraphQL Response:', responseBody);
      } catch (error) {
        console.error('Error getting raw GraphQL response:', error.message);
      }
    }
  });

  // Navigate to the login page
  await page.goto('https://www.facebook.com/', { waitUntil: 'networkidle2' });

  // Wait for the login form to appear
  await page.waitForSelector('input[name="email"]');
  await page.waitForSelector('input[name="pass"]');

  // Type in the email and password
  await page.type('input[name="email"]', email);
  await page.type('input[name="pass"]', password);

  // Click the login button
  await page.click('button[name="login"]');

  // Wait for navigation to complete
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // Open a new tab in the background
  const newPage = await browser.newPage();
  await newPage.goto('about:blank');
  await newPage.close();

  // Navigate to the search results page using the dynamic searchQuery
  await page.goto(`https://www.facebook.com/search/posts?q=${encodeURIComponent(searchQuery)}&filters=...`, { waitUntil: 'networkidle2' });

  // Enable interception only when on the specified page
  isInterceptionEnabled = true;

  // Continuously scroll down for 10 seconds
  const scrollInterval = setInterval(async () => {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }, 500);

  // Wait for 10 seconds to capture more GraphQL responses
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Disable interception and stop scrolling before closing the browser
  isInterceptionEnabled = false;
  clearInterval(scrollInterval);

  // Save each raw GraphQL response to a separate JSON file
  for (let i = 0; i < graphqlResponses.length; i++) {
    // Use path.join to construct the absolute file path
    const filePath = path.join(__dirname, `raw_graphql_response_${i + 1}.json`);
    await fs.writeFile(filePath, graphqlResponses[i]);
  }


  // Close the browser
  await browser.close();

  try {
    // Call detector asynchronously
    await detector();

    // Call readerAndSaveToMongo after detector completes
    await readerAndSaveToMongo();
  } catch (error) {
    console.error('Error in Puppeteer script:', error);
  }
};
