const express = require('express');
const { readerAndSaveToMongo } = require('./reader');
const fs = require('fs/promises');
const app = express();
const port = 3000;

app.get('/api/facebook', async (req, res) => {
  const userParam = req.query.faceInfo;
  console.log('User Param:', userParam);

  // Wait for the Puppeteer script to complete
  await require('./faceScraper')(userParam);

  try {
    // Read the contents of allResponses.json
    const jsonResponse = await fs.readFile('allResponse.json', 'utf-8');
  
    // Send the JSON response
    res.json(JSON.parse(jsonResponse));
  } catch (error) {
    console.error('Error reading allResponses.json:', error);
    res.status(500).json({ error: error.message }); // Send error details in the response
  }

  // Now, call readerAndSaveToMongo after the Puppeteer script has finished
  readerAndSaveToMongo();
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
