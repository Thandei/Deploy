const fs = require('fs');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

const waitForFiles = async (pattern, maxAttempts = 10, delay = 1000) => {
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      const files = await readdir(__dirname);
      if (files.some(file => file.startsWith(pattern) && file.endsWith('.json'))) {
        return;
      }
    } catch (error) {
      console.error('Error reading directory:', error);
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  console.error('Timed out waiting for files to appear.');
};

const readerAndSaveToMongo = async () => {
  // Wait for output files to be created
  await waitForFiles('output_');

  // Read all output files matching the pattern
  const outputFiles = fs.readdirSync(__dirname, 'utf8').filter(file => file.startsWith('output_') && file.endsWith('.json'));

  if (outputFiles.length === 0) {
    console.log('No output files found.');
    return;
  }

  // Array to store results from all output files
  const allResults = [];

  // Iterate over each output file
  outputFiles.forEach(outputFile => {
    const filePath = `./${outputFile}`;

    // Read the content of each output file
    const data = fs.readFileSync(filePath, 'utf8');

    // Parse the Content into JSON
    try {
      const jsonData = JSON.parse(data);

      // Access and Log Attributes for Each Edge
      const edges = jsonData[0]?.serpResponse?.results?.edges || [];
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
      console.error(`Error parsing JSON from ${filePath}:`, parseError);
    }
  });

  // Save allResults to a single JSON file
  const combinedFilePath = './allResponse.json';
  fs.writeFile(combinedFilePath, JSON.stringify(allResults, null, 2), (writeErr) => {
    if (writeErr) {
      console.error(`Error writing to the output file ${combinedFilePath}:`, writeErr);
    } else {
      console.log(`All results have been successfully saved to ${combinedFilePath}`);
    }
  });
};

module.exports = { readerAndSaveToMongo };

readerAndSaveToMongo();
