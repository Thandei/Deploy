const axios = require('axios');
const fs = require('fs').promises;

const profileUrl = 'https://www.instagram.com/api/v1/users/web_profile_info/';
const commentsBaseUrl = 'https://www.instagram.com/api/v1/media/';

const username = 'martiturkiye';

// Headers for the user profile request
const profileHeaders = {
  'Accept': '*/*',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'tr-TR,tr;q=0.9',
  'Connection': 'keep-alive',
  'Cookie': 'csrftoken=9sQSc96FDDM6Wmyx7LulZ5x0f3gTs8dE; ds_user_id=61890484666; rur="RVA\05461890484666\0541733995453:01f7e46d3e52890bf96c97345fa6a43412a46e79cca81b425aa239a986468fd9b1c47003"; sessionid=61890484666%3AKP0uLVCnYjFBak%3A18%3AAYdWPTSc4-POJrvQPFFQCYg3182IYuF_tLj9XN_zUg; dpr=2; shbid="13248\0548071259558\0541733764667:01f70c0b3190b87f714d8fa3746400e823ac784acf44b608f0c5a3cd2efe40be1dd9b6d7"; shbts="1702228667\0548071259558\0541733764667:01f74b0df27dbd64f3901a30308c4515abaf85ce36175c59bde35ca50939fbeb3a902215"; ig_did=C03C02FE-4A78-48D0-9421-92ED66D6D9D9; datr=w3wcZUhwpPnV4kuc4VE4JygZ; ig_nrcb=1; mid=ZRx8xQAEAAH8cFlp63dZn8eDNjYo',
  'Host': 'www.instagram.com',
  'Priority': 'u=3, i',
  'Referer': 'https://www.instagram.com/martiturkiye/',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5.1 Safari/605.1.15',
  'X-ASBD-ID': '129477',
  'X-CSRFToken': '9sQSc96FDDM6Wmyx7LulZ5x0f3gTs8dE',
  'X-IG-App-ID': '936619743392459',
  'X-IG-WWW-Claim': 'hmac.AR0u79Bj8lV2pzW8awuJjvRluNykJ_ppwK3rnf8VjY5_hsJv',
  'X-Requested-With': 'XMLHttpRequest'
};

// Headers for the comments request
const commentsHeaders = {
  'Accept': '*/*',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'tr-TR,tr;q=0.9',
  'Connection': 'keep-alive',
  'Cookie': 'csrftoken=9sQSc96FDDM6Wmyx7LulZ5x0f3gTs8dE; ds_user_id=61890484666; rur="RVA\05461890484666\0541734090045:01f7cdb37a06795728359233ef8e1f4079c784345afda922c4dd7295fba6a73a46fc60ec"; sessionid=61890484666%3AKP0uLVCnYjFBak%3A18%3AAYc8xby9Jw8XxTrKa2_anb9mxb95SpqLOqQABy-ZDw; dpr=2; shbid="13248\0548071259558\0541733764667:01f70c0b3190b87f714d8fa3746400e823ac784acf44b608f0c5a3cd2efe40be1dd9b6d7"; shbts="1702228667\0548071259558\0541733764667:01f74b0df27dbd64f3901a30308c4515abaf85ce36175c59bde35ca50939fbeb3a902215"; ig_did=C03C02FE-4A78-48D0-9421-92ED66D6D9D9; datr=w3wcZUhwpPnV4kuc4VE4JygZ; ig_nrcb=1; mid=ZRx8xQAEAAH8cFlp63dZn8eDNjYo',
  'Host': 'www.instagram.com',
  'Referer': 'https://www.instagram.com/p/C0TexUBgOAY/',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5.1 Safari/605.1.15',
  'X-ASBD-ID': '129477',
  'X-CSRFToken': '9sQSc96FDDM6Wmyx7LulZ5x0f3gTs8dE',
  'X-IG-App-ID': '936619743392459',
  'X-IG-WWW-Claim': 'hmac.AR0u79Bj8lV2pzW8awuJjvRluNykJ_ppwK3rnf8VjY5_ht5n',
  'X-Requested-With': 'XMLHttpRequest'
};

const getMediaIds = async () => {
  try {
    const response = await axios.get(profileUrl, {
      headers: profileHeaders,
      params: { username },
    });

    const mediaEdges = response.data.data.user.edge_owner_to_timeline_media.edges;

    // Extract 10 media IDs
    const mediaIds = mediaEdges.slice(0, 10).map(edge => edge.node.id);

    return mediaIds;
  } catch (error) {
    throw new Error(`Error fetching media IDs: ${error.message}`);
  }
};

const getCommentsForMediaId = async (mediaId) => {
  const url = `${commentsBaseUrl}${mediaId}/comments/?can_support_threading=true&permalink_enabled=false`;

  try {
    const response = await axios.get(url, { headers: commentsHeaders });

    const jsonFileName = `comments_${mediaId}.json`;
    await fs.writeFile(jsonFileName, JSON.stringify(response.data), 'utf-8');

    console.log(`Comments for Media ID ${mediaId} saved to ${jsonFileName}`);

    // Display comments for the current media ID
    console.log(`Comments for Media ID ${mediaId}:`, response.data);
  } catch (error) {
    console.error(`Error fetching comments for Media ID ${mediaId}: ${error.message}`);
  }
};

const getUserProfileAndComments = async () => {
  try {
    const mediaIds = await getMediaIds();

    for (const mediaId of mediaIds) {
      await getCommentsForMediaId(mediaId);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

getUserProfileAndComments();
