const fs = require('fs');
const { parser } = require('./parser');
const { readerAndSaveToMongo } = require('./reader');
const path = require("path")

const detector = async () => {
  const matchingFiles = [];

  // Function to check if the "serpResponse" attribute exists in the first 50 characters of the JSON string
  function hasSerpResponse(data) {
    return data.includes('"serpResponse"');
  }

  // Function to search for the "serpResponse" attribute in a file
  function searchForSerpResponse(filePath) {
    try {
      // Read the first 50 characters of the file
      const data = fs.readFileSync(filePath, 'utf8').slice(0, 50);

      // Check if the "serpResponse" attribute exists
      return hasSerpResponse(data);
    } catch (error) {
      console.log(`Error reading ${filePath}: ${error.message}`);
      return false;
    }
  }

  // Search for "serpResponse" attribute in multiple files
  for (let i = 1; i <= 50; i++) {
    // Use path.join to construct the absolute file path
    const filePath = path.join(__dirname, `raw_graphql_response_${i}.json`);

    if (fs.existsSync(filePath) && searchForSerpResponse(filePath)) {
      matchingFiles.push(filePath);
    }
  }

  // Process matching files
  if (matchingFiles.length > 0) {
    console.log('Processing matching files:', matchingFiles);
    for (const filePath of matchingFiles) {
      // Update the second argument to match the new output file naming convention
      parser(filePath);
    }

    
    
    
  } else {
    console.log('No files contain the "serpResponse" attribute.');
  }

  

 
};

module.exports = { detector };

