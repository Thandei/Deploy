const fs = require('fs');
const JSONStream = require('JSONStream');
const es = require('event-stream');
const {readerAndSaveToMongo} = require("./reader");

// Parses the large chunk of raw GraphQL data
// Specify the file path
const parser = (inputFilePath) => {
  // Create a readable stream for the JSON file
  const jsonStream = fs.createReadStream(inputFilePath, { encoding: 'utf8' })
    .pipe(JSONStream.parse('*'));

  // Create an array to store the processed JSON objects
  const processedData = [];

  // Process the JSON stream
  jsonStream.pipe(es.mapSync((data) => {
    // Further processing of the JSON data can be done here
    // In this example, we just push each JSON object into the array
    processedData.push(data);
  }));

  // Handle errors
  jsonStream.on('error', (err) => {
    console.error('Error reading the JSON file:', err);
  });

  // Handle the end of the stream
  jsonStream.on('end', () => {
    // Extract the file number from the input file name
    const fileNumber = inputFilePath.match(/raw_graphql_response_(\d+)\.json/)[1];

    // Generate the output file name based on the input file number
    const outputFilePath = `output_${fileNumber}.json`;

    // Save the processed data to the output file
    fs.writeFile(outputFilePath, JSON.stringify(processedData, null, 2), (writeErr) => {
      if (writeErr) {
        console.error(`Error writing to ${outputFilePath}:`, writeErr);
      } else {
        console.log(`Data has been successfully saved to ${outputFilePath}`);
      }
    });
  });

  
};

module.exports = { parser };
