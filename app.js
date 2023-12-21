const express = require('express');
const { readerAndSaveToMongo } = require('./reader');
const puppeteerScript = require('./faceScraper'); // Import your Puppeteer script
const app = express();
const port = 3000;

app.get('/api/facebook', async (req, res) => {
  const userParam = req.query.faceInfo;
  console.log('User Param:', userParam);

  try {
    // Run the Puppeteer script and get the GraphQL responses
    const results = await puppeteerScript(userParam);

    res.send(results);

  } catch (error) {
    console.error('Error processing data:', error);
    res.status(500).json({ error: error.message }); // Send error details in the response
  }
});

app.get('/health', (req, res) => {
  res.send('OK');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
