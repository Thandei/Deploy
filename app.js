const express = require('express');
const { readerAndSaveToMongo } = require('./reader');
const fs = require('fs/promises');
const path = require('path'); // Add path module
const app = express();
const port = 3000;

app.get('/api/facebook', async (req, res) => {
  const userParam = req.query.faceInfo;
  console.log('User Param:', userParam);

  // Wait for the Puppeteer script to complete
  await require('./faceScraper')(userParam);

  try {
    // Use path.join to construct the absolute file path
    const jsonFilePath = path.join(__dirname, 'allResponse.json');
    const jsonResponse = await fs.readFile(jsonFilePath, 'utf-8');
  
    // Send the JSON response
    res.json(JSON.parse(jsonResponse));
  } catch (error) {
    console.error('Error reading allResponse.json:', error);
    res.status(500).json({ error: error.message }); // Send error details in the response
  }

  // Now, call readerAndSaveToMongo after the Puppeteer script has finished
  readerAndSaveToMongo();
});

app.get('/health', (req, res) => {
  res.send('OK');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
