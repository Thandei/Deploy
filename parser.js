const fs = require('fs');
const path = require('path');
const JSONStream = require('JSONStream');
const es = require('event-stream');
const { readerAndSaveToMongo } = require('./reader');

const parser = async (graphqlResponses) => {
  const processedData = [];

  graphqlResponses.forEach((response, index) => {
    // Further processing of the GraphQL response can be done here
    // In this example, we just push each response into the array
    processedData.push(response);
  });

  // Save the processed data to the output file
  // In this example, we're not saving it to a file, just logging it
  console.log('Processed Data:', processedData);

  try {
    // Call readerAndSaveToMongo after processing
    return processedData;
  } catch (error) {
    console.error('Error in parser:', error);
  }
};

module.exports = { parser };
