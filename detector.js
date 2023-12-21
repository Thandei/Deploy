const { parser } = require('./parser');
const fs = require('fs/promises');
const path = require('path');

const detector = async (graphqlResponses) => {

  const detectedResponses = [];

  function hasSerpResponse(data) {
    return data.includes('"serpResponse"');
  }

  graphqlResponses.forEach((response, index) => {
    const slicedData = response.slice(0, 50);

    if (hasSerpResponse(slicedData)) {
      detectedResponses.push(response);
    }
  });

  if (detectedResponses.length > 0) {
    try {
       
      return detectedResponses;
      
    } catch (error) {
      console.error('Error in detector:', error);
      return []; // Return an empty array if there's an error
    }
  } else {
    console.log('No GraphQL responses contain the "serpResponse" attribute.');
    return []; // Return an empty array if no responses are detected
  }
};

module.exports = { detector };


