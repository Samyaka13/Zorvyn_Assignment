const postmanToOpenApi = require('postman-to-openapi');
const path = require('path');

async function convert() {
  try {
    const postmanCollection = path.join(__dirname, 'Finance Tracker API.postman_collection.json');
    const outputFile = path.join(__dirname, 'swagger.yaml');
    
    // Async/await
    const result = await postmanToOpenApi(postmanCollection, outputFile, { defaultTag: 'General' });
    console.log("Successfully created OpenAPI definition at " + outputFile);
  } catch (err) {
    console.log("Error converting:", err);
  }
}

convert();
