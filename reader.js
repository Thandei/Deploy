const fs = require('fs');
const { promisify } = require('util');
const path = require('path');

const readerAndSaveToMongo = async (graphqlResponses) => {
  // Array to store results from all GraphQL responses
  const allResults = [];

  // If graphqlResponses is an object, convert it to an array
  const responsesArray = Array.isArray(graphqlResponses) ? graphqlResponses : [graphqlResponses];

  // Iterate over each GraphQL response
  responsesArray.forEach((graphqlResponse, index) => {
    try {
      // Check if the element is a string before parsing
      const jsonString = typeof graphqlResponse === 'string' ? graphqlResponse : JSON.stringify(graphqlResponse);

      console.log(`GraphQL Response ${index + 1}:`, graphqlResponse);

      const jsonData = JSON.parse(jsonString);

      // Ensure jsonData has the expected structure
      const serpResponse = jsonData.data?.serpResponse;

      if (!serpResponse) {
        console.error(`Invalid JSON structure in GraphQL response ${index + 1}: Missing "serpResponse" attribute`);
        return; // Skip this iteration if the structure is not as expected
      }

      const edges = serpResponse.results?.edges || [];
      const results = [];

      edges.forEach((edge, index) => {
        const actor = edge?.relay_rendering_strategy?.view_model?.click_model?.story?.comet_sections?.content?.story?.comet_sections?.context_layout?.story?.comet_sections?.actor_photo?.story?.actors?.[0];
        const name = actor?.name;
        const profile = actor?.url;
        const postHashtag = edge?.relay_rendering_strategy?.view_model?.click_model?.story?.comet_sections?.content?.story?.comet_sections?.message?.story?.message?.ranges?.[0]?.entity?.mobileUrl;
        const postCaption = edge?.relay_rendering_strategy?.view_model?.click_model?.story?.comet_sections?.content?.story?.comet_sections?.message?.story?.message?.text;
        const postUrl = edge?.relay_rendering_strategy?.view_model?.click_model?.story?.comet_sections?.content?.story?.attachments?.[0]?.styles?.attachment?.url;
        const media = edge?.relay_rendering_strategy?.view_model?.click_model?.story?.comet_sections?.content?.story?.attachments?.[0]?.styles?.attachment?.all_subattachments?.nodes?.[0]?.url;

        const result = {
          name,
          profile,
          postHashtag,
          postCaption,
          postUrl,
          media,
        };

        results.push(result);
      });

      allResults.push(...results);
    } catch (parseError) {
      console.error(`Error parsing JSON from GraphQL response ${index + 1}:`, parseError);
    }
  });

  // Instead of saving to a file, return allResults
  return allResults;
};

module.exports = { readerAndSaveToMongo };
